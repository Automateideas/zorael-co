"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AboutContent, AboutValue } from "@/lib/site-content";
import { saveAboutContent } from "./actions";

export function AboutEditor({ content }: { content: AboutContent }) {
  const router = useRouter();
  const [saving, start] = useTransition();
  const [c, setC] = useState<AboutContent>(content);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setC((prev) => ({ ...prev, [key]: value }));

  const setValue = (i: number, field: keyof AboutValue, value: string) =>
    setC((prev) => ({
      ...prev,
      values: prev.values.map((v, idx) =>
        idx === i ? { ...v, [field]: value } : v,
      ),
    }));

  const save = () =>
    start(async () => {
      setError(null);
      try {
        await saveAboutContent(c);
        setNotice("Saved — the About page will update shortly.");
        setTimeout(() => setNotice(null), 4000);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-charcoal">
            About Page
          </h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Edit the text on the About page. Images are managed under Page
            Images.
          </p>
        </div>
        <a
          href="/about"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-xs text-charcoal/60 transition-colors hover:border-charcoal/40"
        >
          <ExternalLink className="size-3.5" strokeWidth={1.5} />
          View page
        </a>
      </div>

      <div className="mt-6 space-y-6">
        {/* Hero */}
        <Section title="Hero">
          <Field label="Title">
            <input
              className={input}
              value={c.heroTitle}
              onChange={(e) => set("heroTitle", e.target.value)}
            />
          </Field>
          <Field label="Subtitle">
            <input
              className={input}
              value={c.heroSubtitle}
              onChange={(e) => set("heroSubtitle", e.target.value)}
            />
          </Field>
        </Section>

        {/* Philosophy */}
        <Section title="Philosophy">
          <Field label="Eyebrow">
            <input
              className={input}
              value={c.philosophyEyebrow}
              onChange={(e) => set("philosophyEyebrow", e.target.value)}
            />
          </Field>
          <Field label="Statement (large)" className="sm:col-span-2">
            <textarea
              rows={2}
              className={cn(input, "h-auto py-2.5")}
              value={c.philosophyStatement}
              onChange={(e) => set("philosophyStatement", e.target.value)}
            />
          </Field>
          <Field label="Paragraph" className="sm:col-span-2">
            <textarea
              rows={3}
              className={cn(input, "h-auto py-2.5")}
              value={c.philosophyBody}
              onChange={(e) => set("philosophyBody", e.target.value)}
            />
          </Field>
        </Section>

        {/* Craftsmanship */}
        <Section title="Craftsmanship (image section)">
          <Field label="Eyebrow">
            <input
              className={input}
              value={c.craftEyebrow}
              onChange={(e) => set("craftEyebrow", e.target.value)}
            />
          </Field>
          <Field label="Heading">
            <input
              className={input}
              value={c.craftHeading}
              onChange={(e) => set("craftHeading", e.target.value)}
            />
          </Field>
          <Field label="Paragraph 1" className="sm:col-span-2">
            <textarea
              rows={3}
              className={cn(input, "h-auto py-2.5")}
              value={c.craftBody1}
              onChange={(e) => set("craftBody1", e.target.value)}
            />
          </Field>
          <Field label="Paragraph 2" className="sm:col-span-2">
            <textarea
              rows={2}
              className={cn(input, "h-auto py-2.5")}
              value={c.craftBody2}
              onChange={(e) => set("craftBody2", e.target.value)}
            />
          </Field>
          <Field label="Button label">
            <input
              className={input}
              value={c.craftCtaLabel}
              onChange={(e) => set("craftCtaLabel", e.target.value)}
            />
          </Field>
          <Field label="Button link">
            <input
              className={input}
              value={c.craftCtaHref}
              onChange={(e) => set("craftCtaHref", e.target.value)}
              placeholder="/shop"
            />
          </Field>
        </Section>

        {/* Values */}
        <Section title="Value Cards (4)">
          {c.values.map((v, i) => (
            <div
              key={i}
              className="sm:col-span-2 grid gap-4 rounded-md border border-border/70 p-4 sm:grid-cols-[1fr_2fr]"
            >
              <Field label={`Card ${i + 1} — Title`}>
                <input
                  className={input}
                  value={v.title}
                  onChange={(e) => setValue(i, "title", e.target.value)}
                />
              </Field>
              <Field label="Text">
                <input
                  className={input}
                  value={v.copy}
                  onChange={(e) => setValue(i, "copy", e.target.value)}
                />
              </Field>
            </div>
          ))}
          <p className="sm:col-span-2 text-xs text-charcoal/45">
            The icons are fixed; only the text is editable.
          </p>
        </Section>

        {/* Support */}
        <Section title="Customer Support">
          <Field label="Eyebrow">
            <input
              className={input}
              value={c.supportEyebrow}
              onChange={(e) => set("supportEyebrow", e.target.value)}
            />
          </Field>
          <Field label="Heading">
            <input
              className={input}
              value={c.supportHeading}
              onChange={(e) => set("supportHeading", e.target.value)}
            />
          </Field>
          <Field label="Paragraph" className="sm:col-span-2">
            <textarea
              rows={2}
              className={cn(input, "h-auto py-2.5")}
              value={c.supportBody}
              onChange={(e) => set("supportBody", e.target.value)}
            />
          </Field>
        </Section>

        {notice && (
          <p className="rounded-md bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <Check className="mr-1.5 inline size-4" strokeWidth={2} />
            {notice}
          </p>
        )}
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-6 text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <>
                <Save className="size-4" strokeWidth={1.5} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const input =
  "h-11 w-full rounded-lg border border-border bg-ivory px-3.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
        {title}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs text-charcoal/50">{label}</span>
      {children}
    </label>
  );
}
