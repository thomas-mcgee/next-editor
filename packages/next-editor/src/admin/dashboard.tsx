import type {
  CollectionDefinition,
  DashboardLinkDefinition,
  PageDefinition,
} from "../types";

export function NeDashboardPage({
  userName,
  pages,
  collections,
  dashboardLinks,
}: {
  userName: string;
  pages: PageDefinition[];
  collections: CollectionDefinition[];
  dashboardLinks: DashboardLinkDefinition[];
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

      {dashboardLinks.length > 0 ? (
        <>
          <SectionHeading
            title="Helpful Links"
            description="Quick links to project resources, reporting tools, and client-facing services."
          />
          <div style={gridStyle}>
            {dashboardLinks.map((link) => (
              <DashCard
                key={link.id}
                label={link.title}
                description={link.description ?? "Open external resource."}
                href={link.href}
                openInNewTab={link.openInNewTab}
              />
            ))}
          </div>
        </>
      ) : null}

      {collections.length > 0 ? (
        <>
          <SectionRule />
          <SectionHeading
            title="Collections"
            description="Manage structured content types such as posts, events, and other repeatable entries."
          />
          <div style={gridStyle}>
            {collections.map((collection) => (
              <DashCard
                key={collection.id}
                label={collection.label}
                description={collection.description ?? `Manage ${collection.label.toLowerCase()} entries.`}
                href={`/admin/collections/${collection.id}`}
              />
            ))}
          </div>
        </>
      ) : null}

      <SectionRule />
      <SectionHeading
        title="Workspace"
        description="Core editor administration pages and workspace-wide settings."
      />
      <div style={gridStyle}>
        <DashCard
          label="Pages"
          description="Manage the default page content types used for live-site editing."
          href="/admin/pages"
        />
        <DashCard
          label="Settings"
          description="Choose light, dark, or system theme for the admin interface."
          href="/admin/settings"
        />
      </div>
    </section>
  );
}

function DashCard({
  label,
  description,
  href,
  openInNewTab = false,
}: {
  label: string;
  description: string;
  href: string;
  openInNewTab?: boolean;
}) {
  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer noopener" : undefined}
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

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ne-muted)" }}>
        {title}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--ne-muted)" }}>
        {description}
      </p>
    </div>
  );
}

function SectionRule() {
  return <hr style={{ margin: "28px 0 0", border: 0, borderTop: "1px solid var(--ne-border-strong)" }} />;
}

const gridStyle = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 16,
} as const;
