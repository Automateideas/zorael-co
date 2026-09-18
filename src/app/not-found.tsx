import Link from "next/link";
import { Monogram } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="container-zorael flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Monogram className="text-5xl" />
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-charcoal sm:text-5xl">
        This page has slipped away.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/60">
        The page you&apos;re looking for may have moved or no longer exists. Let
        us guide you back to the collections.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-full border border-charcoal/70 px-7 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
        >
          Explore the Shop
        </Link>
      </div>
    </div>
  );
}
