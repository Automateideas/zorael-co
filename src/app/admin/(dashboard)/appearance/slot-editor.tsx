"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Images,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePicker } from "../storage/image-picker";
import { resetSlot, saveSlotImages } from "./actions";

export type Slot = {
  slot: string;
  label: string;
  hint: string;
  multiple: boolean;
  images: string[];
  defaults: string[];
  usingDefaults: boolean;
};

export function SlotEditor({ slot }: { slot: Slot }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [images, setImages] = useState<string[]>(slot.images);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shown when nothing is set, so the admin sees what visitors currently get.
  const preview = images.length > 0 ? images : slot.defaults;
  const dirty = JSON.stringify(images) !== JSON.stringify(slot.images);

  const add = (urls: string[]) => {
    setImages((prev) => {
      const merged = [...prev, ...urls.filter((u) => !prev.includes(u))];
      return slot.multiple ? merged : merged.slice(-1);
    });
    setPickerOpen(false);
  };

  const removeAt = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = () =>
    start(async () => {
      setError(null);
      try {
        await saveSlotImages(slot.slot, images);
        setNotice("Saved — the live page will update shortly.");
        setTimeout(() => setNotice(null), 4000);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });

  const reset = () =>
    start(async () => {
      await resetSlot(slot.slot);
      setImages([]);
      setNotice("Reset to the built-in image.");
      setTimeout(() => setNotice(null), 4000);
      router.refresh();
    });

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-charcoal">{slot.label}</h2>
          <p className="mt-0.5 text-xs text-charcoal/45">{slot.hint}</p>
        </div>
        {slot.usingDefaults && images.length === 0 && (
          <span className="rounded-full bg-cream px-3 py-1 text-[0.7rem] text-charcoal/55">
            Using built-in image
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {preview.map((url, i) => {
          const isCustom = images.length > 0;
          return (
            <div key={`${url}-${i}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className={cn(
                  "h-24 w-32 rounded-md border border-border object-cover",
                  !isCustom && "opacity-50",
                )}
              />
              {isCustom && (
                <>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-charcoal/85 text-ivory transition-colors hover:bg-red-600"
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                  {slot.multiple && preview.length > 1 && (
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Move earlier"
                        className="flex size-5 items-center justify-center rounded bg-charcoal/85 text-ivory disabled:opacity-30"
                      >
                        <ArrowLeft className="size-3" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === preview.length - 1}
                        aria-label="Move later"
                        className="flex size-5 items-center justify-center rounded bg-charcoal/85 text-ivory disabled:opacity-30"
                      >
                        <ArrowRight className="size-3" strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {(slot.multiple || images.length === 0) && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-charcoal/40 transition-colors hover:border-charcoal/40 hover:text-charcoal/60"
          >
            <Images className="size-5" strokeWidth={1.5} />
            <span className="text-[10px]">
              {slot.multiple ? "Add image" : "Choose"}
            </span>
          </button>
        )}
      </div>

      {notice && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={save}
          disabled={pending || !dirty}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-charcoal px-5 text-xs font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
          ) : (
            "Save"
          )}
        </button>
        {!slot.usingDefaults && (
          <button
            onClick={reset}
            disabled={pending}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-xs text-charcoal/60 transition-colors hover:border-charcoal/40"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.5} />
            Reset
          </button>
        )}
      </div>

      {pickerOpen && (
        <ImagePicker
          alreadyAdded={images}
          onClose={() => setPickerOpen(false)}
          onConfirm={add}
        />
      )}
    </section>
  );
}
