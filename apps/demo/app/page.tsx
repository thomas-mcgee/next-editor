import { DemoEditorShell } from "@/components/demo-editor-shell";
import { HomePageView } from "@/components/home-page-view";
import { SiteHeader } from "@/components/site-header";
import { canEdit } from "next-editor/server";
import { homePage } from "@/lib/editor-config";
import { getDemoPageValues } from "@/lib/page-content";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const document = await getDemoPageValues("home");
  return createMetadata(
    document.seo as Parameters<typeof createMetadata>[0],
  );
}

export default async function Home() {
  const [isEditor, values] = await Promise.all([
    canEdit(),
    getDemoPageValues("home"),
  ]);

  return (
    <DemoEditorShell
      page={homePage}
      initialValues={values}
      canEdit={isEditor}
    >
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_45%),linear-gradient(180deg,_#f6f1e7_0%,_#fffdf9_100%)]">
        <SiteHeader />
        <HomePageView />
      </div>
    </DemoEditorShell>
  );
}
