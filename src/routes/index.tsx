import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Menu, Plus, Search, Settings2, X } from "lucide-react";
import logoAsset from "@/assets/logo.jpg.asset.json";
import limeAsset from "@/assets/crocs-lime.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductEditor } from "@/components/ProductEditor";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { InstagramIcon, MailIcon, SnapchatIcon, TikTokIcon, WhatsAppIcon } from "@/components/SocialIcons";
import { supabase } from "@/integrations/supabase/client";
import { clearEditorPassword, getEditorPassword, setEditorPassword } from "@/lib/editor-session";
import { resolveImageUrl, useStore, waLink, WHATSAPP_NUMBER, type Product } from "@/lib/store";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CrocsDakar 221 · Diaby Store — Crocs authentiques à Dakar" },
      { name: "description", content: "CrocsDakar 221 (Diaby Store) : Crocs authentiques pour toute la famille à Dakar, Sénégal. Découvrez chaque modèle sous plusieurs angles et commandez directement sur WhatsApp." },
      { property: "og:title", content: "CrocsDakar 221 · Diaby Store — Crocs authentiques à Dakar" },
      { property: "og:description", content: "Crocs authentiques à Dakar. Confort, style et couleurs — commandez directement sur WhatsApp." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://crocs-chat-shop.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://crocs-chat-shop.lovable.app/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "CrocsDakar 221",
        alternateName: ["Diaby Store", "CROCS_DAKAR_221"],
        url: "https://crocs-chat-shop.lovable.app/",
        description: "Crocs authentiques pour toute la famille à Dakar, Sénégal — commande directe sur WhatsApp.",
        address: { "@type": "PostalAddress", addressLocality: "Dakar", addressCountry: "SN" },
        contactPoint: { "@type": "ContactPoint", telephone: "+221783817581", contactType: "sales" },
      }),
    }],
  }),
  component: Index,
});

