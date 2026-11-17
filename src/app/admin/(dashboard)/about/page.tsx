import { getAboutAdmin } from "./actions";
import { AboutEditor } from "./about-editor";

export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  const content = await getAboutAdmin();
  return <AboutEditor content={content} />;
}
