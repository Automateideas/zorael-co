"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, TrendingUp } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { Media } from "@/components/media";
import type { Product } from "@/lib/types";
import { popularSearches } from "@/lib/site";
import type { Collection } from "@/lib/types";

const RECENT_KEY = "zorael.recent-searches.v1";

export function SearchView({ collections }: { collections: Collection[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";

  const [query, setQuery] = useState(initial);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the field without scrolling the page to it.
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    // Keep the field in sync with the ?q= URL param.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initial);
  }, [initial]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { products: Product[] };
        setResults(data.products);
      } catch {
        /* aborted or offline — keep the previous results */
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const commit = (value: string) => {
    const v = value.trim();
    setQuery(v);
    router.replace(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
    if (v) {
      setRecent((prev) => {
        const next = [v, ...prev.filter((r) => r !== v)].slice(0, 5);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    }
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="container-zorael py-8 lg:py-12">
      <h1 className="font-serif text-3xl tracking-tight text-charcoal lg:text-4xl">
        Search
      </h1>

      {/* Search field */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commit(query);
        }}
        className="mt-6 flex items-center gap-3 rounded-full border border-border bg-white px-5 py-3.5 focus-within:border-muted-gold"
      >
        <Search className="size-5 text-muted-gold" strokeWidth={1.5} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your favourites..."
          aria-label="Search products"
          className="w-full bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => commit("")}
            aria-label="Clear search"
            className="text-charcoal/40 transition-colors hover:text-charcoal"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </form>

      {/* Results */}
      {query.trim() ? (
        <div className="mt-10">
          {results.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-charcoal/60">
                {results.length} {results.length === 1 ? "result" : "results"} for
                <span className="text-charcoal"> “{query}”</span>
              </p>
              <ProductGrid products={results} />
            </>
          ) : (
            <div className="rounded-lg border border-border bg-white py-20 text-center">
              <p className="font-serif text-2xl text-charcoal">
                No results for “{query}”.
              </p>
              <p className="mt-2 text-sm text-charcoal/60">
                Try a different term, or explore the collections.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex h-10 items-center rounded-full bg-charcoal px-6 text-sm text-ivory transition-colors hover:bg-black"
              >
                Browse the shop
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {/* Popular */}
          <section>
            <h2 className="text-sm font-medium text-charcoal">
              Popular Searches
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => commit(term)}
                  className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs text-charcoal/75 transition-colors hover:border-charcoal/40 hover:text-charcoal"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Trending */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <TrendingUp className="size-4 text-muted-gold" strokeWidth={1.5} />
              Trending Now
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {collections.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.slug}`}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="relative aspect-[4/3]">
                    <Media
                      src={c.heroImage}
                      alt={c.name}
                      sizes="(max-width:640px) 50vw, 25vw"
                      className="h-full w-full"
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                  </div>
                  <span className="absolute inset-x-0 bottom-0 p-3 font-serif text-sm text-ivory">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent */}
          {recent.length > 0 && (
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-charcoal">
                  Recent Searches
                </h2>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-charcoal/50 transition-colors hover:text-charcoal"
                >
                  Clear all
                </button>
              </div>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {recent.map((term) => (
                  <li
                    key={term}
                    className="flex items-center justify-between py-3"
                  >
                    <button
                      type="button"
                      onClick={() => commit(term)}
                      className="flex items-center gap-3 text-sm text-charcoal/75 transition-colors hover:text-charcoal"
                    >
                      <Search className="size-4 text-charcoal/40" strokeWidth={1.5} />
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRecent((prev) => {
                          const next = prev.filter((r) => r !== term);
                          try {
                            localStorage.setItem(
                              RECENT_KEY,
                              JSON.stringify(next),
                            );
                          } catch {
                            /* ignore */
                          }
                          return next;
                        })
                      }
                      aria-label={`Remove ${term}`}
                      className="text-charcoal/30 transition-colors hover:text-charcoal"
                    >
                      <X className="size-4" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
