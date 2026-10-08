import { getAllCategoriesAdmin } from "../../actions";
import { ProductEditor } from "../product-editor";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const cats = await getAllCategoriesAdmin();

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-charcoal">
        Add Product
      </h1>
      <ProductEditor
        categories={cats.map((c) => ({ value: c.slug, label: c.label }))}
      />
    </div>
  );
}
