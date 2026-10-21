import { StorageBrowser } from "./storage-browser";

export const dynamic = "force-dynamic";

export default function StoragePage() {
  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-charcoal">
        Storage
      </h1>
      <p className="mt-1 text-sm text-charcoal/50">
        Browse, preview and remove files in Supabase Storage.
      </p>
      <StorageBrowser />
    </div>
  );
}
