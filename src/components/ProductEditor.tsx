import { useState, type ChangeEvent } from "react";
import { Images, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEditorPassword } from "@/lib/editor-session";
import { IMAGE_ORIGIN, resolveImageUrl, type Product } from "@/lib/store";

const field = "mt-1 w-full border border-input bg-background px-3 py-2 text-sm text-foreground";
const labelCls = "block text-xs font-semibold uppercase text-muted-foreground";

async function uploadImages(files: { name: string; dataUrl: string }[]) {
  const response = await fetch(`${IMAGE_ORIGIN}/api/public/upload-catalog-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: getEditorPassword(), files }),
  });
  if (!response.ok) throw new Error("upload");
  return (await response.json()) as { urls: string[] };
}

export function ProductEditor({ initial, onSave, onClose }: { initial: Product; onSave: (product: Product) => void; onClose: () => void }) {
  const [product, setProduct] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const set = (patch: Partial<Product>) => setProduct((current) => ({ ...current, ...patch }));


  const onImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setUploadError(false);
    try {
      const dataUrls = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      })));
      const { urls } = await uploadImages(dataUrls.map((dataUrl, i) => ({ name: files[i]?.name ?? `photo-${i}.jpg`, dataUrl })));
      const images = [...(product.images ?? []), ...urls];
      set({ image: product.images?.length ? product.image : (urls[0] ?? product.image), images });
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const images = (product.images ?? [product.image]).filter((_, i) => i !== index);
    set({ images, image: images[0] ?? product.image });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto bg-background p-5 sm:rounded-lg">
        <div className="flex items-center justify-between"><h3 className="text-xl font-bold">Produit</h3><Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer"><X /></Button></div>
        <div className="mt-4 grid gap-3">
          <label className={labelCls}>Nom<input className={field} value={product.name} onChange={(e) => set({ name: e.target.value })} /></label>
          <label className={labelCls}>Modèle<input className={field} value={product.model} onChange={(e) => set({ model: e.target.value })} /></label>
          <label className={labelCls}>Prix (FCFA)<input type="number" className={field} value={product.price} onChange={(e) => set({ price: Number(e.target.value) })} /></label>
          <label className={labelCls}>Pointures (séparées par des points-virgules ou virgules)<input className={field} value={product.sizes.join(" ; ")} onChange={(e) => set({ sizes: e.target.value.split(/[;,]/).map((value) => value.trim()).filter(Boolean) })} /></label>
          <label className={labelCls}>Couleurs (séparées par des points-virgules ou virgules)<input className={field} value={product.colors.join(" ; ")} onChange={(e) => set({ colors: e.target.value.split(/[;,]/).map((value) => value.trim()).filter(Boolean) })} /></label>
          <label className={labelCls}>Photos sous différents angles<input type="file" accept="image/*" multiple onChange={onImages} disabled={uploading} className={field} /></label>
          {uploading && <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Envoi des photos…</p>}
          {uploadError && <p className="text-xs font-semibold text-destructive">Envoi impossible, réessayez.</p>}
          <div className="grid grid-cols-5 gap-2">{(product.images ?? [product.image]).map((image, index) => (
            <div key={`${image}-${index}`} className="relative">
              <img src={resolveImageUrl(image)} alt={`Vue ${index + 1}`} className="aspect-square w-full object-cover" />
              <button type="button" onClick={() => removeImage(index)} aria-label={`Retirer la vue ${index + 1}`} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-foreground/70 text-background"><X className="h-3 w-3" /></button>
            </div>
          ))}</div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Images className="h-4 w-4" />Ajoutez autant de photos que vous voulez, en une ou plusieurs fois.</p>
        </div>
        <div className="mt-5 flex gap-2"><Button onClick={() => onSave(product)} disabled={uploading} className="flex-1">Enregistrer</Button><Button variant="outline" onClick={onClose}>Annuler</Button></div>
      </div>
    </div>
  );
}