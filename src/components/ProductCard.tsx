import { Images, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/store";

export function ProductCard({ product, editMode, onOpen, onEdit, onDelete }: { product: Product; editMode: boolean; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  const galleryCount = product.images?.length ?? 1;
  return (
    <article className="group overflow-hidden border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Voir ${product.name}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img src={product.image} alt={`${product.name} ${product.model}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {galleryCount > 1 && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-background/90 px-2 py-1 text-xs font-bold"><Images className="h-3.5 w-3.5" />{galleryCount} vues</span>}
        </div>
        <div className="p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">{product.model}</p><h3 className="mt-1 text-lg font-bold">{product.name}</h3><p className="mt-2 text-xl font-extrabold text-orange-pop">{formatPrice(product.price)}</p></div>
      </button>
      {editMode && <div className="flex gap-2 border-t border-border p-3"><Button variant="outline" className="flex-1" onClick={onEdit}><Pencil />Modifier</Button><Button variant="destructive" size="icon" onClick={onDelete} aria-label="Supprimer"><Trash2 /></Button></div>}
    </article>
  );
}