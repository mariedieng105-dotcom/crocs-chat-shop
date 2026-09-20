import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/catalog-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat ?? "";
        if (!/^[A-Za-z0-9._-]+$/.test(key)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("catalog-images").download(key);
        if (error || !data) return new Response("Not found", { status: 404 });
        const ext = key.split(".").pop()?.toLowerCase();
        const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";
        return new Response(await data.arrayBuffer(), {
          headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
        });
      },
    },
  },
});
