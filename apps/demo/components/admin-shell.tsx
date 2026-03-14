"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { ContentTypeDefinition } from "@/lib/content-types";
import type { DemoUser } from "@/lib/user-store";

type AdminShellProps = {
  children: ReactNode;
  contentTypes: ContentTypeDefinition[];
  isAdmin: boolean;
  user: DemoUser;
};

export function AdminShell({
  children,
  contentTypes,
  isAdmin,
  user,
}: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type");

  return (
    <div
      style={{
        display: "grid",
        minHeight: "100vh",
        gridTemplateColumns: "280px minmax(0, 1fr)",
        background: "var(--background)",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid var(--border-strong)",
          background: "var(--surface)",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SidebarLink href="/admin" active={pathname === "/admin" && !selectedType}>
            Dashboard
          </SidebarLink>
          <SidebarLink href="/admin/pages" active={pathname === "/admin/pages"}>
            Pages
          </SidebarLink>
          {contentTypes.map((type) => (
            <SidebarLink
              key={type.id}
              href={`/admin?type=${type.id}`}
              active={pathname === "/admin" && selectedType === type.id}
            >
              {type.label}
            </SidebarLink>
          ))}
          {isAdmin ? (
            <SidebarLink href="/admin/users" active={pathname === "/admin/users"}>
              Users
            </SidebarLink>
          ) : null}
        </div>

        <div>
          <SidebarLink href="/admin/settings" active={pathname === "/admin/settings"}>
            Settings
          </SidebarLink>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            borderBottom: "1px solid var(--border-strong)",
            background: "var(--surface-elevated)",
            padding: "14px 32px",
            backdropFilter: "blur(16px)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.2,
              fontWeight: 500,
              color: "var(--muted)",
            }}
          >
            Logged in as{" "}
            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
              {user.name}
            </span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/admin/account" style={navLinkStyle}>
              Account
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                style={navLinkStyle}
              >
                Logout
              </button>
            </form>
          </div>
        </header>
        <div style={{ padding: 32 }}>{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        fontSize: 16,
        fontWeight: 700,
        color: active ? "var(--foreground)" : "var(--muted)",
        textDecoration: "none",
        lineHeight: 1.3,
      }}
    >
      {children}
    </Link>
  );
}

const navLinkStyle = {
  color: "var(--foreground)",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  background: "transparent",
  border: 0,
  padding: 0,
  cursor: "pointer",
} as const;
