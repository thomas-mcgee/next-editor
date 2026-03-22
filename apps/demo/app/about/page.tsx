import { AboutPageView } from "@/components/about-page-view";
import { DemoEditorShell } from "@/components/demo-editor-shell";
import { SiteHeader } from "@/components/site-header";
import { canEdit } from "@makeablebrand/next-editor/server";
import { aboutPage } from "@/lib/editor-config";
import { getDemoPageValues } from "@/lib/page-content";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const document = await getDemoPageValues("about");
  return createMetadata(
    document.seo as Parameters<typeof createMetadata>[0],
  );
}

export default async function AboutPage() {
  const [isEditor, values] = await Promise.all([
    canEdit(),
    getDemoPageValues("about"),
  ]);

  return (
    <DemoEditorShell
      page={aboutPage}
      initialValues={values}
      canEdit={isEditor}
    >
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fffdf8_0%,_#f2ece2_100%)]">
        <SiteHeader />
        <AboutPageView />
      </div>
    </DemoEditorShell>
  );
}
