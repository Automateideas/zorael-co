# ZORAEL & CO. — CONTENT SYSTEM

## Voice
Elegant, concise, editorial, confident, understated.

Avoid hype, excessive exclamation marks, fake urgency and generic luxury clichés.

## Categories
Clothes: Dresses, Tops, Trousers, Outerwear, Knitwear.
Jewelry: Earrings, Necklaces, Bracelets, Rings.
Hand Bags: Shoulder Bags, Top Handle Bags, Crossbody Bags, Evening Bags.
Collections: editorial groupings.

## Product model
```ts
type Product = {
  id: string
  slug: string
  name: string
  category: "clothes" | "jewelry" | "hand-bags" | "collections"
  collection?: string
  price: number
  currency: string
  images: string[]
  description: string
  sizes?: string[]
  colors?: string[]
  materials?: string[]
  details?: string[]
}
```

## Collection model
```ts
type Collection = {
  id: string
  slug: string
  name: string
  description: string
  heroImage: string
  products: string[]
}
```

## Button copy
Prefer:
Shop Now / Explore / Discover / Add to Bag / View Collection / Continue Shopping.

Do not use:
BUY NOW!!! / LIMITED!!! / HURRY!!!

## Suggested newsletter
Title: The Zorael Edit
Text: Discover new collections, editorial stories, and considered pieces from Zorael & Co.
CTA: Subscribe

## Placeholder rule
Do not invent fake reviews, press mentions, awards, scarcity or social proof.
