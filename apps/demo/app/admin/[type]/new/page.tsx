import { notFound } from "next/navigation";
import { NewContentForm } from "@/components/new-content-form";
import { contentTypeRegistry } from "@/lib/content-types";

export default async function NewContentEntryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!(type in contentTypeRegistry)) {
    notFound();
  }

  const definition = contentTypeRegistry[type as keyof typeof contentTypeRegistry];

  return (
    <section className="font-sans">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2
            className="text-3xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            New {definition.singularLabel}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--muted)" }}>
            Start shaping the {definition.singularLabel.toLowerCase()} editor UI.
          </p>
        </div>
      </div>

      <NewContentForm definition={definition} />
    </section>
  );
}
