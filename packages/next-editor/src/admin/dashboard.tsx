import type { CollectionDefinition, PageDefinition } from "../types";

export function NeDashboardPage({
  userName,
  pages,
  collections,
}: {
  userName: string;
  pages: PageDefinition[];
  collections: CollectionDefinition[];
}) {
  return (
    <section>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>
        Welcome back, {userName.split(" ")[0]}
      </h2>
      <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "var(--ne-muted)", maxWidth: 520 }}>
        Use the floating edit bar on any page to enter edit mode and modify content directly on
        the live site. Pages are built in by default, and collections extend the CMS for custom
        content types.
      </p>

      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <DashCard
          label="Pages"
          description="Manage the default page content types used for live-site editing."
          href="/admin/pages"
        />
        {collections.length > 0 ? (
          collections.map((collection) => (
            <DashCard
              key={collection.id}
              label={collection.label}
              description={collection.description ?? `Manage ${collection.label.toLowerCase()} entries.`}
              href={`/admin/collections/${collection.id}`}
            />
          ))
        ) : null}
        <DashCard
          label="Settings"
          description="Choose light, dark, or system theme for the admin interface."
          href="/admin/settings"
        />
      </div>
    </section>
  );
}

function DashCard({ label, description, href }: { label: string; description: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        borderRadius: 16,
        border: "1px solid var(--ne-border-strong)",
        background: "var(--ne-surface)",
        padding: 20,
        textDecoration: "none",
        boxShadow: "var(--ne-shadow-soft)",
        transition: "box-shadow 140ms",
      }}
    >
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--ne-fg)" }}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--ne-muted)" }}>
        {description}
      </p>
    </a>
  );
}
