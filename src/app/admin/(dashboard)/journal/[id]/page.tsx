import { notFound } from "next/navigation";
import { getJournalPostAdmin } from "../actions";
import { JournalEditor } from "../journal-editor";

export const dynamic = "force-dynamic";

export default async function EditJournalPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getJournalPostAdmin(id);
  if (!post) notFound();

  return <JournalEditor post={post} />;
}
