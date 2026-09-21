import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const catalogSchema = z.object({
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    model: z.string(),
    price: z.number().nonnegative(),
    sizes: z.array(z.string()),
    colors: z.array(z.string()),
    image: z.string(),
    images: z.array(z.string()).optional(),
  })),
  texts: z.record(z.string()),
});

function sessionOptions() {
  return {
    password: process.env['SESSION_SECRET']!,
    name: "diaby-editor",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: process.env['NODE_ENV'] === "production", sameSite: "lax" as const, path: "/" },
  };
}

async function editorSession() {
  return useSession<{ unlocked?: boolean }>(sessionOptions());
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from("store_catalog").select("data").eq("id", "main").maybeSingle();
  if (error) throw new Error("Le catalogue est momentanément indisponible.");
  return data?.data ?? null;
});

export const getEditorStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await editorSession();
  return { unlocked: session.data.unlocked === true };
});

export const unlockEditor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const expected = process.env['SITE_PASSWORD'];
    if (!expected) throw new Error("Le mot de passe d’édition n’est pas configuré.");
    const enteredHash = createHash("sha256").update(data.password, "utf8").digest();
    const expectedHash = createHash("sha256").update(expected, "utf8").digest();
    if (!timingSafeEqual(enteredHash, expectedHash)) return { ok: false as const };
    const session = await editorSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockEditor = createServerFn({ method: "POST" }).handler(async () => {
  const session = await editorSession();
  await session.clear();
  return { ok: true as const };
});

export const saveCatalog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => catalogSchema.parse(input))
  .handler(async ({ data }) => {
    const session = await editorSession();
    if (!session.data.unlocked) throw new Error("Accès refusé.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("store_catalog").upsert({ id: "main", data, updated_at: new Date().toISOString() });
    if (error) throw new Error("Impossible d’enregistrer les changements.");
    return { ok: true as const };
  });

export const IMAGE_BUCKET = "catalog-images";
const PUBLIC_IMAGE_ORIGIN = "https://crocs-chat-shop.lovable.app";

export const uploadProductImages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    files: z.array(z.object({ name: z.string().max(200), dataUrl: z.string().max(15_000_000) })).min(1).max(20),
  }).parse(input))
  .handler(async ({ data }) => {
    const session = await editorSession();
    if (!session.data.unlocked) throw new Error("Accès refusé.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const urls: string[] = [];
    for (const file of data.files) {
      const match = /^data:([^;,]*);base64,(.+)$/.exec(file.dataUrl);
      if (!match) throw new Error("Format d’image non pris en charge.");
      let mime = (match[1] ?? "").toLowerCase();
      if (!mime.startsWith("image/")) {
        const nameExt = file.name.split(".").pop()?.toLowerCase() ?? "";
        mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" }[nameExt] ?? "";
      }
      if (!/^image\/(png|jpeg|jpg|webp|gif)$/.test(mime)) throw new Error("Format d’image non pris en charge.");
      const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1]!;
      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const bytes = Buffer.from(match[2] as string, "base64");
      const { error } = await supabaseAdmin.storage.from(IMAGE_BUCKET).upload(key, bytes, { contentType: mime, cacheControl: "31536000" });
      if (error) { console.error("[upload]", error); throw new Error(`Impossible d’envoyer la photo. (${error.message})`); }
      urls.push(`${PUBLIC_IMAGE_ORIGIN}/api/public/catalog-image/${key}`);
    }
    return { urls };
  });
