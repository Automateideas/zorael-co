import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search/search-view";
import { getCollections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the ZORAEL & CO. collections.",
};

export default async function SearchPage() {
  const collections = await getCollections();
  return (
    <Suspense
      fallback={
        <div className="container-zorael py-12">
          <div className="h-10 w-40 animate-pulse rounded bg-cream" />
          <div className="mt-6 h-14 w-full animate-pulse rounded-full bg-cream" />
        </div>
      }
    >
      <SearchView collections={collections} />
    </Suspense>
  );
}
