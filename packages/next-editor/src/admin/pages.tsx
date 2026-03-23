import type { PageDefinition } from "../types";

const cell: React.CSSProperties = { padding: "12px 16px", fontSize: 13 };

export function NePagesPage({ pages }: { pages: PageDefinition[] }) {
  if (pages.length === 0) {
    return (
      <section>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>Pages</h2>
        <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)", maxWidth: 640 }}>
          No pages are registered yet. Add your page definitions to your NextEditor config and pass
          that config into `createAdminPage(...)` so the admin can list and manage them.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>Pages</h2>
          <span style={{ borderRadius: 999, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "2px 10px", fontSize: 12, fontWeight: 600, color: "var(--ne-muted)" }}>
            {pages.length}
          </span>
        </div>
      </div>

      <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)", maxWidth: 640 }}>
        Pages are included by default in NextEditor. These are the publicly viewable routes you can
        edit through the live-site sidebar.
      </p>

      <div style={{ marginTop: 20, borderRadius: 14, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--ne-surface-muted)" }}>
              {["Page", "Path", "Sections", "Description"].map((h) => (
                <th key={h} style={{ ...cell, fontWeight: 600, color: "var(--ne-muted)", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} style={{ borderTop: "1px solid var(--ne-border-strong)" }}>
                <td style={{ ...cell, fontWeight: 600 }}>
                  <a href={page.path} style={{ color: "var(--ne-fg)", textDecoration: "none" }}>
                    {page.label}
                  </a>
                </td>
                <td style={{ ...cell, color: "var(--ne-muted)" }}>{page.path}</td>
                <td style={{ ...cell, color: "var(--ne-muted)" }}>{page.sections.length}</td>
                <td style={{ ...cell, color: "var(--ne-muted)" }}>{page.description ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
