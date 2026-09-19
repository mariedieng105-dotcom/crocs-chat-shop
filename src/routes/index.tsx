import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Settings2, Plus, Trash2, Check, RotateCcw } from "lucide-react";
import logoAsset from "@/assets/logo.jpg.asset.json";
import limeImg from "@/assets/crocs-lime.jpg";
import { ProductCard } from "@/components/ProductCard";
import { ProductEditor } from "@/components/ProductEditor";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useStore, waLink, type Product } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diaby Store · Crocs authentiques à Dakar" },
      {
        name: "description",
        content:
          "Diaby Store (CROCS_DAKAR_221) : Crocs authentiques pour hommes, femmes et enfants à Dakar. Commande directement sur WhatsApp.",
      },
      { property: "og:title", content: "Diaby Store · Crocs authentiques à Dakar" },
      {
        property: "og:description",
        content: "Confort, style et couleurs. Commande tes Crocs sur WhatsApp au +221 78 381 75 81.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SOCIALS = [
  { label: "TikTok", href: "https://www.tiktok.com/@crocs_dakar_221?_r=1&_t=ZS-99nMpGtSMIG" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/diaby_store_?stkn=MTR0cThuYmlmZmZzeA==",
  },
  {
    label: "Snapchat",
    href: "https://www.snapchat.com/add/diaby_store?share_id=q4uMchdrSsO5Zu6Poetn5w&locale=fr_SN",
  },
];

