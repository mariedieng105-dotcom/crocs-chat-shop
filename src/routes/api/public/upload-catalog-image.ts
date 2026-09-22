import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "node:crypto";

const IMAGE_BUCKET = "catalog-images";
const PUBLIC_IMAGE_ORIGIN = "https://crocs-chat-shop.lovable.app";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

export const Route = createFileRoute("/api/public/upload-catalog-image")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const expected = process.env["SITE_PASSWORD"];
        if (!expected) return json({ error: "config" }, 500);

        let payload: { password?: string; files?: { name?: string; dataUrl?: string }[] };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return json({ error: "bad_request" }, 400);
        }

        const password = String(payload.password ?? "");
        const a = createHash("sha256").update(password, "utf8").digest();
        const b = createHash("sha256").update(expected, "utf8").digest();
        if (!timingSafeEqual(a, b)) return json({ error: "unauthorized" }, 401);

        const files = (payload.files ?? []).slice(0, 20);
        if (!files.length) return json({ error: "no_files" }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const urls: string[] = [];
        for (const file of files) {
          const match = /^data:([^;,]*);base64,(.+)$/.exec(String(file.dataUrl ?? ""));
          if (!match) return json({ error: "format" }, 400);
          let mime = (match[1] ?? "").toLowerCase();
          if (!mime.startsWith("image/")) {
            const ext = String(file.name ?? "").split(".").pop()?.toLowerCase() ?? "";
            mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" }[ext] ?? "";
          }
          if (!/^image\/(png|jpeg|jpg|webp|gif)$/.test(mime)) return json({ error: "format" }, 400);
          const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1]!;
          const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
          const bytes = Buffer.from(match[2] as string, "base64");
          const { error } = await supabaseAdmin.storage.from(IMAGE_BUCKET).upload(key, bytes, { contentType: mime, cacheControl: "31536000" });
          if (error) return json({ error: error.message }, 500);
          urls.push(`${PUBLIC_IMAGE_ORIGIN}/api/public/catalog-image/${key}`);
        }
        return json({ urls });
      },
    },
  },
});
