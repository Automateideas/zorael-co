"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Folder,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  browseStorage,
  deleteStorageItems,
  type BrowseResult,
  type ImageUsage,
} from "./actions";

function formatSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StorageBrowser() {
  const [prefix, setPrefix] = useState("");
  const [data, setData] = useState<BrowseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [blocked, setBlocked] = useState<ImageUsage[] | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async (next: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await browseStorage(next);
      setData(result);
      setSelectedFiles(new Set());
      setSelectedFolders(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load storage.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(prefix);
  }, [prefix, load]);

  const selectedCount = selectedFiles.size + selectedFolders.size;

  const toggleFile = (path: string) =>
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const toggleFolder = (path: string) =>
    setSelectedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const selectAllFiles = () => {
    if (!data) return;
    setSelectedFiles((prev) =>
      prev.size === data.files.length
        ? new Set()
        : new Set(data.files.map((f) => f.path)),
    );
  };

  const runDelete = (force: boolean) => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await deleteStorageItems(
          [...selectedFiles],
          [...selectedFolders],
          force,
        );
        if (result.blocked.length > 0) {
          setBlocked(result.blocked);
          return;
        }
        setConfirming(false);
        setBlocked(null);
        setNotice(
          `Deleted ${result.deleted} file${result.deleted === 1 ? "" : "s"}.`,
        );
        setTimeout(() => setNotice(null), 4000);
        await load(prefix);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed.");
        setConfirming(false);
      }
    });
  };

  const crumbs = prefix ? prefix.split("/") : [];

  return (
    <div className="mt-6">
      {/* Breadcrumbs + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-charcoal/50">
          <button
            onClick={() => setPrefix("")}
            className="transition-colors hover:text-charcoal"
          >
            All files
          </button>
          {crumbs.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="size-3.5" strokeWidth={1.5} />
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

        <div className="flex items-center gap-2">
          {data && data.files.length > 0 && (
            <button
              onClick={selectAllFiles}
              className="h-9 rounded-full border border-border px-4 text-xs text-charcoal/70 transition-colors hover:border-charcoal/40"
            >
              {selectedFiles.size === data.files.length
                ? "Clear selection"
                : "Select all"}
            </button>
          )}
          <button
            onClick={() => load(prefix)}
            disabled={loading}
            aria-label="Refresh"
            className="flex size-9 items-center justify-center rounded-full border border-border text-charcoal/60 transition-colors hover:border-charcoal/40 disabled:opacity-40"
          >
            <RefreshCw
              className={cn("size-4", loading && "animate-spin")}
              strokeWidth={1.5}
            />
          </button>
          {selectedCount > 0 && (
            <button
              onClick={() => setConfirming(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 px-4 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-3.5" strokeWidth={1.5} />
              Delete {selectedCount}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Contents */}
      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="size-5 animate-spin text-charcoal/40" strokeWidth={1.5} />
        </div>
      ) : !data || (data.folders.length === 0 && data.files.length === 0) ? (
        <div className="mt-8 rounded-lg border border-border bg-white py-20 text-center">
          <Folder className="mx-auto size-8 text-charcoal/20" strokeWidth={1.25} />
          <p className="mt-3 text-sm text-charcoal/55">This folder is empty.</p>
        </div>
      ) : (
        <>
          {data.folders.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.folders.map((folder) => (
                <div
                  key={folder.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-white p-3 transition-colors",
                    selectedFolders.has(folder.path)
                      ? "border-charcoal"
                      : "border-border hover:border-charcoal/30",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedFolders.has(folder.path)}
                    onChange={() => toggleFolder(folder.path)}
                    aria-label={`Select folder ${folder.name}`}
                    className="size-4 accent-charcoal"
                  />
                  <button
                    onClick={() => setPrefix(folder.path)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <Folder className="size-4 text-muted-gold" strokeWidth={1.5} />
                    <span className="truncate text-sm text-charcoal">
                      {folder.name}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {data.files.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {data.files.map((file) => (
                <figure
                  key={file.path}
                  className={cn(
                    "overflow-hidden rounded-lg border bg-white transition-colors",
                    selectedFiles.has(file.path)
                      ? "border-charcoal"
                      : "border-border hover:border-charcoal/30",
                  )}
                >
                  <div className="relative">
                    <button
                      onClick={() => setPreview(file.url)}
                      className="block w-full"
                      aria-label={`Preview ${file.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.url}
                        alt={file.name}
                        className="aspect-square w-full bg-cream object-cover"
                      />
                    </button>
                    <label className="absolute left-2 top-2 flex size-6 cursor-pointer items-center justify-center rounded bg-ivory/90">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.path)}
                        onChange={() => toggleFile(file.path)}
                        aria-label={`Select ${file.name}`}
                        className="size-3.5 accent-charcoal"
                      />
                    </label>
                  </div>
                  <figcaption className="px-2.5 py-2">
                    <p className="truncate text-xs text-charcoal" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[0.65rem] text-charcoal/40">
                      {formatSize(file.size)}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-6"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-label="Image preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          <button
            onClick={() => setPreview(null)}
            aria-label="Close preview"
            className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-ivory text-charcoal"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-6">
          <div className="w-full max-w-md rounded-lg border border-border bg-white p-6">
            <h2 className="font-serif text-lg tracking-tight text-charcoal">
              Delete {selectedCount} item{selectedCount === 1 ? "" : "s"}?
            </h2>

            {selectedFolders.size > 0 && (
              <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <AlertTriangle className="size-4 shrink-0" strokeWidth={1.5} />
                <span>
                  {selectedFolders.size} folder
                  {selectedFolders.size === 1 ? "" : "s"} selected — everything
                  inside, including subfolders, will be deleted.
                </span>
              </p>
            )}

            {blocked && blocked.length > 0 ? (
              <div className="mt-4">
                <p className="flex gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
                  <AlertTriangle className="size-4 shrink-0" strokeWidth={1.5} />
                  <span>
                    {blocked.length} image{blocked.length === 1 ? " is" : "s are"}{" "}
                    still used by products. Deleting will remove them from those
                    products too.
                  </span>
                </p>
                <ul className="mt-3 max-h-40 space-y-1.5 overflow-auto text-xs text-charcoal/70">
                  {blocked.map((u) => (
                    <li key={u.path}>
                      <span className="text-charcoal">
                        {u.path.split("/").pop()}
                      </span>{" "}
                      — {u.products.map((p) => p.name).join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-charcoal/60">
                This cannot be undone.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirming(false);
                  setBlocked(null);
                }}
                disabled={pending}
                className="h-10 rounded-full border border-border px-5 text-sm text-charcoal transition-colors hover:border-charcoal/40"
              >
                Cancel
              </button>
              <button
                onClick={() => runDelete(blocked !== null)}
                disabled={pending}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                ) : blocked ? (
                  "Delete anyway"
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
