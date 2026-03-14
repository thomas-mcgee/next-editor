import Link from "next/link";
import { listAllCollections, listPageDocuments } from "@/lib/content-store";
import {
  contentTypeRegistry,
  listContentTypes,
  type ContentEntry,
} from "@/lib/content-types";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const selectedType = params.type;

  if (selectedType && selectedType in contentTypeRegistry) {
    const type = contentTypeRegistry[selectedType as keyof typeof contentTypeRegistry];
    const collections = await listAllCollections();
    const entries = (collections[type.id] ?? []) as ContentEntry[];

    return (
      <section className="font-sans">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold" style={{ color: "var(--foreground)" }}>
              {type.label}
            </h2>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                border: "1px solid var(--border-strong)",
                color: "var(--muted)",
                background: "var(--surface)",
              }}
            >
              {entries.length}
            </span>
          </div>
          <Link
            href={`/admin/${type.id}/new`}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{
              border: "1px solid var(--border-strong)",
              color: "var(--foreground)",
              background: "var(--surface)",
              textDecoration: "none",
            }}
          >
            New {type.singularLabel}
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--muted)" }}>
          {type.description}
        </p>

        <div
          className="mt-6 overflow-hidden rounded-xl"
          style={{
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
          }}
        >
          <table
            className="min-w-full text-left text-sm"
            style={{ background: "var(--surface)" }}
          >
            <thead style={{ background: "var(--surface-muted)" }}>
              <tr>
                <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                  Title
                </th>
                <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                  Slug
                </th>
                <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                  Status
                </th>
                <th className="px-4 py-3 font-medium" style={{ color: "var(--muted)" }}>
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    style={{ borderTop: "1px solid var(--border-strong)" }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>
                          {entry.title}
                        </p>
                        {entry.excerpt ? (
                          <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--muted)" }}>
                            {entry.excerpt}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                      {entry.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          border: "1px solid var(--border-strong)",
                          color: "var(--foreground)",
                          background:
                            entry.status === "published"
                              ? "var(--surface-muted)"
                              : "transparent",
                        }}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                      {entry.updatedAt}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    No {type.label.toLowerCase()} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--muted)" }}
          >
            Registered Fields
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {type.fields.map((field) => (
              <span
                key={field.id}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  border: "1px solid var(--border-strong)",
                  background: "var(--surface-muted)",
                  color: "var(--foreground)",
                }}
              >
                {field.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const [pages, contentTypes, collections] = await Promise.all([
    listPageDocuments(),
    Promise.resolve(listContentTypes()),
    listAllCollections(),
  ]);

  const cards = [
    {
      id: "pages",
      label: "Pages",
      description:
        "Core site pages that always exist and are edited on the live site through the page editor.",
      count: pages.length,
      href: "/admin/pages",
    },
    ...contentTypes.map((type) => ({
      id: type.id,
      label: type.label,
      description: type.description,
      count: (collections[type.id] ?? []).length,
      href: `/admin?type=${type.id}`,
    })),
  ];

  return (
    <section className="font-sans">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="rounded-[16px] p-6 transition"
            style={{
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              boxShadow: "var(--shadow-soft)",
              textDecoration: "none",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {card.label}
              </h2>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{
                  border: "1px solid var(--border-strong)",
                  color: "var(--muted)",
                  background: "var(--surface-muted)",
                }}
              >
                {card.count}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6" style={{ color: "var(--muted)" }}>
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
