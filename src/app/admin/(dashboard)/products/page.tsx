import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProductsAdmin } from "../actions";
import { ProductTable } from "./product-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl tracking-tight text-charcoal">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="flex h-9 items-center gap-1.5 rounded-full bg-charcoal px-4 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          Add Product
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
