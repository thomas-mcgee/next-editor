import { redirect } from "next/navigation";
import { getEditorSession } from "@/lib/auth";
import { listUsers } from "@/lib/user-store";

export default async function AdminUsersPage() {
  const session = await getEditorSession();

  if (!session.isAdmin) {
    redirect("/admin");
  }

  const users = await listUsers();

  return (
    <section className="font-sans">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <h2
            className="text-3xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Users
          </h2>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              border: "1px solid var(--border-strong)",
              color: "var(--muted)",
              background: "var(--surface)",
            }}
          >
            {users.length}
          </span>
        </div>
        <a
          href="/admin/users/new"
          className="rounded-xl px-4 py-2 text-sm font-semibold"
          style={{
            border: "1px solid var(--border-strong)",
            color: "var(--foreground)",
            background: "var(--surface)",
            textDecoration: "none",
          }}
        >
          Add User
        </a>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--muted)" }}>
        This page is only available to admin users. Editors can access the rest
        of the admin but not user management.
      </p>

      <div
        className="mt-6 overflow-hidden rounded-xl"
        style={{
          border: "1px solid var(--border-strong)",
          background: "var(--surface)",
        }}
      >
        <table
          className="min-w-full text-left text-sm"
          style={{ background: "var(--surface)" }}
        >
          <thead style={{ background: "var(--surface-muted)" }}>
            <tr>
              <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Name
              </th>
              <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Email
              </th>
              <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Role
              </th>
              <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Title
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                style={{ borderTop: "1px solid var(--border-strong)" }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                  {user.name}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {user.email}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {user.role}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {user.title ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
