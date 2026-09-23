import { Images, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, resolveImageUrl, type Product } from "@/lib/store";

export function ProductCard({ product, editMode, onOpen, onEdit, onDelete }: { product: Product; editMode: boolean; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  const galleryCount = product.images?.length ?? 1;
  return (
    <article className="group overflow-hidden border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Voir ${product.name}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img src={resolveImageUrl(product.image)} alt={`${product.name} ${product.model}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {galleryCount > 1 && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-background/90 px-1.5 py-1 text-[10px] font-bold sm:bottom-3 sm:left-3 sm:px-2 sm:text-xs"><Images className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{galleryCount} vues</span>}
        </div>
        <div className="p-3 sm:p-4"><p className="truncate text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs">{product.model}</p><h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold sm:min-h-0 sm:text-lg">{product.name}</h3><p className="mt-2 text-base font-extrabold text-orange-pop sm:text-xl">{formatPrice(product.price)}</p></div>
      </button>
      {editMode && <div className="flex gap-2 border-t border-border p-2 sm:p-3"><Button variant="outline" size="sm" className="min-w-0 flex-1 px-2" onClick={onEdit}><Pencil /><span className="hidden sm:inline">Modifier</span></Button><Button variant="destructive" size="icon-sm" onClick={onDelete} aria-label="Supprimer"><Trash2 /></Button></div>}
    </article>
  );
}