import type { Metadata } from "next";
import { Monogram } from "@/components/layout/logo";
import { RetryButton } from "@/components/retry-button";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="container-zorael flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Monogram className="text-5xl" />
      <p className="eyebrow mt-8">You&apos;re offline</p>
      <h1 className="mt-3 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
        A quiet moment.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/60">
        It seems the connection has slipped away. Your bag and saved pieces are
        safe. Reconnect to continue exploring the collections.
      </p>
      <div className="mt-8">
        <RetryButton />
      </div>
    </div>
  );
}
