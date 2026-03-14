import { DemoEditorShell } from "@/components/demo-editor-shell";
import { HomePageView } from "@/components/home-page-view";
import { SiteHeader } from "@/components/site-header";
import { getEditorSession } from "@/lib/auth";
import { getPageDocument } from "@/lib/content-store";
import { homePage } from "@/lib/editor-config";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const document = await getPageDocument("home");
  return createMetadata(
    document.values.seo as Parameters<typeof createMetadata>[0],
  );
}

export default async function Home() {
  const [session, document] = await Promise.all([
    getEditorSession(),
    getPageDocument("home"),
  ]);

  return (
    <DemoEditorShell
      page={homePage}
      initialValues={document.values}
      canEdit={session.isEditor}
    >
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_45%),linear-gradient(180deg,_#f6f1e7_0%,_#fffdf9_100%)]">
        <SiteHeader />
        <HomePageView />
      </div>
    </DemoEditorShell>
  );
}
