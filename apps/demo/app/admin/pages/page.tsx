import { listPageDocuments } from "@/lib/content-store";

export default async function AdminPagesPage() {
  const pages = await listPageDocuments();

  return (
    <section className="font-sans">
      <h2
        className="text-3xl font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Pages
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--muted)" }}>
        Pages always exist and remain separate from admin-managed content types.
      </p>
      <div
        className="mt-6 overflow-hidden rounded-xl"
        style={{ border: "1px solid var(--border-strong)" }}
      >
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
          <thead style={{ background: "var(--surface-muted)" }}>
            <tr>
              <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Page
              </th>
              <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Updated
              </th>
              <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Updated By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {pages.map((page) => (
              <tr key={page.pageId}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                  {page.pageId}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {page.updatedAt}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {page.updatedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
