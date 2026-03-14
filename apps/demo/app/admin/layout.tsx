import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getEditorSession } from "@/lib/auth";
import { listContentTypes } from "@/lib/content-types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getEditorSession();

  if (!session.isEditor || !session.user) {
    redirect("/login");
  }

  return (
    <AdminShell
      contentTypes={listContentTypes()}
      isAdmin={session.isAdmin}
      user={session.user}
    >
      {children}
    </AdminShell>
  );
}