function Index() {
  const { data, update, reset, hydrated } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [filter, setFilter] = useState<string>("Tout");
  const [newCat, setNewCat] = useState("");

  const t = data.texts;
  const setText = (key: string, value: string) =>
    update((d) => ({ ...d, texts: { ...d.texts, [key]: value } }));

  const visible = useMemo(
    () => (filter === "Tout" ? data.products : data.products.filter((p) => p.category === filter)),
    [data.products, filter],
  );

  const EditableText = ({
    k,
    as = "p",
    className,
  }: {
    k: string;
    as?: "h1" | "h2" | "p" | "span";
    className?: string;
  }) => {
    if (editMode) {
      return (
        <textarea
          value={t[k] ?? ""}
          onChange={(e) => setText(k, e.target.value)}
          rows={2}
          className={`w-full rounded-xl border-2 border-dashed border-orange-pop bg-background p-2 ${className ?? ""}`}
        />
      );
    }
    const Tag = as;
    return <Tag className={className}>{t[k]}</Tag>;
  };

  const saveProduct = (p: Product) => {
    update((d) => ({
      ...d,
      products: d.products.some((x) => x.id === p.id)
        ? d.products.map((x) => (x.id === p.id ? p : x))
        : [...d.products, p],
    }));
    setEditing(null);
  };

  const addProduct = () =>
    setEditing({
      id: `p-${Date.now()}`,
      name: "Nouveau modèle",
      model: "Classic Clog",
      price: 15000,
      sizes: ["38-39", "40-41"],
      colors: ["Noir"],
      image: limeImg,
      category: data.categories[0] ?? "Homme",
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <a href="#accueil" className="flex min-w-0 items-center gap-3">
            <img
              src={logoAsset.url}
              alt="Logo Diaby Store"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <span className="truncate font-display text-base font-bold sm:text-lg">
              DIABY STORE
            </span>
          </a>
          <nav className="flex shrink-0 items-center gap-4 text-sm font-semibold">
            <a href="#boutique" className="hidden hover:text-orange-pop sm:inline">
              Boutique
            </a>
            <a href="#apropos" className="hidden hover:text-orange-pop sm:inline">
              À propos
            </a>
            <button
              onClick={() => setEditMode((v) => !v)}
              aria-label="Mode édition"
              className={`rounded-full p-2 transition-colors ${editMode ? "bg-orange-pop text-white" : "bg-secondary"}`}
            >
              {editMode ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            </button>
          </nav>
        </div>
      </header>

      {editMode && (
        <div className="border-b border-orange-pop bg-orange-pop/10">
          <div className="mx-auto max-w-6xl space-y-3 px-4 py-4">
            <p className="text-sm font-bold uppercase tracking-wide text-orange-pop">
              Mode édition actif — vos modifications sont enregistrées dans ce navigateur
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {data.categories.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 rounded-full bg-background px-3 py-1 text-sm font-semibold"
                >
                  {c}
                  <button
                    aria-label={`Supprimer ${c}`}
                    onClick={() =>
                      update((d) => ({ ...d, categories: d.categories.filter((x) => x !== c) }))
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </span>
              ))}
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Nouvelle catégorie"
                className="rounded-full border border-input bg-background px-3 py-1 text-sm"
              />
              <button
                onClick={() => {
                  const v = newCat.trim();
                  if (!v) return;
                  update((d) => ({ ...d, categories: [...new Set([...d.categories, v])] }));
                  setNewCat("");
                }}
                className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addProduct}
                className="inline-flex items-center gap-1 rounded-full bg-lime-pop px-4 py-2 text-sm font-bold text-ink"
              >
                <Plus className="h-4 w-4" /> Nouveau produit
              </button>
              <button
                onClick={() => reset()}
                className="inline-flex items-center gap-1 rounded-full border border-input px-4 py-2 text-sm font-semibold"
              >
                <RotateCcw className="h-4 w-4" /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section id="accueil" className="relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-pop/40 blur-3xl" />
        <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-turquoise/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="space-y-5">
            <span className="inline-block rounded-full bg-turquoise/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-ink">
              Dakar, Sénégal
            </span>
            <EditableText
              k="heroTitle"
              as="h1"
              className="text-4xl leading-tight sm:text-5xl md:text-6xl"
            />
            <EditableText k="heroSlogan" className="text-base text-muted-foreground sm:text-lg" />
            <div className="flex flex-wrap gap-3">
              <a
                href="#boutique"
                className="rounded-2xl bg-orange-pop px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
              >
                {t.heroCta}
              </a>
              <a
                href={waLink("Bonjour Diaby Store, je veux des infos sur vos Crocs.")}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border-2 border-ink px-6 py-3 text-sm font-bold"
              >
                Nous écrire
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={logoAsset.url}
              alt="CROCS_DAKAR_221 — Diaby Store"
              width={1280}
              height={697}
              className="w-full rounded-3xl border border-border object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Boutique */}
      <section id="boutique" className="mx-auto max-w-6xl px-4 py-12">
        <EditableText k="shopTitle" as="h2" className="text-3xl sm:text-4xl" />
        <EditableText k="shopSubtitle" className="mt-2 text-muted-foreground" />

        <div className="mt-6 flex flex-wrap gap-2">
          {["Tout", ...data.categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                filter === c ? "bg-ink text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hydrated &&
            visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                editMode={editMode}
                onEdit={() => setEditing(p)}
                onDelete={() =>
                  update((d) => ({ ...d, products: d.products.filter((x) => x.id !== p.id) }))
                }
              />
            ))}
        </div>
        {hydrated && visible.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            Aucun produit dans cette catégorie pour le moment.
          </p>
        )}
      </section>

      {/* À propos */}
      <section id="apropos" className="bg-secondary/60 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <EditableText k="aboutTitle" as="h2" className="text-3xl sm:text-4xl" />
          <EditableText k="aboutText" className="mx-auto mt-4 max-w-2xl text-muted-foreground" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {(["value1", "value2", "value3"] as const).map((k, i) => (
              <div
                key={k}
                className="rounded-3xl bg-background p-5 shadow-sm"
                style={{
                  borderTop: `4px solid var(${["--lime-pop", "--orange-pop", "--turquoise"][i]})`,
                }}
              >
                <EditableText k={k} className="font-bold" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          <div className="space-y-3">
            <img
              src={logoAsset.url}
              alt="Diaby Store"
              loading="lazy"
              className="h-14 w-14 rounded-full object-cover"
            />
            <p className="text-sm opacity-80">{t.footerNote}</p>
          </div>
          <div className="space-y-2 text-sm font-semibold">
            <p className="uppercase tracking-widest opacity-60">Navigation</p>
            <a href="#accueil" className="block opacity-90 hover:opacity-100">
              Accueil
            </a>
            <a href="#boutique" className="block opacity-90 hover:opacity-100">
              Boutique
            </a>
            <a href="#apropos" className="block opacity-90 hover:opacity-100">
              À propos
            </a>
          </div>
          <div className="space-y-2 text-sm font-semibold">
            <p className="uppercase tracking-widest opacity-60">Suivez-nous</p>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="block opacity-90 hover:opacity-100"
              >
                {s.label}
              </a>
            ))}
            <a
              href={waLink("Bonjour Diaby Store !")}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-2xl bg-[#25D366] px-4 py-2 font-bold text-white"
            >
              WhatsApp direct
            </a>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />

      {editing && (
        <ProductEditor
          initial={editing}
          categories={data.categories.length ? data.categories : ["Homme"]}
          onSave={saveProduct}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
