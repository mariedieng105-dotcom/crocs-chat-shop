import { useEffect, useState, useCallback } from "react";
import limeImg from "@/assets/crocs-lime.jpg";
import pinkImg from "@/assets/crocs-pink.jpg";
import navyImg from "@/assets/crocs-navy.jpg";
import kidsImg from "@/assets/crocs-kids.jpg";

export const WHATSAPP_NUMBER = "221783817581";

export type Product = {
  id: string;
  name: string;
  model: string;
  price: number;
  sizes: string[];
  colors: string[];
  image: string;
  category: string;
};

export type StoreData = {
  categories: string[];
  products: Product[];
  texts: Record<string, string>;
};

const STORAGE_KEY = "diaby-store-v1";

export const defaultTexts: Record<string, string> = {
  heroTitle: "CROCS_DAKAR_221",
  heroSlogan:
    "Here is your satisfaction — le confort et le style des Crocs authentiques, livrés partout au Sénégal.",
  heroCta: "Découvrir la collection",
  shopTitle: "La Boutique",
  shopSubtitle: "Hommes, femmes et enfants — choisis ta taille, ta couleur, on s'occupe du reste.",
  aboutTitle: "Authenticité. Confort. Style.",
  aboutText:
    "Diaby Store sélectionne des Crocs 100% authentiques pour toute la famille. Confort au quotidien, coloris tendance et un service client direct sur WhatsApp, de Dakar à tout le Sénégal.",
  value1: "Produits authentiques",
  value2: "Confort au quotidien",
  value3: "Style unique & coloré",
  footerNote: "Dakar, Sénégal · +221 78 381 75 81",
};

export const defaultData: StoreData = {
  categories: ["Homme", "Femme", "Enfant"],
  texts: defaultTexts,
  products: [
    {
      id: "p1",
      name: "Crocs Classic",
      model: "Classic Clog",
      price: 15000,
      sizes: ["40-41", "42-43", "44-45"],
      colors: ["Vert lime", "Noir"],
      image: limeImg,
      category: "Homme",
    },
    {
      id: "p2",
      name: "Crocs Classic",
      model: "Classic Clog",
      price: 15000,
      sizes: ["34-35", "36-37", "37-38", "38-39"],
      colors: ["Rose foncé", "Blanc"],
      image: pinkImg,
      category: "Femme",
    },
    {
      id: "p3",
      name: "Crocs Navy",
      model: "Classic Clog",
      price: 16000,
      sizes: ["40-41", "42-43", "44-45"],
      colors: ["Bleu marine"],
      image: navyImg,
      category: "Homme",
    },
    {
      id: "p4",
      name: "Crocs Kids",
      model: "Kids Clog",
      price: 10000,
      sizes: ["24-25", "26-27", "28-29", "30-31"],
      colors: ["Turquoise", "Rose"],
      image: kidsImg,
      category: "Enfant",
    },
  ],
};

export function loadData(): StoreData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      categories: parsed.categories ?? defaultData.categories,
      products: parsed.products ?? defaultData.products,
      texts: { ...defaultTexts, ...(parsed.texts ?? {}) },
    };
  } catch {
    return defaultData;
  }
}

export function useStore() {
  const [data, setData] = useState<StoreData>(defaultData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  const update = useCallback((next: StoreData | ((d: StoreData) => StoreData)) => {
    setData((prev) => {
      const value = typeof next === "function" ? (next as (d: StoreData) => StoreData)(prev) : next;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {
        /* quota */
      }
      return value;
    });
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
  }, []);

  return { data, update, reset, hydrated };
}

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function orderLink(name: string, size: string, color: string) {
  return waLink(
    `Bonjour, je souhaite commander le produit : ${name}, Taille : ${size}, Couleur : ${color}.`,
  );
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("fr-FR")} FCFA`;
}
