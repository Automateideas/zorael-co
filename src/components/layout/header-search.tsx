"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
      }}
      className="group hidden w-full max-w-md items-center gap-2.5 rounded-full border border-border bg-white px-4 py-2.5 transition-colors focus-within:border-muted-gold lg:flex"
    >
      <Search className="size-4 text-muted-gold" strokeWidth={1.5} />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for your favourites..."
        aria-label="Search products"
        className="w-full bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
      />
    </form>
  );
}
