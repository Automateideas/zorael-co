import Link from "next/link";
import { Plus } from "lucide-react";
import { getCollectionsAdmin } from "./actions";
import { CollectionTable } from "./collection-table";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getCollectionsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-charcoal">
            Collections
          </h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Curated edits shown under Shop → Collections.
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          New Collection
        </Link>
      </div>

      <CollectionTable collections={collections} />
    </div>
  );
}
