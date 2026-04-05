import type { ReactNode } from "react";
import type {
  CollectionDefinition,
  DashboardLinkDefinition,
  PageDefinition,
} from "../types";
import {
  CollectionIcon,
  IncomingIcon,
  LinkIcon,
  PageIcon,
  SettingsIcon,
} from "./components/icons";

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
  const managedCollections = collections.filter((collection) => collection.mode !== "incoming");
  const incomingCollections = collections.filter((collection) => collection.mode === "incoming");

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
                icon={<LinkIcon size={20} />}
                label={link.title}
                description={link.description ?? "Open external resource."}
                href={link.href}
                openInNewTab={link.openInNewTab}
              />
            ))}
          </div>
        </>
      ) : null}

      {managedCollections.length > 0 ? (
        <>
          <SectionRule />
          <SectionHeading
            title="Collections"
            description="Manage structured content types such as posts, events, and other repeatable entries."
          />
          <div style={gridStyle}>
            {managedCollections.map((collection) => (
              <DashCard
                key={collection.id}
                icon={<CollectionIcon size={20} />}
                label={collection.label}
                description={collection.description ?? `Manage ${collection.label.toLowerCase()} entries.`}
                href={`/admin/collections/${collection.id}`}
              />
            ))}
          </div>
        </>
      ) : null}

      {incomingCollections.length > 0 ? (
        <>
          <SectionRule />
          <SectionHeading
            title="Incoming"
            description="Review inbound submissions from public-site forms and other intake flows."
          />
          <div style={gridStyle}>
            {incomingCollections.map((collection) => (
              <DashCard
                key={collection.id}
                icon={<IncomingIcon size={20} />}
                label={collection.label}
                description={collection.description ?? `Review ${collection.label.toLowerCase()} from your site visitors.`}
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
          icon={<PageIcon size={20} />}
          label="Pages"
          description="Manage the default page content types used for live-site editing."
          href="/admin/pages"
        />
        <DashCard
          icon={<SettingsIcon size={20} />}
          label="Settings"
          description="Choose light, dark, or system theme for the admin interface."
          href="/admin/settings"
        />
      </div>
    </section>
  );
}

function DashCard({
  icon,
  label,
  description,
  href,
  openInNewTab = false,
}: {
  icon?: ReactNode;
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
      {icon ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            borderRadius: 12,
            background: "var(--ne-surface-muted)",
            padding: 10,
            color: "var(--ne-fg)",
          }}
        >
          {icon}
        </div>
      ) : null}
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
