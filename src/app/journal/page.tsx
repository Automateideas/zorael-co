import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Media } from "@/components/media";
import { journalPosts } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "The Zorael Journal — editorial stories on style, craft and quiet luxury.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function JournalPage() {
  const [featured, ...rest] = journalPosts;

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Journal" }]}
      />

      <header className="mt-6 max-w-2xl">
        <p className="eyebrow mb-3">The Zorael Edit</p>
        <h1 className="font-serif text-4xl tracking-tight text-charcoal lg:text-5xl">
          Journal
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
          Editorial stories on style, craft and the art of considered dressing.
        </p>
      </header>

      {/* Featured */}
      <Link
        href={`/journal/${featured.slug}`}
        className="group mt-10 grid gap-6 overflow-hidden rounded-lg bg-cream lg:grid-cols-2"
      >
        <div className="relative aspect-[16/10] lg:aspect-auto">
          <Media
            src={featured.coverImage}
            alt={featured.title}
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
            className="h-full w-full"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <p className="eyebrow mb-3">
            {featured.category} · {featured.readingTime}
          </p>
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-charcoal lg:text-4xl">
            {featured.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/65">
            {featured.excerpt}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm text-charcoal">
            Read Story
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </span>
        </div>
      </Link>

      {/* Grid */}
      <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/journal/${post.slug}`}>
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                <Media
                  src={post.coverImage}
                  alt={post.title}
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  className="h-full w-full"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="eyebrow mt-4">
                {post.category} · {formatDate(post.date)}
              </p>
              <h3 className="mt-2 font-serif text-xl leading-snug tracking-tight text-charcoal transition-colors group-hover:text-muted-gold">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                {post.excerpt}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
