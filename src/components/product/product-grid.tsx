import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  columns = "default",
  priorityCount = 0,
}: {
  products: Product[];
  className?: string;
  columns?: "default" | "two" | "compact";
  priorityCount?: number;
}) {
  const cols =
    columns === "two"
      ? "grid-cols-2"
      : columns === "compact"
        ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10", cols, className)}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
