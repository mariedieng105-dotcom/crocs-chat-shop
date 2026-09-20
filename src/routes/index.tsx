import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Lock, Plus, Search, Settings2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import logoAsset from "@/assets/logo.jpg.asset.json";
import limeAsset from "@/assets/crocs-lime.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductEditor } from "@/components/ProductEditor";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { InstagramIcon, MailIcon, SnapchatIcon, TikTokIcon, WhatsAppIcon } from "@/components/SocialIcons";
import { getEditorStatus, lockEditor, unlockEditor } from "@/lib/catalog.functions";
import { useStore, waLink, WHATSAPP_NUMBER, type Product } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Diaby Store · Crocs authentiques à Dakar" },
    { name: "description", content: "Diaby Store : Crocs authentiques à Dakar. Découvrez chaque modèle sous plusieurs angles et commandez directement sur WhatsApp." },
    { property: "og:title", content: "Diaby Store · Crocs authentiques à Dakar" },
    { property: "og:description", content: "Confort, style et couleurs. Commandez vos Crocs directement sur WhatsApp." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const SOCIALS = [
  { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}`, icon: WhatsAppIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@crocs_dakar_221?_r=1&_t=ZS-99nMpGtSMIG", icon: TikTokIcon },
  { label: "Instagram", href: "https://www.instagram.com/diaby_store_?stkn=MTR0cThuYmlmZmZzeA==", icon: InstagramIcon },
  { label: "Snapchat", href: "https://www.snapchat.com/add/diaby_store?share_id=q4uMchdrSsO5Zu6Poetn5w&locale=fr_SN", icon: SnapchatIcon },
];

const STORE_EMAIL = "diabystore02@gmail.com";

function Index() {
  const { data, update, hydrated } = useStore();
  const status = useServerFn(getEditorStatus);
  const unlock = useServerFn(unlockEditor);
  const lock = useServerFn(lockEditor);
  const [editMode, setEditMode] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const texts = data.texts;
  const query = search.trim().toLowerCase();
  const visibleProducts = query
    ? data.products.filter((product) => [product.name, product.model, ...product.colors, ...product.sizes, String(product.price)].join(" ").toLowerCase().includes(query))
    : data.products;

  useEffect(() => { status().then(({ unlocked }) => setEditMode(unlocked)); }, [status]);

  const requestEdit = async () => {
    if (editMode) {
      await lock();
      setEditMode(false);
      return;
    }
    setShowUnlock(true);
  };

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await unlock({ data: { password } });
    if (!result.ok) { setPasswordError(true); return; }
    setPassword("");
    setPasswordError(false);
    setShowUnlock(false);
    setEditMode(true);
  };

  const setText = (key: string, value: string) => update((current) => ({ ...current, texts: { ...current.texts, [key]: value } }));
  const saveProduct = (product: Product) => {
    update((current) => ({ ...current, products: current.products.some((item) => item.id === product.id) ? current.products.map((item) => item.id === product.id ? product : item) : [...current.products, product] }));
    setEditing(null);
  };
  const addProduct = () => setEditing({ id: `p-${Date.now()}`, name: "Nouveau modèle", model: "Classic Clog", price: 15000, sizes: ["38-39", "40-41"], colors: ["Noir"], image: limeAsset.url, images: [limeAsset.url] });

  const EditableText = ({ name, as = "p", className = "" }: { name: string; as?: "h1" | "h2" | "p"; className?: string }) => {
    if (editMode) return <textarea value={texts[name] ?? ""} onChange={(event) => setText(name, event.target.value)} rows={2} className={`w-full border-2 border-dashed border-orange-pop bg-background p-2 ${className}`} />;
    const Tag = as;
    return <Tag className={className}>{texts[name]}</Tag>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#accueil" className="flex min-w-0 items-center gap-3"><img src={logoAsset.url} alt="Logo Diaby Store" className="h-10 w-10 shrink-0 rounded-full object-cover" /><span className="truncate font-display text-base font-bold sm:text-lg">DIABY STORE</span></a>
          <nav className="flex items-center gap-4 text-sm font-semibold"><a href="#boutique" className="hidden sm:inline">Boutique</a><a href="#apropos" className="hidden sm:inline">À propos</a></nav>
        </div>
      </header>

      {editMode && <div className="border-b border-orange-pop bg-orange-pop/10"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3"><p className="text-sm font-bold text-orange-pop">Mode édition partagé actif</p><div className="flex gap-2"><Button size="sm" onClick={addProduct}><Plus />Nouveau produit</Button><Button size="sm" variant="outline" onClick={requestEdit}><Lock />Verrouiller</Button></div></div></div>}

      <section id="accueil" className="overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="min-w-0 space-y-5"><span className="text-xs font-bold uppercase text-turquoise">Dakar, Sénégal</span><EditableText name="heroTitle" as="h1" className="break-words text-3xl leading-tight sm:text-5xl md:text-6xl" /><EditableText name="heroSlogan" className="text-base text-muted-foreground sm:text-lg" /><div className="flex flex-wrap gap-3"><Button asChild size="lg" className="bg-orange-pop text-primary-foreground hover:bg-orange-pop/90"><a href="#boutique">{texts["heroCta"]}</a></Button><Button asChild size="lg" variant="outline"><a href={waLink("Bonjour Diaby Store, je veux des infos sur vos Crocs.")} target="_blank" rel="noreferrer">Nous écrire</a></Button></div></div>
          <img src={logoAsset.url} alt="CROCS_DAKAR_221 — Diaby Store" width={1280} height={697} className="w-full border border-border object-cover shadow-xl" />
        </div>
      </section>

      <section id="boutique" className="mx-auto max-w-6xl px-4 py-12">
        <EditableText name="shopTitle" as="h2" className="text-3xl sm:text-4xl" /><EditableText name="shopSubtitle" className="mt-2 text-muted-foreground" />
        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un modèle, une couleur, une pointure…" aria-label="Rechercher un produit" className="h-11 w-full border border-input bg-background pl-9 pr-3 text-sm text-foreground" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{hydrated && visibleProducts.map((product) => <ProductCard key={product.id} product={product} editMode={editMode} onOpen={() => setSelected(product)} onEdit={() => setEditing(product)} onDelete={() => update((current) => ({ ...current, products: current.products.filter((item) => item.id !== product.id) }))} />)}</div>
        {hydrated && visibleProducts.length === 0 && <p className="mt-8 text-center text-muted-foreground">{data.products.length === 0 ? "Aucun produit pour le moment." : `Aucun résultat pour « ${search} ».`}</p>}
      </section>

      <section id="apropos" className="bg-secondary py-14"><div className="mx-auto max-w-4xl px-4 text-center"><EditableText name="aboutTitle" as="h2" className="text-3xl sm:text-4xl" /><EditableText name="aboutText" className="mx-auto mt-4 max-w-2xl text-muted-foreground" /><div className="mt-8 grid gap-4 sm:grid-cols-3">{["value1", "value2", "value3"].map((name) => <div key={name} className="border-t-4 border-primary bg-background p-5 shadow-sm"><EditableText name={name} className="font-bold" /></div>)}</div></div></section>

      <footer className="bg-ink py-12 text-primary-foreground"><div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3"><div><img src={logoAsset.url} alt="Diaby Store" className="h-14 w-14 rounded-full object-cover" /><p className="mt-3 text-sm opacity-80">{texts["footerNote"]}</p><a href={`mailto:${STORE_EMAIL}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-turquoise hover:underline"><MailIcon className="h-4 w-4" />{STORE_EMAIL}</a></div><div className="space-y-2 text-sm font-semibold"><p className="uppercase opacity-60">Navigation</p><a href="#accueil" className="block hover:text-turquoise">Accueil</a><a href="#boutique" className="block hover:text-turquoise">Boutique</a><a href="#apropos" className="block hover:text-turquoise">À propos</a></div><div className="space-y-2 text-sm font-semibold"><p className="uppercase opacity-60">Suivez-nous</p><div className="flex flex-wrap gap-3">{SOCIALS.map((social) => { const Icon = social.icon; return <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition hover:bg-whatsapp hover:text-white"><Icon className="h-5 w-5" /></a>; })}</div><Button asChild className="mt-3 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"><a href={waLink("Bonjour Diaby Store !")} target="_blank" rel="noreferrer">WhatsApp direct</a></Button></div></div><div className="mx-auto mt-8 max-w-6xl border-t border-primary-foreground/15 px-4 pt-6 text-center text-xs opacity-70">© {new Date().getFullYear()} Diaby Store · CROCS_DAKAR_221 · Tous droits réservés.<br />Site conçu par <a href="https://m2dtech.netlify.app/" target="_blank" rel="noreferrer" className="font-semibold text-turquoise hover:underline">M2D Tech</a></div></footer>

      <button type="button" onClick={requestEdit} aria-label={editMode ? "Verrouiller l'édition" : "Accès édition"} title={editMode ? "Verrouiller l'édition" : "Accès édition"} className="fixed bottom-3 right-3 z-20 grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground opacity-20 transition hover:opacity-80 focus:opacity-80">{editMode ? <Lock className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}</button>
      <WhatsAppFloat />

      {showUnlock && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 px-4"><form onSubmit={submitPassword} className="w-full max-w-sm bg-background p-6 shadow-xl"><div className="flex items-center gap-2"><Lock className="h-5 w-5" /><h2 className="text-xl">Accès édition</h2></div><label className="mt-5 block text-sm font-semibold">Mot de passe<input autoFocus type="password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError(false); }} className="mt-2 h-11 w-full border border-input bg-background px-3" /></label>{passwordError && <p className="mt-2 text-sm text-destructive">Mot de passe incorrect.</p>}<div className="mt-5 flex gap-2"><Button type="submit" className="flex-1">Déverrouiller</Button><Button type="button" variant="outline" onClick={() => setShowUnlock(false)}>Annuler</Button></div></form></div>}
      {editing && <ProductEditor initial={editing} onSave={saveProduct} onClose={() => setEditing(null)} />}
      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}