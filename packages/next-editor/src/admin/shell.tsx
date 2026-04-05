"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { User } from "../auth/user-store";
import type { CollectionDefinition } from "../types";
import {
  CollectionIcon,
  DashboardIcon,
  HomeIcon,
  IncomingIcon,
  LogoutIcon,
  PageIcon,
  PersonIcon,
  SettingsIcon,
  UsersIcon,
} from "./components/icons";

const s = {
  root: {
    display: "grid",
    gridTemplateColumns: "260px minmax(0,1fr)",
    minHeight: "100vh",
    background: "var(--ne-bg)",
    fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  } satisfies React.CSSProperties,
  aside: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    borderRight: "1px solid var(--ne-border-strong)",
    background: "var(--ne-surface)",
    padding: 24,
  },
  header: {
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderBottom: "1px solid var(--ne-border-strong)",
    background: "var(--ne-surface-elevated)",
    padding: "14px 32px",
    backdropFilter: "blur(16px)",
  },
  headerText: { margin: 0, fontSize: 13, fontWeight: 500, color: "var(--ne-muted)" },
  navActions: { display: "flex", alignItems: "center", gap: 20 },
  visitBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid var(--ne-border-strong)",
    background: "var(--ne-surface-elevated)",
    color: "var(--ne-fg)",
    textDecoration: "none",
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.2,
  } satisfies React.CSSProperties,
  navBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "var(--ne-fg)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    background: "transparent",
    border: 0,
    padding: 0,
    cursor: "pointer",
  } satisfies React.CSSProperties,
  content: { padding: 32, minWidth: 0 },
};

export function NeAdminShell({
  children,
  isAdmin,
  collections,
  user,
  logoutAction,
}: {
  children: ReactNode;
  isAdmin: boolean;
  collections: CollectionDefinition[];
  user: User;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const managedCollections = collections.filter((collection) => collection.mode !== "incoming");
  const incomingCollections = collections.filter((collection) => collection.mode === "incoming");

  return (
    <div style={s.root}>
      <aside style={s.aside}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a href="/" style={s.visitBtn}>
            <span style={{ display: "inline-flex", color: "var(--ne-fg)" }}>
              <HomeIcon size={18} />
            </span>
            <span>Visit Site</span>
          </a>

          <NavGroup title="Workspace">
            <NavItem href="/admin" active={pathname === "/admin"} icon={<DashboardIcon size={18} />}>Dashboard</NavItem>
            <NavItem href="/admin/pages" active={pathname === "/admin/pages"} icon={<PageIcon size={18} />}>Pages</NavItem>
          </NavGroup>

          {managedCollections.length > 0 ? (
            <NavGroup title="Collections">
              {managedCollections.map((collection) => (
                <NavItem
                  key={collection.id}
                  href={`/admin/collections/${collection.id}`}
                  active={pathname.startsWith(`/admin/collections/${collection.id}`)}
                  icon={<CollectionIcon size={18} />}
                >
                  {collection.label}
                </NavItem>
              ))}
            </NavGroup>
          ) : null}

          {incomingCollections.length > 0 ? (
            <NavGroup title="Incoming">
              {incomingCollections.map((collection) => (
                <NavItem
                  key={collection.id}
                  href={`/admin/collections/${collection.id}`}
                  active={pathname.startsWith(`/admin/collections/${collection.id}`)}
                  icon={<IncomingIcon size={18} />}
                >
                  {collection.label}
                </NavItem>
              ))}
            </NavGroup>
          ) : null}

          {isAdmin ? (
            <NavGroup title="Admin">
              <NavItem href="/admin/users" active={pathname.startsWith("/admin/users")} icon={<UsersIcon size={18} />}>
                Users
              </NavItem>
            </NavGroup>
          ) : null}
        </div>
        <NavGroup title="Preferences">
          <NavItem href="/admin/settings" active={pathname === "/admin/settings"} icon={<SettingsIcon size={18} />}>
            Settings
          </NavItem>
        </NavGroup>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header style={s.header}>
          <p style={s.headerText}>
            Logged in as{" "}
            <span style={{ color: "var(--ne-fg)", fontWeight: 600 }}>{user.name}</span>
          </p>
          <div style={s.navActions}>
            <a href="/admin/account" style={s.navBtn}>
              <span style={{ display: "inline-flex", color: "var(--ne-fg)" }}>
                <PersonIcon size={18} />
              </span>
              <span>Account</span>
            </a>
            <form action={logoutAction}>
              <button type="submit" style={s.navBtn}>
                <span style={{ display: "inline-flex", color: "var(--ne-fg)" }}>
                  <LogoutIcon size={18} />
                </span>
                <span>Logout</span>
              </button>
            </form>
          </div>
        </header>
        <div style={s.content}>{children}</div>
      </div>
    </div>
  );
}

function NavItem({
  active,
  children,
  href,
  icon,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
  icon?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 10,
        padding: "9px 12px",
        fontSize: 15,
        fontWeight: 600,
        color: active ? "var(--ne-fg)" : hovered ? "var(--ne-fg)" : "var(--ne-muted)",
        background: active || hovered ? "rgba(127,127,127,0.08)" : "transparent",
        textDecoration: "none",
        lineHeight: 1.3,
        transition: "background 120ms, color 120ms",
      }}
    >
      {icon ? (
        <span
          style={{
            display: "inline-flex",
            color: active ? "var(--ne-fg)" : hovered ? "var(--ne-fg)" : "var(--ne-muted)",
          }}
        >
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </a>
  );
}

function NavGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ borderTop: "1px solid var(--ne-border-strong)", paddingTop: 12 }}>
      <p
        style={{
          margin: "0 0 8px",
          padding: "0 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ne-muted)",
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  );
}
