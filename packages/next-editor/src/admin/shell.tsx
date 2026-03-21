"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { User } from "../auth/user-store";
import type { CollectionDefinition } from "../types";

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

  return (
    <div style={s.root}>
      <aside style={s.aside}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <a href="/" style={s.visitBtn}>Visit Site</a>
          <NavItem href="/admin" active={pathname === "/admin"}>Dashboard</NavItem>
          <NavItem href="/admin/pages" active={pathname === "/admin/pages"}>Pages</NavItem>
          {collections.map((collection) => (
            <NavItem
              key={collection.id}
              href={`/admin/collections/${collection.id}`}
              active={pathname.startsWith(`/admin/collections/${collection.id}`)}
            >
              {collection.label}
            </NavItem>
          ))}
          {isAdmin && (
            <NavItem href="/admin/users" active={pathname.startsWith("/admin/users")}>
              Users
            </NavItem>
          )}
        </div>
        <NavItem href="/admin/settings" active={pathname === "/admin/settings"}>
          Settings
        </NavItem>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header style={s.header}>
          <p style={s.headerText}>
            Logged in as{" "}
            <span style={{ color: "var(--ne-fg)", fontWeight: 600 }}>{user.name}</span>
          </p>
          <div style={s.navActions}>
            <a href="/admin/account" style={s.navBtn}>Account</a>
            <form action={logoutAction}>
              <button type="submit" style={s.navBtn}>Logout</button>
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
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
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
      {children}
    </a>
  );
}
