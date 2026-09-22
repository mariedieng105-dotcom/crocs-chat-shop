import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import limeAsset from "@/assets/crocs-lime.jpg.asset.json";
import pinkAsset from "@/assets/crocs-pink.jpg.asset.json";
import navyAsset from "@/assets/crocs-navy.jpg.asset.json";
import kidsAsset from "@/assets/crocs-kids.jpg.asset.json";
import { getCatalog, saveCatalog } from "@/lib/catalog.functions";
import { supabase } from "@/integrations/supabase/client";

export const WHATSAPP_NUMBER = "221783817581";
export const IMAGE_ORIGIN = "https://crocs-chat-shop.lovable.app";

export function resolveImageUrl(url: string) {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("/__l5e/assets-v1/") || url.startsWith("/api/public/catalog-image/")) return `${IMAGE_ORIGIN}${url}`;
  return url;
}

export type Product = {
  id: string;
  name: string;
  model: string;
  price: number;
  sizes: string[];
  colors: string[];
  image: string;
  images?: string[];
};

export type StoreData = { products: Product[]; texts: Record<string, string> };

export const defaultTexts: Record<string, string> = {
  heroTitle: "CROCS_DAKAR_221",
  heroSlogan: "Here is your satisfaction — le confort et le style des Crocs authentiques, livrés partout au Sénégal.",
  heroCta: "Découvrir la collection",
  shopTitle: "La Boutique",
  shopSubtitle: "Choisis ta pointure et ta couleur, on s'occupe du reste.",
  aboutTitle: "Authenticité. Confort. Style.",
  aboutText: "Diaby Store sélectionne des Crocs 100% authentiques. Confort au quotidien, coloris tendance et service client direct sur WhatsApp, de Dakar à tout le Sénégal.",
  value1: "Produits authentiques",
  value2: "Confort au quotidien",
  value3: "Style unique & coloré",
  footerNote: "Dakar, Sénégal · +221 78 381 75 81",
};

export const defaultData: StoreData = {
  texts: defaultTexts,
  products: [
    { id: "p1", name: "Crocs Classic Lime", model: "Classic Clog", price: 15000, sizes: ["40-41", "42-43", "44-45"], colors: ["Vert lime", "Noir"], image: limeAsset.url, images: [limeAsset.url] },
    { id: "p2", name: "Crocs Classic Rose", model: "Classic Clog", price: 15000, sizes: ["34-35", "36-37", "37-38", "38-39"], colors: ["Rose foncé", "Blanc"], image: pinkAsset.url, images: [pinkAsset.url] },
    { id: "p3", name: "Crocs Classic Navy", model: "Classic Clog", price: 16000, sizes: ["40-41", "42-43", "44-45"], colors: ["Bleu marine"], image: navyAsset.url, images: [navyAsset.url] },
    { id: "p4", name: "Crocs Kids", model: "Kids Clog", price: 10000, sizes: ["24-25", "26-27", "28-29", "30-31"], colors: ["Turquoise", "Rose"], image: kidsAsset.url, images: [kidsAsset.url] },
  ],
};

function splitValues(values: string[]) {
  return values.flatMap((value) => value.split(/[;,]/).map((part) => part.trim())).filter(Boolean);
}

function normalizeCatalog(data: StoreData): StoreData {
  return {
    ...data,
    products: data.products.map((product) => {
      const normalized = {
        ...product,
        sizes: splitValues(product.sizes ?? []),
        colors: splitValues(product.colors ?? []),
        image: resolveImageUrl(product.image),
      };
      return product.images ? { ...normalized, images: product.images.map(resolveImageUrl) } : normalized;
    }),
  };
}

export function useStore() {
  const [data, setData] = useState<StoreData>(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const pending = useRef(0);
  const fetchCatalog = useCallback(async () => {
    const { data: row, error } = await supabase.from("store_catalog").select("data").eq("id", "main").maybeSingle();
    if (error) return null;
    return (row?.data ?? null) as StoreData | null;
  }, []);

  const refresh = useCallback(async () => {
    if (pending.current > 0) return;
    const stored = await fetchCatalog();
    if (pending.current > 0) return;
    if (stored) setData(normalizeCatalog(stored));
  }, [fetchCatalog]);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((stored) => {
      if (active && stored) setData(normalizeCatalog(stored));
    }).finally(() => { if (active) setHydrated(true); });
    return () => { active = false; };
  }, [fetchCatalog]);


  // Synchronisation en direct (temps réel) pour tous les visiteurs
  useEffect(() => {
    const channel = supabase
      .channel("store-catalog")
      .on("postgres_changes", { event: "*", schema: "public", table: "store_catalog" }, (payload) => {
        const row = (payload.new ?? null) as { id?: string; data?: StoreData } | null;
        if (row?.id === "main" && row.data) {
          if (pending.current > 0) return;
          setData(normalizeCatalog(row.data));
        } else {
          void refresh();
        }
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refresh]);

  // Filet de sécurité si la connexion temps réel est coupée
  useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") void refresh(); };
    const timer = window.setInterval(tick, 15000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, [refresh]);

  const persist = useCallback((value: StoreData) => {
    pending.current += 1;
    setSaving(true);
    void persistCatalog({ data: value }).finally(() => {
      pending.current -= 1;
      if (pending.current === 0) setSaving(false);
    });
  }, [persistCatalog]);

  const update = useCallback((next: StoreData | ((current: StoreData) => StoreData)) => {
    setData((current) => {
      const value = typeof next === "function" ? next(current) : next;
      persist(value);
      return value;
    });
  }, [persist]);

  const reset = useCallback(() => {
    setData(defaultData);
    persist(defaultData);
  }, [persist]);

  return { data, update, reset, hydrated, saving, refresh };
}

export function waLink(message: string) { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`; }
export function orderLink(product: { name: string; model: string; price: number }, size: string, color: string, quantity = 1) {
  const total = product.price * quantity;
  return waLink(`Bonjour, je souhaite commander le produit : ${product.name}, Modèle : ${product.model}, Taille : ${size}, Couleur : ${color}, Quantité : ${quantity}, Prix unitaire : ${formatPrice(product.price)}, Total à payer : ${formatPrice(total)}.`);
}
export function formatPrice(price: number) { return `${price.toLocaleString("fr-FR")} FCFA`; }