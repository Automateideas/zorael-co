/**
 * ZORAEL & CO. — IMAGE SOURCE (single swap point)
 * -------------------------------------------------
 * Every photograph on the site resolves through this file. To move from the
 * remote demo imagery to your own art direction, replace the base URLs below
 * (or point `img()` at your CDN / local `/public` assets). Nothing else in the
 * codebase needs to change.
 *
 * Current source: Unsplash (https://unsplash.com/license — free to use).
 * The <Media> component degrades to an on-brand placeholder if a URL fails,
 * so the layout is never broken while you swap assets in.
 */

const UNSPLASH = "https://images.unsplash.com/photo-";

/** Append Unsplash sizing/quality params to a raw photo id. */
export function img(id: string, w = 900, h?: number): string {
  const crop = h ? `&h=${h}&fit=crop` : "&fit=max";
  return `${UNSPLASH}${id}?auto=format&q=80&w=${w}${crop}`;
}

/** Curated photo ids grouped by intent. Swap freely. */
export const PHOTO = {
  // Editorial / models
  heroModel: "1490481651871-ab68de25d43d",
  heroModelAlt: "1483985988355-763728e1935b",
  editorialWoman: "1469334031218-e382a71b716b",
  editorialSaree: "1610030469983-98e550d6193c",
  brandStory: "1441984904996-e0b6ba687e04",
  aboutInterior: "1567401893414-76b7b1e5a7a5",

  // Clothes
  ivoryDress: "1595777457583-95e059d581b8",
  lehenga: "1610030469983-98e550d6193c",
  saffronSet: "1602573991155-21f0143bb45c",
  aureliaSaree: "1594633312681-425c7b97ccd1",
  noirSaree: "1469334031218-e382a71b716b",
  blushSet: "1596783074918-c84cb06531ca",
  velvetKurta: "1602573991155-21f0143bb45c",
  sereneDress: "1566174053879-31528523f8ae",

  // Jewellery
  necklaceGold: "1611085583191-a3b181a88401",
  serpentChoker: "1515562141207-7a88fb7ce338",
  pearlEarrings: "1535632066927-ab7c9ab60908",
  aureliaNecklace: "1599643478518-a784e5dc4c8f",
  crystalRing: "1605100804763-247f67b3557e",
  tennisBracelet: "1602752250015-52934bc45613",
  jewelleryFlat: "1573408301185-9146fe634ad0",

  // Hand bags
  luminaTote: "1584917865442-de89df76afd3",
  valoraBag: "1548036328-c9fa89d128fa",
  eclipseBag: "1590874103328-eac38a683ce7",
  nouraTote: "1566150905458-1bf1fc113f0d",
  handbagHero: "1594223274512-ad4803739b7c",
} as const;

export type PhotoKey = keyof typeof PHOTO;
