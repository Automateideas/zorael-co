export default function Loading() {
  return (
    <div className="container-zorael py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-cream" />
      <div className="mt-4 h-4 w-72 max-w-full animate-pulse rounded bg-cream" />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-md bg-cream" />
            <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-cream" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-cream" />
          </div>
        ))}
      </div>
    </div>
  );
}
