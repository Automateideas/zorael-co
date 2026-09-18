"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/types";

export type CartItem = {
  id: string; // product id + variant key
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  size?: string;
  color?: string;
  quantity: number;
};

type StoreContextValue = {
  ready: boolean;
  items: CartItem[];
  wishlist: string[];
  cartCount: number;
  subtotal: number;
  addItem: (
    product: Product,
    opts?: { size?: string; color?: string; quantity?: number },
  ) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "zorael.cart.v1";
const WISH_KEY = "zorael.wishlist.v1";

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    // Hydrate from localStorage after mount (SSR-safe; avoids hydration mismatch).
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(readLS<CartItem[]>(CART_KEY, []));
    setWishlist(readLS<string[]>(WISH_KEY, []));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ready) writeLS(CART_KEY, items);
  }, [items, ready]);

  useEffect(() => {
    if (ready) writeLS(WISH_KEY, wishlist);
  }, [wishlist, ready]);

  const addItem = useCallback<StoreContextValue["addItem"]>(
    (product, opts) => {
      const size = opts?.size;
      const color = opts?.color;
      const quantity = opts?.quantity ?? 1;
      const id = [product.id, size, color].filter(Boolean).join("::");
      setItems((prev) => {
        const existing = prev.find((it) => it.id === id);
        if (existing) {
          return prev.map((it) =>
            it.id === id
              ? { ...it, quantity: it.quantity + quantity }
              : it,
          );
        }
        return [
          ...prev,
          {
            id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price,
            currency: product.currency,
            size,
            color,
            quantity,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((it) => it.id !== id)
        : prev.map((it) => (it.id === id ? { ...it, quantity } : it)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((p) => p !== productId)
        : [...prev, productId],
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const cartCount = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      ready,
      items,
      wishlist,
      cartCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toggleWishlist,
      isWishlisted,
    }),
    [
      ready,
      items,
      wishlist,
      cartCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toggleWishlist,
      isWishlisted,
    ],
  );

  return <StoreContext value={value}>{children}</StoreContext>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
