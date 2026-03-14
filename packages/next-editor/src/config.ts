import type {
  BaseFieldDefinition,
  FieldDefinition,
  FieldOption,
  PageDefinition,
  PageSectionDefinition,
} from "./types";

type DefinePageInput = {
  id: string;
  label: string;
  sections: PageSectionDefinition[];
  includeSeoSection?: boolean;
};

function createField<T extends FieldDefinition>(
  field: T,
  sectionId?: string,
): T {
  return {
    ...field,
    sectionId,
  };
}

export function text(field: BaseFieldDefinition) {
  return createField({
    ...field,
    type: "text",
  });
}

export function textarea(field: BaseFieldDefinition) {
  return createField({
    ...field,
    type: "textarea",
  });
}

export function image(field: BaseFieldDefinition) {
  return createField({
    ...field,
    type: "image",
  });
}

export function toggle(field: BaseFieldDefinition) {
  return createField({
    ...field,
    type: "toggle",
  });
}

export function select(
  field: BaseFieldDefinition & { options: FieldOption[] },
) {
  return createField({
    ...field,
    type: "select",
  });
}

function createSeoSection(): PageSectionDefinition {
  return {
    id: "seo",
    label: "SEO",
    fields: [
      text({ id: "seo.title", label: "SEO Title" }),
      textarea({
        id: "seo.description",
        label: "Meta Description",
      }),
      text({ id: "seo.canonicalUrl", label: "Canonical URL" }),
      text({ id: "seo.slug", label: "Slug" }),
      toggle({ id: "seo.robotsIndex", label: "Allow Indexing" }),
      toggle({ id: "seo.robotsFollow", label: "Allow Following" }),
      text({ id: "seo.openGraph.title", label: "Open Graph Title" }),
      textarea({
        id: "seo.openGraph.description",
        label: "Open Graph Description",
      }),
      image({ id: "seo.openGraph.image", label: "Open Graph Image" }),
      text({
        id: "seo.openGraph.imageAlt",
        label: "Open Graph Image Alt",
      }),
      text({ id: "seo.openGraph.url", label: "Open Graph URL" }),
      select({
        id: "seo.openGraph.type",
        label: "Open Graph Type",
        options: [
          { label: "Website", value: "website" },
          { label: "Article", value: "article" },
        ],
      }),
      text({ id: "seo.openGraph.siteName", label: "Site Name" }),
      text({ id: "seo.twitter.title", label: "X Title" }),
      textarea({
        id: "seo.twitter.description",
        label: "X Description",
      }),
      image({ id: "seo.twitter.image", label: "X Image" }),
      text({
        id: "seo.twitter.imageAlt",
        label: "X Image Alt",
      }),
      select({
        id: "seo.twitter.card",
        label: "Card Type",
        options: [
          { label: "Summary Large Image", value: "summary_large_image" },
          { label: "Summary", value: "summary" },
        ],
      }),
    ],
  };
}

export function definePage(input: DefinePageInput): PageDefinition {
  const sections = input.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => ({
      ...field,
      sectionId: section.id,
    })),
  }));

  if (input.includeSeoSection !== false) {
    sections.push({
      ...createSeoSection(),
      fields: createSeoSection().fields.map((field) => ({
        ...field,
        sectionId: "seo",
      })),
    });
  }

  return {
    id: input.id,
    label: input.label,
    sections,
  };
}
