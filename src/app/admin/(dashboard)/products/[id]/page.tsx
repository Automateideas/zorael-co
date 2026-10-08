import { notFound } from "next/navigation";
import { getProductWithVariants, getAllCategoriesAdmin } from "../../actions";
import { ProductEditor } from "../product-editor";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, cats] = await Promise.all([
    getProductWithVariants(id),
    getAllCategoriesAdmin(),
  ]);
  if (!data) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-charcoal">
        Edit Product
      </h1>
      <ProductEditor
        product={data.product}
        variants={data.variants}
        categories={cats.map((c) => ({ value: c.slug, label: c.label }))}
      />
    </div>
  );
}
