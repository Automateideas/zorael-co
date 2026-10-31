import { getProductOptions } from "../actions";
import { CollectionEditor } from "../collection-editor";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  const productOptions = await getProductOptions();
  return <CollectionEditor productOptions={productOptions} />;
}
