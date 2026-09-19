import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import limeAsset from "@/assets/crocs-lime.jpg.asset.json";
import pinkAsset from "@/assets/crocs-pink.jpg.asset.json";
import navyAsset from "@/assets/crocs-navy.jpg.asset.json";
import kidsAsset from "@/assets/crocs-kids.jpg.asset.json";
import { getCatalog, saveCatalog } from "@/lib/catalog.functions";

export const WHATSAPP_NUMBER = "221783817581";

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

export function useStore() {
  const [data, setData] = useState<StoreData>(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const fetchCatalog = useServerFn(getCatalog);
  const persistCatalog = useServerFn(saveCatalog);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((stored) => {
      if (active && stored) setData(stored as StoreData);
    }).finally(() => { if (active) setHydrated(true); });
    return () => { active = false; };
  }, [fetchCatalog]);

  const update = useCallback((next: StoreData | ((current: StoreData) => StoreData)) => {
    setData((current) => {
      const value = typeof next === "function" ? next(current) : next;
      void persistCatalog({ data: value });
      return value;
    });
  }, [persistCatalog]);

  const reset = useCallback(() => {
    setData(defaultData);
    void persistCatalog({ data: defaultData });
  }, [persistCatalog]);

  return { data, update, reset, hydrated };
}

export function waLink(message: string) { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`; }
export function orderLink(name: string, size: string, color: string) { return waLink(`Bonjour, je souhaite commander le produit : ${name}, Taille : ${size}, Couleur : ${color}.`); }
export function formatPrice(price: number) { return `${price.toLocaleString("fr-FR")} FCFA`; }