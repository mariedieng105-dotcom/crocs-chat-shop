import { useState, type ChangeEvent } from "react";
import { Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/store";

const field = "mt-1 w-full border border-input bg-background px-3 py-2 text-sm text-foreground";
const labelCls = "block text-xs font-semibold uppercase text-muted-foreground";

export function ProductEditor({ initial, onSave, onClose }: { initial: Product; onSave: (product: Product) => void; onClose: () => void }) {
  const [product, setProduct] = useState(initial);
  const set = (patch: Partial<Product>) => setProduct((current) => ({ ...current, ...patch }));

  const onImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    }))).then((images) => set({ image: images[0] ?? product.image, images }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto bg-background p-5 sm:rounded-lg">
        <div className="flex items-center justify-between"><h3 className="text-xl font-bold">Produit</h3><Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer"><X /></Button></div>
        <div className="mt-4 grid gap-3">
          <label className={labelCls}>Nom<input className={field} value={product.name} onChange={(e) => set({ name: e.target.value })} /></label>
          <label className={labelCls}>Modèle<input className={field} value={product.model} onChange={(e) => set({ model: e.target.value })} /></label>
          <label className={labelCls}>Prix (FCFA)<input type="number" className={field} value={product.price} onChange={(e) => set({ price: Number(e.target.value) })} /></label>
          <label className={labelCls}>Pointures (séparées par des virgules)<input className={field} value={product.sizes.join(", ")} onChange={(e) => set({ sizes: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} /></label>
          <label className={labelCls}>Couleurs (séparées par des virgules)<input className={field} value={product.colors.join(", ")} onChange={(e) => set({ colors: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} /></label>
          <label className={labelCls}>Photos sous différents angles<input type="file" accept="image/*" multiple onChange={onImages} className={field} /></label>
          <div className="grid grid-cols-5 gap-2">{(product.images ?? [product.image]).map((image, index) => <img key={`${image}-${index}`} src={image} alt={`Vue ${index + 1}`} className="aspect-square w-full object-cover" />)}</div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Images className="h-4 w-4" />Sélectionnez plusieurs photos en une fois.</p>
        </div>
        <div className="mt-5 flex gap-2"><Button onClick={() => onSave(product)} className="flex-1">Enregistrer</Button><Button variant="outline" onClick={onClose}>Annuler</Button></div>
      </div>
    </div>
  );
}