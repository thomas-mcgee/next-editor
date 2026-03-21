"use client";

import type { CSSProperties, ReactNode } from "react";
import type { CollectionDefinition, CollectionEntryRecord } from "../types";

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
  return (
    <section>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>{collection.label}</h2>
          <span style={{ borderRadius: 999, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "2px 10px", fontSize: 12, fontWeight: 600, color: "var(--ne-muted)" }}>
            {entries.length}
          </span>
        </div>
        <a
          href={`/admin/collections/${collection.id}/new`}
          style={{ borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface)", color: "var(--ne-fg)", padding: "8px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          Add {collection.singularLabel ?? "Entry"}
        </a>
      </div>

      <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)", maxWidth: 720 }}>
        {collection.description ?? `Manage ${collection.label.toLowerCase()} entries with collection-specific fields and publication controls.`}
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
              {["Title", "Slug", "Status", "Updated", ""].map((header) => (
                <th key={header} style={{ ...cell, fontWeight: 600, color: "var(--ne-muted)", textAlign: "left" }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...cell, color: "var(--ne-muted)" }}>
                  No entries yet. Create the first {collection.singularLabel?.toLowerCase() ?? "entry"}.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.entryId} style={{ borderTop: "1px solid var(--ne-border-strong)" }}>
                  <td style={{ ...cell, fontWeight: 600, color: "var(--ne-fg)" }}>{getEntryTitle(collection, entry)}</td>
                  <td style={{ ...cell, color: "var(--ne-muted)" }}>{entry.slug ?? ""}</td>
                  <td style={{ ...cell, color: "var(--ne-muted)", textTransform: "capitalize" }}>{entry.status}</td>
                  <td style={{ ...cell, color: "var(--ne-muted)" }}>{formatDate(entry.updatedAt)}</td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
                      <a href={`/admin/collections/${collection.id}/${entry.entryId}`} style={{ fontSize: 13, color: "var(--ne-muted)", textDecoration: "none" }}>
                        Edit
                      </a>
                      <form action={deleteAction}>
                        <input type="hidden" name="collectionId" value={collection.id} />
                        <input type="hidden" name="entryId" value={entry.entryId} />
                        <button
                          type="submit"
                          style={{ background: "none", border: 0, padding: 0, fontSize: 13, color: "var(--ne-muted)", cursor: "pointer" }}
                          onClick={(event) => {
                            if (!confirm(`Delete ${getEntryTitle(collection, entry)}?`)) event.preventDefault();
                          }}
                        >
                          Delete
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
