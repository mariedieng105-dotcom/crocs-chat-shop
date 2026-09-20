import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, orderLink, type Product } from "@/lib/store";

export function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const gallery = product.images?.length ? product.images : [product.image];
  const [active, setActive] = useState(gallery[0] ?? product.image);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/60 p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="mx-auto min-h-full max-w-5xl bg-background sm:min-h-0 sm:rounded-lg">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-secondary p-4 sm:p-6">
            <div className="flex justify-end md:hidden">
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer"><X /></Button>
            </div>
            <div className="aspect-square overflow-hidden bg-background">
              <img src={active} alt={`${product.name}, vue sélectionnée`} className="h-full w-full object-contain" />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {gallery.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setActive(image)} aria-label={`Vue ${index + 1}`} className={`aspect-square overflow-hidden border-2 bg-background ${active === image ? "border-primary" : "border-border"}`}>
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 sm:p-8">
            <div className="hidden justify-end md:flex">
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer"><X /></Button>
            </div>
            <p className="text-xs font-bold uppercase text-muted-foreground">{product.model}</p>
            <h2 className="mt-2 text-3xl leading-tight">{product.name}</h2>
            <p className="mt-3 text-2xl font-extrabold">{formatPrice(product.price)}</p>

            <div className="mt-7 space-y-5">
              <fieldset>
                <legend className="mb-2 text-xs font-bold uppercase text-muted-foreground">Pointure</legend>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((item) => <Button key={item} type="button" variant={size === item ? "default" : "outline"} onClick={() => setSize(item)}>{item}</Button>)}
                </div>
              </fieldset>
              <label className="block text-xs font-bold uppercase text-muted-foreground">Couleur
                <select value={color} onChange={(event) => setColor(event.target.value)} className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm text-foreground">
                  {product.colors.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <div>
                <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Quantité</p>
                <div className="inline-flex items-center border border-input">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Diminuer"><Minus /></Button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity((value) => value + 1)} aria-label="Augmenter"><Plus /></Button>
                </div>
              </div>
            </div>
            <p className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm font-bold uppercase text-muted-foreground">Total<span className="text-xl font-extrabold text-orange-pop">{formatPrice(product.price * quantity)}</span></p>
            <Button asChild className="mt-4 h-12 w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90">
              <a href={orderLink(product, size, color, quantity)} target="_blank" rel="noreferrer">Commander sur WhatsApp</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
