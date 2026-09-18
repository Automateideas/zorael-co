import type { JournalPost } from "./types";
import { img, PHOTO } from "./images";

export const journalPosts: JournalPost[] = [
  {
    id: "j-quiet-luxury",
    slug: "the-art-of-quiet-luxury",
    title: "The Art of Quiet Luxury",
    excerpt:
      "Why the most considered wardrobes say the least — and last the longest.",
    category: "Philosophy",
    date: "2026-09-02",
    readingTime: "5 min read",
    coverImage: img(PHOTO.editorialWoman, 1400, 1050),
    body: [
      "Luxury has learned to lower its voice. The loudest logo is no longer the point; the point is the cut, the cloth, and the confidence to wear something twice.",
      "At Zorael & Co., we design for the long arc of a wardrobe. A piece should feel as considered in its third year as its first — the seams still true, the colour still soft, the silhouette still yours.",
      "This is the discipline of restraint: choosing the single right detail and letting the rest breathe. It is harder than decoration, and it is the whole of our craft.",
    ],
  },
  {
    id: "j-jewellery-guide",
    slug: "how-to-layer-fine-jewellery",
    title: "How to Layer Fine Jewellery",
    excerpt:
      "A simple approach to stacking necklaces and rings without losing the line.",
    category: "Style Guide",
    date: "2026-08-21",
    readingTime: "4 min read",
    coverImage: img(PHOTO.necklaceGold, 1400, 1050),
    body: [
      "Layering is a matter of rhythm, not quantity. Begin with a piece that sits close — a choker or a fine chain — and build outward in gentle steps.",
      "Vary the weight, not the tone. Our vermeil pieces are designed to share a warmth, so a delicate pearl earring and a sculptural choker read as one thought rather than two.",
      "When in doubt, remove one piece. The wrist, the throat, the hand — each asks for a little space to be seen.",
    ],
  },
  {
    id: "j-craft",
    slug: "inside-the-atelier",
    title: "Inside the Atelier",
    excerpt:
      "From first sketch to final stitch — the making of a Zorael piece.",
    category: "Craft",
    date: "2026-08-05",
    readingTime: "6 min read",
    coverImage: img(PHOTO.brandStory, 1400, 1050),
    body: [
      "Every collection begins on paper. A silhouette is drawn, redrawn, and held against the body long before a single length of cloth is cut.",
      "Our makers work in small runs, finishing seams by hand and pressing each garment to sit exactly as intended. Nothing is rushed to a calendar it does not deserve.",
      "The result is quiet: a garment that simply fits, and keeps fitting. That, to us, is the mark of true craft.",
    ],
  },
  {
    id: "j-bridal",
    slug: "dressing-for-the-occasion",
    title: "Dressing for the Occasion",
    excerpt:
      "Notes on ceremony, colour, and choosing pieces you'll return to.",
    category: "Occasion",
    date: "2026-07-18",
    readingTime: "5 min read",
    coverImage: img(PHOTO.lehenga, 1400, 1050),
    body: [
      "The best occasion dressing looks forward. Choose a piece for the celebration in front of you, but choose one you can imagine wearing again.",
      "Colour carries memory. A deep ruby, a warm saffron, a soft champagne — each holds an evening long after it ends.",
      "Balance the statement. If the garment speaks, let the jewellery whisper, and the other way around.",
    ],
  },
];

export function getJournalPost(slug: string): JournalPost | undefined {
  return journalPosts.find((p) => p.slug === slug);
}
