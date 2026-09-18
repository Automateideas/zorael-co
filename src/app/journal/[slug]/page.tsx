import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Media } from "@/components/media";
import { journalPosts, getJournalPost } from "@/lib/journal";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return journalPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function JournalPostPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) notFound();

  const more = journalPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article className="pb-8">
      {/* Cover */}
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/7]">
        <Media
          src={post.coverImage}
          alt={post.title}
          priority
          sizes="100vw"
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-charcoal/30" />
      </div>

      <div className="container-zorael">
        <div className="mx-auto -mt-16 max-w-2xl rounded-lg bg-ivory px-6 pt-10 sm:px-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Journal", href: "/journal" },
              { label: post.title },
            ]}
          />
          <p className="eyebrow mt-6">
            {post.category} · {formatDate(post.date)} · {post.readingTime}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-charcoal lg:text-5xl">
            {post.title}
          </h1>
        </div>

        <div className="mx-auto mt-8 max-w-2xl px-6 sm:px-10">
          {post.body.map((para, i) => (
            <p
              key={i}
              className="mb-6 text-base leading-[1.8] text-charcoal/80 first:text-lg first:text-charcoal"
            >
              {para}
            </p>
          ))}

          <Link
            href="/journal"
            className="mt-6 inline-flex items-center gap-2 text-sm text-charcoal transition-colors hover:text-muted-gold"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Back to Journal
          </Link>
        </div>
      </div>

      {/* More */}
      {more.length > 0 && (
        <div className="container-zorael mt-20">
          <h2 className="font-serif text-2xl tracking-tight text-charcoal">
            More Stories
          </h2>
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-3">
            {more.map((p) => (
              <Link key={p.id} href={`/journal/${p.slug}`} className="group">
                <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                  <Media
                    src={p.coverImage}
                    alt={p.title}
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-serif text-lg leading-snug tracking-tight text-charcoal transition-colors group-hover:text-muted-gold">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