const SOCIALS = [
  { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}`, icon: WhatsAppIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@crocs_dakar_221?_r=1&_t=ZS-99nMpGtSMIG", icon: TikTokIcon },
  { label: "Instagram", href: "https://www.instagram.com/diaby_store_?stkn=MTR0cThuYmlmZmZzeA==", icon: InstagramIcon },
  { label: "Snapchat", href: "https://www.snapchat.com/add/diaby_store?share_id=q4uMchdrSsO5Zu6Poetn5w&locale=fr_SN", icon: SnapchatIcon },
];

const STORE_EMAIL = "diabystore02@gmail.com";

const PRODUCT_CATEGORIES = [
  { key: "classic", title: "CROCS CLASSIC", subtitle: "Le modèle emblématique" },
  { key: "spiderman", title: "CROCS SPIDERMAN", subtitle: "L’univers Marvel à vos pieds" },
  { key: "collaboration", title: "CROCS COLLABORATION", subtitle: "Les éditions spéciales" },
  { key: "sandals", title: "SANDALES", subtitle: "Légères et confortables" },
  { key: "pins", title: "PINS", subtitle: "Personnalisez vos Crocs" },
  { key: "other", title: "AUTRES MODÈLES", subtitle: "Découvrez toute la collection" },
] as const;

function getProductCategory(product: Product) {
  const value = `${product.name} ${product.model}`.toLowerCase();
  if (value.includes("pins")) return "pins";
  if (value.includes("sandal") || value.includes("saturday") || value.includes("saturdy")) return "sandals";
  if (value.includes("spiderman") || value.includes("spider-man")) return "spiderman";
  if (/collaboration|colloboration|naruto|star wars|bape|disney|nfl|batman|jujutsu|one pice|one piece|flash mcqueen/.test(value)) return "collaboration";
  if (value.includes("classic")) return "classic";
  return "other";
}

function Index() {
  const { data, update, hydrated } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [serverError, setServerError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [editing, setEditing] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const texts = data.texts;
  const query = search.trim().toLowerCase();
  const visibleProducts = query
    ? data.products.filter((product) => [product.name, product.model, ...product.colors, ...product.sizes, String(product.price)].join(" ").toLowerCase().includes(query))
    : data.products;
  const productSections = PRODUCT_CATEGORIES.map((category) => ({
    ...category,
    products: visibleProducts.filter((product) => getProductCategory(product) === category.key),
  })).filter((category) => category.products.length > 0);

  useEffect(() => {
    const saved = getEditorPassword();
    if (!saved) return;
    void supabase.rpc("check_editor_password", { p_password: saved }).then(({ data: ok }) => {
      if (ok === true) setEditMode(true);
      else clearEditorPassword();
    });
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("admin") === "1" || window.location.hash === "#admin") setShowUnlock(true);
  }, []);

  const requestEdit = async () => {
    if (editMode) {
      clearEditorPassword();
      setEditMode(false);
      return;
    }
    setShowUnlock(true);
  };

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");
    const { data: ok, error } = await supabase.rpc("check_editor_password", { p_password: password });
    if (error) {
      setServerError("Connexion impossible, vérifiez votre réseau puis réessayez.");
      return;
    }
    if (ok !== true) { setPasswordError(true); return; }
    setEditorPassword(password);
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
      <header className="sticky top-0 z-30 border-b border-primary-foreground/10 bg-ink text-primary-foreground shadow-lg">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:flex md:justify-between">
          <a href="#accueil" className="flex min-w-0 items-center gap-3" onClick={() => setMobileMenuOpen(false)}><img src={resolveImageUrl(logoAsset.url)} alt="Logo Diaby Store" className="h-12 w-12 shrink-0 object-cover sm:h-14 sm:w-14" /><span className="truncate font-display text-lg font-bold sm:text-xl">CROCSDKR</span></a>
          <nav className="hidden items-center gap-7 text-sm font-bold md:flex"><a href="#accueil" className="transition hover:text-turquoise">Accueil</a><a href="#boutique" className="transition hover:text-turquoise">Boutique</a><a href="#apropos" className="transition hover:text-turquoise">À propos</a><Button asChild className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"><a href={waLink("Bonjour Diaby Store, je veux des infos sur vos Crocs.")} target="_blank" rel="noreferrer"><WhatsAppIcon />Commander</a></Button></nav>
          <Button type="button" variant="ghost" size="icon" className="shrink-0 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</Button>
        </div>
        {mobileMenuOpen && <nav className="border-t border-primary-foreground/10 px-4 py-3 md:hidden"><div className="mx-auto grid max-w-6xl gap-1 text-sm font-bold"><a href="#accueil" onClick={() => setMobileMenuOpen(false)} className="py-2">Accueil</a><a href="#boutique" onClick={() => setMobileMenuOpen(false)} className="py-2">Boutique</a><a href="#apropos" onClick={() => setMobileMenuOpen(false)} className="py-2">À propos</a><a href={waLink("Bonjour Diaby Store, je veux des infos sur vos Crocs.")} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 text-turquoise"><WhatsAppIcon className="h-5 w-5" />Commander sur WhatsApp</a></div></nav>}
      </header>

      {editMode && <div className="border-b border-orange-pop bg-orange-pop/10"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3"><p className="text-sm font-bold text-orange-pop">Mode édition partagé actif</p><div className="flex gap-2"><Button size="sm" onClick={addProduct}><Plus />Nouveau produit</Button><Button size="sm" variant="outline" onClick={requestEdit}><Lock />Verrouiller</Button></div></div></div>}

      <section id="accueil" className="overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="min-w-0 space-y-5"><span className="text-xs font-bold uppercase text-turquoise">Dakar, Sénégal</span><EditableText name="heroTitle" as="h1" className="break-words text-3xl leading-tight sm:text-5xl md:text-6xl" /><EditableText name="heroSlogan" className="text-base text-muted-foreground sm:text-lg" /><div className="flex flex-wrap gap-3"><Button asChild size="lg" className="bg-orange-pop text-primary-foreground hover:bg-orange-pop/90"><a href="#boutique">{texts["heroCta"]}</a></Button><Button asChild size="lg" variant="outline"><a href={waLink("Bonjour Diaby Store, je veux des infos sur vos Crocs.")} target="_blank" rel="noreferrer">Nous écrire</a></Button></div></div>
          <img src={resolveImageUrl(logoAsset.url)} alt="CROCS_DAKAR_221 — Diaby Store" width={1280} height={697} className="w-full border border-border object-cover shadow-xl" />
        </div>
      </section>

      <section id="boutique" className="mx-auto max-w-6xl px-4 py-12">
        <EditableText name="shopTitle" as="h2" className="text-3xl sm:text-4xl" /><EditableText name="shopSubtitle" className="mt-2 text-muted-foreground" />
        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un modèle, une couleur, une pointure…" aria-label="Rechercher un produit" className="h-11 w-full border border-input bg-background pl-9 pr-3 text-sm text-foreground" />
        </div>
        {hydrated && productSections.map((category) => (
          <section key={category.key} className="mt-12 first:mt-8" aria-labelledby={`category-${category.key}`}>
            <div className="mb-6 text-center">
              <h3 id={`category-${category.key}`} className="font-display text-2xl leading-tight sm:text-4xl">{category.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{category.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{category.products.map((product) => <ProductCard key={product.id} product={product} editMode={editMode} onOpen={() => setSelected(product)} onEdit={() => setEditing(product)} onDelete={() => update((current) => ({ ...current, products: current.products.filter((item) => item.id !== product.id) }))} />)}</div>
          </section>
        ))}
        {hydrated && visibleProducts.length === 0 && <p className="mt-8 text-center text-muted-foreground">{data.products.length === 0 ? "Aucun produit pour le moment." : `Aucun résultat pour « ${search} ».`}</p>}
      </section>

      <section id="apropos" className="bg-secondary py-14"><div className="mx-auto max-w-4xl px-4 text-center"><EditableText name="aboutTitle" as="h2" className="text-3xl sm:text-4xl" /><EditableText name="aboutText" className="mx-auto mt-4 max-w-2xl text-muted-foreground" /><div className="mt-8 grid gap-4 sm:grid-cols-3">{["value1", "value2", "value3"].map((name) => <div key={name} className="border-t-4 border-primary bg-background p-5 shadow-sm"><EditableText name={name} className="font-bold" /></div>)}</div></div></section>

      <footer className="bg-ink py-12 text-primary-foreground"><div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3"><div><img src={resolveImageUrl(logoAsset.url)} alt="Diaby Store" className="h-14 w-14 rounded-full object-cover" /><p className="mt-3 text-sm opacity-80">{texts["footerNote"]}</p><a href={`mailto:${STORE_EMAIL}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-turquoise hover:underline"><MailIcon className="h-4 w-4" />{STORE_EMAIL}</a></div><div className="space-y-2 text-sm font-semibold"><p className="uppercase opacity-60">Navigation</p><a href="#accueil" className="block hover:text-turquoise">Accueil</a><a href="#boutique" className="block hover:text-turquoise">Boutique</a><a href="#apropos" className="block hover:text-turquoise">À propos</a></div><div className="space-y-2 text-sm font-semibold"><p className="uppercase opacity-60">Suivez-nous</p><div className="flex flex-wrap gap-3">{SOCIALS.map((social) => { const Icon = social.icon; return <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition hover:bg-whatsapp hover:text-white"><Icon className="h-5 w-5" /></a>; })}</div><Button asChild className="mt-3 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"><a href={waLink("Bonjour Diaby Store !")} target="_blank" rel="noreferrer">WhatsApp direct</a></Button></div></div><div className="mx-auto mt-8 max-w-6xl border-t border-primary-foreground/15 px-4 pt-6 text-center text-xs opacity-70">© {new Date().getFullYear()} Diaby Store · CROCS_DAKAR_221 · Tous droits réservés.<br />Site conçu par <a href="https://m2dtech.netlify.app/" target="_blank" rel="noreferrer" className="font-semibold text-turquoise hover:underline">M2D Tech</a></div></footer>

      <button type="button" onClick={requestEdit} aria-label={editMode ? "Verrouiller l'édition" : "Accès édition"} title={editMode ? "Verrouiller l'édition" : "Accès édition"} className="fixed bottom-24 right-3 z-40 grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground opacity-30 transition hover:opacity-90 focus:opacity-90">{editMode ? <Lock className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}</button>
      <WhatsAppFloat />

      {showUnlock && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 px-4"><form onSubmit={submitPassword} className="w-full max-w-sm bg-background p-6 shadow-xl"><div className="flex items-center gap-2"><Lock className="h-5 w-5" /><h2 className="text-xl">Accès édition</h2></div><label className="mt-5 block text-sm font-semibold">Mot de passe<input autoFocus type="password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError(false); setServerError(""); }} className="mt-2 h-11 w-full border border-input bg-background px-3" /></label>{passwordError && <p className="mt-2 text-sm text-destructive">Mot de passe incorrect.</p>}{serverError && <p className="mt-2 text-sm text-destructive">{serverError}</p>}<div className="mt-5 flex gap-2"><Button type="submit" className="flex-1">Déverrouiller</Button><Button type="button" variant="outline" onClick={() => setShowUnlock(false)}>Annuler</Button></div></form></div>}
      {editing && <ProductEditor initial={editing} onSave={saveProduct} onClose={() => setEditing(null)} />}
      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}