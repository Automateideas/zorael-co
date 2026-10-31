import { notFound } from "next/navigation";
import { getCollectionAdmin, getProductOptions } from "../actions";
import { CollectionEditor } from "../collection-editor";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, productOptions] = await Promise.all([
    getCollectionAdmin(id),
    getProductOptions(),
  ]);

  if (!collection) notFound();

  return (
    <CollectionEditor collection={collection} productOptions={productOptions} />
  );
}
