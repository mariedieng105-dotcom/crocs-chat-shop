import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { formatPrice, orderLink, type Product } from "@/lib/store";

export function ProductCard({
  product,
  editMode,
  onEdit,
  onDelete,
}: {
  product: Product;
  editMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={`${product.name} ${product.model}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-lime-pop px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
          {product.category}
        </span>
        {editMode && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              onClick={onEdit}
              aria-label="Modifier le produit"
              className="rounded-full bg-background p-2 shadow-md"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              aria-label="Supprimer le produit"
              className="rounded-full bg-destructive p-2 text-destructive-foreground shadow-md"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{product.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{product.model}</p>
        </div>
        <p className="text-xl font-extrabold text-orange-pop">{formatPrice(product.price)}</p>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Taille
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background px-2 py-2 text-sm font-medium text-foreground"
            >
              {product.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Couleur
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background px-2 py-2 text-sm font-medium text-foreground"
            >
              {product.colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <a
          href={orderLink(`${product.name} (${product.model})`, size, color)}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          Commander sur WhatsApp
        </a>
      </div>
    </article>
  );
}
