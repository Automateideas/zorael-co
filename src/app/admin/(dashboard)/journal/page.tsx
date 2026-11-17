import Link from "next/link";
import { Plus } from "lucide-react";
import { getJournalAdmin } from "./actions";
import { JournalTable } from "./journal-table";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const posts = await getJournalAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-charcoal">
            Journal
          </h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Editorial stories shown under the Journal page.
          </p>
        </div>
        <Link
          href="/admin/journal/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          New Post
        </Link>
      </div>

      <JournalTable posts={posts} />
    </div>
  );
}
