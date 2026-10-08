export type Category = string;

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  collection?: string;
  price: number;
  currency: string;
  images: string[];
  description: string;
  rating?: number;
  reviews?: number;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  details?: string[];
  care?: string[];
  shipping?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  products: string[];
};

export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  coverImage: string;
  body: string[];
};
