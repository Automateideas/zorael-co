"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Check, Folder, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { browseStorage, type BrowseResult } from "./actions";

/**
 * Picks images that are already in Supabase Storage, so the same file is not
 * uploaded twice. `alreadyAdded` URLs are shown but cannot be re-selected.
 */
export function ImagePicker({
  alreadyAdded,
  onClose,
  onConfirm,
  saving = false,
}: {
  alreadyAdded: string[];
  onClose: () => void;
  onConfirm: (urls: string[]) => void;
  saving?: boolean;
}) {
  const [prefix, setPrefix] = useState("");
  const [data, setData] = useState<BrowseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const load = useCallback(async (next: string) => {
    setLoading(true);
    setError(null);
    try {
      setData(await browseStorage(next));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(prefix);
  }, [prefix, load]);

  const toggle = (url: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });

  const crumbs = prefix ? prefix.split("/") : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
      aria-label="Choose existing images"
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="font-serif text-lg tracking-tight text-charcoal">
            Choose from library
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:bg-cream hover:text-charcoal"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1 border-b border-border px-5 py-2.5 text-xs text-charcoal/50">
          <button
            onClick={() => setPrefix("")}
            className="transition-colors hover:text-charcoal"
          >
            All files
          </button>
          {crumbs.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="size-3" strokeWidth={1.5} />
              <button
                onClick={() => setPrefix(crumbs.slice(0, i + 1).join("/"))}
                className={cn(
                  "transition-colors hover:text-charcoal",
                  i === crumbs.length - 1 && "text-charcoal",
                )}
              >
                {part}
              </button>
            </span>
          ))}
        </nav>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2
                className="size-5 animate-spin text-charcoal/40"
                strokeWidth={1.5}
              />
            </div>
          ) : !data || (data.folders.length === 0 && data.files.length === 0) ? (
            <p className="py-16 text-center text-sm text-charcoal/50">
              Nothing here yet. Upload an image to get started.
            </p>
          ) : (
            <>
              {data.folders.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-3">
                  {data.folders.map((folder) => (
                    <button
                      key={folder.path}
                      onClick={() => setPrefix(folder.path)}
                      className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-left transition-colors hover:border-charcoal/30"
                    >
                      <Folder
                        className="size-4 text-muted-gold"
                        strokeWidth={1.5}
                      />
                      <span className="truncate text-sm text-charcoal">
                        {folder.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {data.files.length > 0 && (
                <div
                  className={cn(
                    "grid grid-cols-3 gap-3 sm:grid-cols-4",
                    data.folders.length > 0 && "mt-4",
                  )}
                >
                  {data.files.map((file) => {
                    const added = alreadyAdded.includes(file.url);
                    const selected = picked.has(file.url);
                    return (
                      <button
                        key={file.path}
                        onClick={() => !added && toggle(file.url)}
                        disabled={added}
                        title={added ? "Already added" : file.name}
                        className={cn(
                          "relative overflow-hidden rounded-lg border transition-colors",
                          added
                            ? "cursor-not-allowed border-border opacity-40"
                            : selected
                              ? "border-charcoal"
                              : "border-border hover:border-charcoal/40",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="aspect-square w-full bg-cream object-cover"
                        />
                        {(selected || added) && (
                          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-charcoal text-ivory">
                            <Check className="size-3" strokeWidth={2} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
          <span className="text-xs text-charcoal/50">
            {picked.size} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-full border border-border px-5 text-sm text-charcoal transition-colors hover:border-charcoal/40"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm([...picked])}
              disabled={picked.size === 0 || saving}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                `Add ${picked.size || ""}`.trim()
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
