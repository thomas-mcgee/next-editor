import { redirect } from "next/navigation";
import { auth } from "../auth/config";
import { countUsers, getUserById, listUsers } from "../auth/user-store";
import { neLogoutAction, neDeleteUserAction } from "../auth/actions";
import { NeThemeScript } from "./theme-script";
import { NeThemeProvider } from "./theme-provider";
import { NeAdminShell } from "./shell";
import { NeForgotPasswordPage, NeLoginPage, NeResetPasswordPage } from "./login";
import { NeSetupPage } from "./setup";
import { NeDashboardPage } from "./dashboard";
import { NePagesPage } from "./pages";
import { NeCollectionListPage } from "./collection-list";
import { NeCollectionEntryForm } from "./collection-form";
import { NeUsersPage } from "./users";
import { NeNewUserPage } from "./users-new";
import { NeAccountPage } from "./account";
import { NeSettingsPage } from "./settings";
import type { NextEditorConfig } from "../types";
import { neDeleteCollectionEntryAction, neSaveCollectionEntryAction } from "./collection-actions";
import { getCollectionEntry, listCollectionEntries } from "../content/collection-store";
import { getPasswordResetToken, isPasswordResetTokenActive } from "../auth/password-reset-store";

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function sp(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const v = searchParams[key];
  return typeof v === "string" ? v : undefined;
}

async function NextEditorAdminPage({
  params,
  searchParams,
  config,
}: Props & { config: NextEditorConfig }) {
  const [{ slug = [] }, query] = await Promise.all([params, searchParams]);
  const path = slug.join("/");
  const collections = config.collections ?? [];
  const [firstSegment, secondSegment, thirdSegment] = slug;

  // ── Setup (no auth required, only when no users exist) ───────────────────
  if (path === "setup") {
    const userCount = await countUsers();
    if (userCount > 0) redirect("/admin/login");
    return <NeSetupPage status={sp(query, "status")} />;
  }

  // ── Login (no auth required) ─────────────────────────────────────────────
  if (path === "login") {
    const session = await auth();
    if (session?.user?.role) redirect("/admin");
    return <NeLoginPage error={sp(query, "error") ?? sp(query, "status")} />;
  }

  if (path === "login/forgot") {
    const session = await auth();
    if (session?.user?.role) redirect("/admin");
    return <NeForgotPasswordPage status={sp(query, "status")} />;
  }

  if (path === "login/reset") {
    const session = await auth();
    if (session?.user?.role) redirect("/admin");
    const token = sp(query, "token");
    const resetToken = token ? await getPasswordResetToken(token) : null;
    const hasActiveToken = token ? isPasswordResetTokenActive(resetToken) : false;
    return (
      <NeResetPasswordPage
        token={hasActiveToken ? token : undefined}
        status={sp(query, "status") ?? (token && !hasActiveToken ? "expired" : undefined)}
      />
    );
  }

  // ── Everything else requires auth ────────────────────────────────────────
  const session = await auth();
  const role = session?.user?.role;
  const isEditor = role === "editor" || role === "admin";
  const isAdmin = role === "admin";

  if (!isEditor || !session?.user?.id) {
    const userCount = await countUsers();
    if (userCount === 0) redirect("/admin/setup");
    redirect("/admin/login");
  }

  const user = await getUserById(session!.user.id);
  if (!user) redirect("/admin/login");

  let pageContent: React.ReactNode;

  if (path === "users") {
    if (!isAdmin) redirect("/admin");
    const users = await listUsers();
    pageContent = (
      <NeUsersPage users={users} currentUserId={user!.id} status={sp(query, "status")} deleteAction={neDeleteUserAction} />
    );
  } else if (path === "pages") {
    pageContent = <NePagesPage pages={config.pages} />;
  } else if (firstSegment === "collections" && secondSegment) {
    const collection = collections.find((item) => item.id === secondSegment);
    if (!collection) redirect("/admin");

    if (thirdSegment === "new") {
      pageContent = <NeCollectionEntryForm collection={collection} saveAction={neSaveCollectionEntryAction} />;
    } else if (thirdSegment) {
      const entry = await getCollectionEntry(collection.id, thirdSegment);
      if (!entry) redirect(`/admin/collections/${collection.id}`);
      pageContent = <NeCollectionEntryForm collection={collection} entry={entry} saveAction={neSaveCollectionEntryAction} />;
    } else {
      const entries = await listCollectionEntries(collection.id);
      pageContent = (
        <NeCollectionListPage
          collection={collection}
          entries={entries}
          status={sp(query, "status")}
          deleteAction={neDeleteCollectionEntryAction}
        />
      );
    }
  } else if (path === "users/new") {
    if (!isAdmin) redirect("/admin");
    pageContent = <NeNewUserPage status={sp(query, "status")} />;
  } else if (path === "account") {
    pageContent = <NeAccountPage user={user!} status={sp(query, "status")} />;
  } else if (path === "settings") {
    pageContent = <NeSettingsPage />;
  } else {
    pageContent = <NeDashboardPage userName={user!.name} pages={config.pages} collections={collections} />;
  }

  return (
    <>
      <NeThemeScript />
      <NeThemeProvider>
        <NeAdminShell user={user!} isAdmin={isAdmin} collections={collections} logoutAction={neLogoutAction}>
          {pageContent}
        </NeAdminShell>
      </NeThemeProvider>
    </>
  );
}

export function createAdminPage(config: NextEditorConfig) {
  return function NextEditorConfiguredAdminPage(props: Props) {
    return <NextEditorAdminPage {...props} config={config} />;
  };
}

export default createAdminPage({ pages: [], collections: [] });
