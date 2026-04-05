"use client";

import type { CSSProperties, ReactNode } from "react";
import type { CollectionDefinition, CollectionEntryRecord } from "../types";
import { AddIcon, DeleteIcon, ViewIcon } from "./components/icons";

const cell: CSSProperties = { padding: "12px 16px", fontSize: 13 };

export function NeCollectionListPage({
  collection,
  entries,
  status,
  deleteAction,
}: {
  collection: CollectionDefinition;
  entries: CollectionEntryRecord[];
  status?: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const isIncoming = collection.mode === "incoming";
  const showPublicLink = !isIncoming;
  const columns = isIncoming ? ["Title", "Status", "Received", ""] : ["Title", "Slug", "Status", "Updated", ""];

  return (
    <section>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>{collection.label}</h2>
          <span style={{ borderRadius: 999, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "2px 10px", fontSize: 12, fontWeight: 600, color: "var(--ne-muted)" }}>
            {entries.length}
          </span>
        </div>
        {!isIncoming ? (
          <a
            href={`/admin/collections/${collection.id}/new`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface)", color: "var(--ne-fg)", padding: "8px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            <span style={{ display: "inline-flex", color: "var(--ne-fg)" }}>
              <AddIcon size={18} />
            </span>
            <span>Add {collection.singularLabel ?? "Entry"}</span>
          </a>
        ) : null}
      </div>

      <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)", maxWidth: 720 }}>
        {collection.description ?? (
          isIncoming
            ? `Review ${collection.label.toLowerCase()} submitted through your public-site intake flows.`
            : `Manage ${collection.label.toLowerCase()} entries with collection-specific fields and publication controls.`
        )}
      </p>

      {status === "saved" ? (
        <FlashMessage>Entry saved successfully.</FlashMessage>
      ) : null}
      {status === "deleted" ? (
        <FlashMessage>Entry deleted successfully.</FlashMessage>
      ) : null}
      {status === "invalid" ? (
        <FlashMessage>There was a problem saving this entry.</FlashMessage>
      ) : null}

      <div style={{ marginTop: 20, borderRadius: 14, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--ne-surface-muted)" }}>
              {columns.map((header) => (
                <th key={header} style={{ ...cell, fontWeight: 600, color: "var(--ne-muted)", textAlign: "left" }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ ...cell, color: "var(--ne-muted)" }}>
                  {isIncoming
                    ? `No submissions have arrived for ${collection.label.toLowerCase()} yet.`
                    : `No entries yet. Create the first ${collection.singularLabel?.toLowerCase() ?? "entry"}.`}
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.entryId} style={{ borderTop: "1px solid var(--ne-border-strong)" }}>
                  <td style={{ ...cell, fontWeight: 600 }}>
                    <a
                      href={`/admin/collections/${collection.id}/${entry.entryId}`}
                      style={{ color: "var(--ne-fg)", textDecoration: "none" }}
                    >
                      {getEntryTitle(collection, entry)}
                    </a>
                  </td>
                  {!isIncoming ? (
                    <td style={{ ...cell, color: "var(--ne-muted)" }}>{entry.slug ?? ""}</td>
                  ) : null}
                  <td style={{ ...cell, color: "var(--ne-muted)", textTransform: "capitalize" }}>{formatStatus(entry.status)}</td>
                  <td style={{ ...cell, color: "var(--ne-muted)" }}>{formatDate(isIncoming ? entry.createdAt : entry.updatedAt)}</td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
                      {showPublicLink && getEntryViewHref(collection, entry) ? (
                        <a
                          href={getEntryViewHref(collection, entry)!}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ne-muted)", textDecoration: "none" }}
                        >
                          <span style={{ display: "inline-flex", color: "var(--ne-muted)" }}>
                            <ViewIcon size={16} />
                          </span>
                          <span>View</span>
                        </a>
                      ) : null}
                      <form action={deleteAction}>
                        <input type="hidden" name="collectionId" value={collection.id} />
                        <input type="hidden" name="entryId" value={entry.entryId} />
                        <button
                          type="submit"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: 0, padding: 0, fontSize: 13, color: "var(--ne-muted)", cursor: "pointer" }}
                          onClick={(event) => {
                            if (!confirm(`Delete ${getEntryTitle(collection, entry)}?`)) event.preventDefault();
                          }}
                        >
                          <span style={{ display: "inline-flex", color: "var(--ne-muted)" }}>
                            <DeleteIcon size={16} />
                          </span>
                          <span>Delete</span>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FlashMessage({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: 14, borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "12px 16px", fontSize: 13, color: "var(--ne-fg)" }}>
      {children}
    </p>
  );
}

function getEntryTitle(collection: CollectionDefinition, entry: CollectionEntryRecord) {
  if (collection.useAsTitle) {
    const candidate = entry.values[collection.useAsTitle];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  for (const key of ["title", "name", "headline"]) {
    const candidate = entry.values[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  return entry.slug || entry.entryId;
}

function getEntryViewHref(collection: CollectionDefinition, entry: CollectionEntryRecord) {
  if (!collection.path || !entry.slug) return null;
  return joinPaths(collection.path, entry.slug);
}

function joinPaths(basePath: string, slug: string) {
  const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const normalizedSlug = slug.startsWith("/") ? slug.slice(1) : slug;
  return `${normalizedBase}/${normalizedSlug}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatus(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
