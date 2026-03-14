export type ContentFieldType = "text" | "textarea" | "slug" | "status" | "date";

export type ContentTypeField = {
  id: string;
  label: string;
  type: ContentFieldType;
};

export type ContentTypeDefinition = {
  id: string;
  label: string;
  singularLabel: string;
  description: string;
  fields: ContentTypeField[];
};

export type ContentEntry = {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  excerpt?: string;
  updatedAt: string;
  updatedBy: string;
  publishedAt?: string | null;
  [key: string]: unknown;
};

export const contentTypeRegistry = {
  posts: {
    id: "posts",
    label: "Posts",
    singularLabel: "Post",
    description:
      "Base editorial entries for blog-like content. Additional types such as articles, announcements, or events can be added alongside this.",
    fields: [
      { id: "title", label: "Title", type: "text" },
      { id: "slug", label: "Slug", type: "slug" },
      { id: "excerpt", label: "Excerpt", type: "textarea" },
      { id: "status", label: "Status", type: "status" },
      { id: "publishedAt", label: "Publish Date", type: "date" },
    ],
  },
} satisfies Record<string, ContentTypeDefinition>;

export type ContentTypeId = keyof typeof contentTypeRegistry;

export function listContentTypes() {
  return Object.values(contentTypeRegistry);
}
