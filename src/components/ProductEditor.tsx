import { useState, type ChangeEvent } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/store";

const field =
  "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground";
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function ProductEditor({
  initial,
  categories,
  onSave,
  onClose,
}: {
  initial: Product;
  categories: string[];
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [p, setP] = useState<Product>(initial);
  const set = (patch: Partial<Product>) => setP((prev) => ({ ...prev, ...patch }));

  const onImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ image: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-5 sm:rounded-3xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h3 className="truncate text-xl font-bold">Produit</h3>
          <button onClick={onClose} aria-label="Fermer" className="shrink-0 rounded-full p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={labelCls}>
            Nom
            <input className={field} value={p.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <label className={labelCls}>
            Modèle
            <input
              className={field}
              value={p.model}
              onChange={(e) => set({ model: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>
              Prix (FCFA)
              <input
                type="number"
                className={field}
                value={p.price}
                onChange={(e) => set({ price: Number(e.target.value) })}
              />
            </label>
            <label className={labelCls}>
              Catégorie
              <select
                className={field}
                value={p.category}
                onChange={(e) => set({ category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={labelCls}>
            Tailles (séparées par des virgules)
            <input
              className={field}
              value={p.sizes.join(", ")}
              onChange={(e) =>
                set({ sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
              }
            />
          </label>
          <label className={labelCls}>
            Couleurs (séparées par des virgules)
            <input
              className={field}
              value={p.colors.join(", ")}
              onChange={(e) =>
                set({ colors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
              }
            />
          </label>
          <label className={labelCls}>
            Image
            <input type="file" accept="image/*" onChange={onImage} className={field} />
          </label>
          {p.image && (
            <img
              src={p.image}
              alt="Aperçu"
              className="h-32 w-32 rounded-2xl object-cover"
              loading="lazy"
            />
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => onSave(p)}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
          >
            Enregistrer
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl border border-input px-4 py-3 text-sm font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
