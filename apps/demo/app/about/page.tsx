import { AboutPageView } from "@/components/about-page-view";
import { DemoEditorShell } from "@/components/demo-editor-shell";
import { SiteHeader } from "@/components/site-header";
import { getEditorSession } from "@/lib/auth";
import { getPageDocument } from "@/lib/content-store";
import { aboutPage } from "@/lib/editor-config";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const document = await getPageDocument("about");
  return createMetadata(
    document.values.seo as Parameters<typeof createMetadata>[0],
  );
}

export default async function AboutPage() {
  const [session, document] = await Promise.all([
    getEditorSession(),
    getPageDocument("about"),
  ]);

  return (
    <DemoEditorShell
      page={aboutPage}
      initialValues={document.values}
      canEdit={session.isEditor}
    >
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fffdf8_0%,_#f2ece2_100%)]">
        <SiteHeader />
        <AboutPageView />
      </div>
    </DemoEditorShell>
  );
}
