# @makeablebrand/next-editor

A lightweight, code-first CMS layer for custom Next.js sites. Define editable fields directly in your page code, give editors a floating control bar and sidebar to make changes on the live site, and ship with built-in auth, admin, incoming-form intake, and content handlers.

There is no hosted service, no visual page builder, and no database vendor lock-in. Your page structure stays in code. Editors change a controlled set of fields without touching anything else.

---

## How it works

1. You **define a page schema** — a list of sections and fields (text, image, toggle, select, textarea) that describe what editors can change.
2. You **wrap your page** with `EditorProvider` and mark individual elements with `EditableText` or `EditableImage`. Those elements show an "Edit" button in edit mode and scroll the sidebar to the right field.
3. You mount the built-in auth, admin, and handler routes in your app.
4. When an editor clicks **Save**, the package POSTs the updated values to the built-in content handler and persists them in Postgres.
5. The page re-renders with the new values on the next load.

The built-in auth flow includes username/password login, optional Turnstile verification on the login form, and password reset emails delivered through Brevo.

---

## Installation

```bash
npm install @makeablebrand/next-editor
```

The package requires Next.js ≥ 15 and React ≥ 19 as peer dependencies, which your app already provides.

Import the Lexxy rich-text styles once in your root layout (required even if you don't use the rich-text editor — it scopes the editor UI styles):

```tsx
// app/layout.tsx
import "@makeablebrand/next-editor/lexxy.css";
```

---

## Getting started

### 1. Define your content model

Pages are a built-in content type in NextEditor. Define them in one place and export a config the
admin can consume. Collections are optional and let you extend the CMS beyond static pages.

```ts
// lib/editor-config.ts
import {
  dateTime,
  defineCollection,
  defineConfig,
  defineDashboardLink,
  definePage,
  embed,
  image,
  repeater,
  richText,
  select,
  text,
  textarea,
  toggle,
} from "@makeablebrand/next-editor";

export const homePage = definePage({
  id: "home",
  label: "Home Page",
  path: "/",
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        text({ id: "hero.heading", label: "Heading" }),
        textarea({ id: "hero.subheading", label: "Subheading" }),
        image({ id: "hero.image", label: "Hero image" }),
        select({
          id: "hero.theme",
          label: "Theme",
          options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ],
        }),
      ],
    },
  ],
});

export const nextEditorConfig = defineConfig({
  pages: [homePage],
  dashboardLinks: [
    defineDashboardLink({
      title: "Site Analytics",
      description: "Open the reporting dashboard for this project.",
      href: "https://example.com/analytics",
    }),
  ],
  collections: [
    defineCollection({
      id: "posts",
      label: "Posts",
      singularLabel: "Post",
      path: "/blog",
      useAsTitle: "title",
      sections: [
        {
          id: "content",
          label: "Content",
          fields: [
            text({ id: "title", label: "Title" }),
            textarea({ id: "excerpt", label: "Excerpt" }),
            image({ id: "thumbnail", label: "Thumbnail" }),
            richText({ id: "body", label: "Body" }),
          ],
        },
      ],
    }),
    defineCollection({
      id: "events",
      label: "Events",
      singularLabel: "Event",
      path: "/events",
      useAsTitle: "title",
      sections: [
        {
          id: "details",
          label: "Details",
          fields: [
            text({ id: "title", label: "Title" }),
            dateTime({ id: "startAt", label: "Start date & time" }),
            dateTime({ id: "endAt", label: "End date & time" }),
            richText({ id: "description", label: "Description" }),
            image({ id: "thumbnail", label: "Thumbnail" }),
            repeater({
              id: "agenda",
              label: "Agenda items",
              fields: [
                text({ id: "title", label: "Item title" }),
                textarea({ id: "notes", label: "Notes" }),
              ],
            }),
            embed({ id: "embedCode", label: "Embed code" }),
          ],
        },
      ],
    }),
  ],
});
```

`definePage` automatically appends an SEO section (meta title, description, Open Graph, Twitter card fields) unless you pass `includeSeoSection: false`.

`dashboardLinks` are optional dashboard cards rendered above collections in the admin home screen. They are intended for external resources like analytics, project communication, status pages, or client portals. They open in a new tab by default unless you set `openInNewTab: false`.

Every collection automatically gets publication controls in admin:

- `status`: `draft`, `published`, or `scheduled`
- `slug`: optional per-entry slug
- `publishedAt`: publish/schedule date and time

Collections do not require a `title` field. If you want a specific field to be used as the admin label, set `useAsTitle`.

Incoming collections are also supported for public-site form submissions. They use the same collection storage layer, but they are treated as non-publishable records in admin and can expose custom workflow statuses:

```ts
const consultationSubmissions = defineCollection({
  id: "consultation-submissions",
  label: "Consultation Submissions",
  singularLabel: "Submission",
  mode: "incoming",
  useAsTitle: "name",
  incoming: {
    enableReadTracking: true,
    statuses: [
      { label: "New", value: "new" },
      { label: "In Progress", value: "in-progress" },
      { label: "Resolved", value: "resolved" },
    ],
    defaultStatus: "new",
  },
  sections: [
    {
      id: "contact",
      label: "Contact Details",
      fields: [
        text({ id: "name", label: "Full Name" }),
        text({ id: "email", label: "Email Address" }),
        text({ id: "phone", label: "Phone Number" }),
        textarea({ id: "message", label: "Message" }),
      ],
    },
  ],
});
```

### Import templates and importers

NextEditor ships import helpers at `@makeablebrand/next-editor/import` for both page content and custom collections. Page imports validate against your registered page definitions, including the auto-generated SEO section, and write each payload into `ne_content`.

The package also ships a generic reference template at `@makeablebrand/next-editor/templates/pages-import.template.json`, but for a real site you should generate a config-specific template from your own `nextEditorConfig`:

```ts
// scripts/generate-page-import-template.ts
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPageImportTemplate } from "@makeablebrand/next-editor/import";
import { nextEditorConfig } from "../lib/editor-config";

const outputPath = resolve(process.cwd(), "content/pages-import.template.json");

await writeFile(
  outputPath,
  `${JSON.stringify(createPageImportTemplate(nextEditorConfig), null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${outputPath}`);
```

Run it with a TypeScript runner such as:

```bash
npx tsx scripts/generate-page-import-template.ts
```

The generated file uses this shape:

```json
{
  "version": 1,
  "pages": [
    {
      "pageId": "home",
      "path": "/",
      "values": {
        "hero": {
          "heading": "",
          "subheading": ""
        },
        "seo": {
          "title": ""
        }
      }
    }
  ]
}
```

Collection imports use a collection-specific document shape and validate every entry against the target collection's configured fields, including repeaters plus the collection metadata (`status`, and for publishable collections also `slug` and `publishedAt`). The package also ships a generic reference template at `@makeablebrand/next-editor/templates/collection-import.template.json`, but for a real site you should generate a config-specific template for the collection you want to import:

```ts
// scripts/generate-collection-import-template.ts
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createCollectionImportTemplate } from "@makeablebrand/next-editor/import";
import { nextEditorConfig } from "../lib/editor-config";

const collectionId = process.argv[2];

if (!collectionId) {
  throw new Error("Usage: tsx scripts/generate-collection-import-template.ts <collection-id>");
}

const outputPath = resolve(process.cwd(), `content/${collectionId}-import.template.json`);

await writeFile(
  outputPath,
  `${JSON.stringify(createCollectionImportTemplate(nextEditorConfig, collectionId), null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${outputPath}`);
```

The generated collection file uses this shape:

```json
{
  "version": 1,
  "collectionId": "posts",
  "entries": [
    {
      "entryId": "posts-entry-1",
      "slug": null,
      "status": "draft",
      "publishedAt": null,
      "values": {
        "title": "",
        "customSlug": "",
        "excerpt": "",
        "thumbnail": "",
        "body": "",
        "embedCode": "",
        "relatedLinks": []
      }
    }
  ]
}
```

Page import rules:

- `pageId` must match a page registered in your `nextEditorConfig`.
- `path` is optional, but if included it must match the registered page path.
- `values` must follow the page field structure exactly.
- `toggle` fields must be booleans.
- `select` fields must use one of the configured option values.
- `text`, `textarea`, `image`, `slug`, `dateTime`, `richtext`, and `embed` fields must be strings.

Collection import rules:

- `collectionId` must match a collection registered in your `nextEditorConfig`.
- `entryId` must be unique within the import document.
- `values` must match the collection field ids exactly, including repeater item fields.
- `slug` must be a string or `null` when included.
- `status` must match the configured workflow for that collection.
- `publishedAt` must be a string or `null` when included.

---

### 2. Mount the package routes

```ts
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@makeablebrand/next-editor/auth";
```

```ts
// app/admin/[[...slug]]/page.tsx
import { createAdminPage } from "@makeablebrand/next-editor/admin";
import { nextEditorConfig } from "@/lib/editor-config";

export default createAdminPage(nextEditorConfig);
```

If you use the built-in admin UI, add the following to your app's `next.config.ts` to keep dev-server module resolution fast when the admin imports Material Symbols:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@material-symbols-svg/react"],
  },
};

export default nextConfig;
```

The icon dependency is only used by the `@makeablebrand/next-editor/admin` export. Public page bundles do not include it unless you import admin modules from your frontend code.

```ts
// app/api/ne/[...path]/route.ts
export { GET, POST } from "@makeablebrand/next-editor/handlers";
```

`@makeablebrand/next-editor` creates its `ne_users`, `ne_content`, and `ne_collection_entries` tables automatically on first run. Visit `/admin` and the package will show `/admin/setup` when no users exist yet.

---

### 3. Load content and wrap the page

Load stored content values server-side and pass them to `EditorProvider`. The provider makes them available to all editable components on the page.

```tsx
// app/page.tsx
import { EditorProvider, EditorSidebar, EditorViewport, FloatingAdminBar } from "@makeablebrand/next-editor/client";
import { canEdit, getPageContent } from "@makeablebrand/next-editor/server";
import { homePage } from "@/lib/editor-config";

export default async function HomePage() {
  const [values, isEditor] = await Promise.all([
    getPageContent("home"),
    canEdit(),
  ]);

  return (
    <EditorProvider
      page={homePage}
      initialValues={values}
      canEdit={isEditor}
      saveUrl="/api/ne/content"
      imageUploadUrl="/api/ne/upload"
      adminHref="/admin"
    >
      {isEditor ? <EditorSidebar /> : null}
      {isEditor ? <FloatingAdminBar /> : null}
      <EditorViewport>
        <YourPageContent />
      </EditorViewport>
    </EditorProvider>
  );
}
```

`EditorViewport` shifts the page content right when the sidebar opens. `FloatingAdminBar` renders the "Edit" / "Admin" floating button in the corner.

### 3a. Save public form submissions into an incoming collection

Incoming collections are intentionally app-owned at the route layer. Define the collection in your config, then create an app route that writes submissions with the package server helper:

```ts
// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createIncomingCollectionEntry } from "@makeablebrand/next-editor/server";
import { nextEditorConfig } from "@/lib/editor-config";

export async function POST(req: NextRequest) {
  const body = await req.json();

  await createIncomingCollectionEntry(nextEditorConfig, {
    collectionId: "consultation-submissions",
    values: {
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      message: body.message ?? "",
    },
  });

  return NextResponse.json({ ok: true });
}
```

That route is your app's responsibility, not a built-in package endpoint. The package provides the storage model, admin UI, and server helper so your public form submissions can land in `ne_collection_entries` without mixing intake concerns into the live-site editor API.

---

### 3b. Import page content from JSON

Create a small script in your app that reads the JSON file and imports it:

```ts
// scripts/import-pages.ts
import { resolve } from "node:path";
import { importPagesFromFile } from "@makeablebrand/next-editor/import";
import { nextEditorConfig } from "../lib/editor-config";

const inputPath = process.argv[2];

if (!inputPath) {
  throw new Error("Usage: tsx scripts/import-pages.ts ./content/pages-import.json");
}

const result = await importPagesFromFile({
  config: nextEditorConfig,
  filePath: resolve(process.cwd(), inputPath),
  mode: "replace",
});

console.log(`Imported ${result.importedPageIds.length} pages: ${result.importedPageIds.join(", ")}`);
```

Run it after your JSON file has been filled with real content:

```bash
npx tsx scripts/import-pages.ts ./content/pages-import.json
```

Use `mode: "replace"` when your JSON file contains the full page payload for every field. Use `mode: "merge"` if you want to patch existing page values instead of replacing them wholesale. Validation is strict by default, so the import expects every registered page and every registered field unless you explicitly opt into partial imports in code with `allowPartialPages: true` and/or `allowPartialFields: true`.

Suggested workflow for a site redesign:

1. Generate the config-specific template.
2. Have your scraping/import agent fill the JSON file with content from the current site.
3. Review the JSON for select values, toggles, image URLs, and SEO fields.
4. Run the import script against the new site database.
5. Open the site and verify the editor is reading the imported values instead of your code-level placeholders.

### 3c. Import a collection from JSON

Create a small script in your app that reads the JSON file and imports it:

```ts
// scripts/import-collection.ts
import { resolve } from "node:path";
import { importCollectionFromFile } from "@makeablebrand/next-editor/import";
import { nextEditorConfig } from "../lib/editor-config";

const inputPath = process.argv[2];

if (!inputPath) {
  throw new Error("Usage: tsx scripts/import-collection.ts ./content/posts-import.json");
}

const result = await importCollectionFromFile({
  config: nextEditorConfig,
  filePath: resolve(process.cwd(), inputPath),
  mode: "replace",
});

console.log(
  `Imported ${result.importedEntryIds.length} entries into ${result.collectionId}: ${result.importedEntryIds.join(", ")}`,
);
```

Run it after your JSON file has been filled with real content:

```bash
npx tsx scripts/import-collection.ts ./content/posts-import.json
```

Use `mode: "replace"` when each imported entry contains the full field payload you want stored for that record. Use `mode: "merge"` if you want to patch an existing entry's `values` while preserving any omitted metadata or fields already in the database. Validation is strict by default, so each imported entry is expected to include every registered collection field unless you explicitly opt into partial imports in code with `allowPartialFields: true`.

---

### 4. Mark editable elements

Use `EditableText` and `EditableImage` in your client components. They read the current field value from context and show an "Edit" chip in edit mode that focuses the matching sidebar field.

```tsx
"use client";

import { EditableText, EditableImage, useEditor } from "@makeablebrand/next-editor/client";

export function HeroSection() {
  const { getFieldValue } = useEditor();
  const theme = getFieldValue<string>("hero.theme") ?? "light";

  return (
    <section className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>
      <EditableText
        fieldId="hero.heading"
        as="h1"
        className="text-5xl font-bold"
      />
      <EditableText
        fieldId="hero.subheading"
        as="p"
        className="text-lg text-zinc-600"
      />
      <EditableImage
        fieldId="hero.image"
        alt="Hero image"
        className="h-[480px] w-full"
      />
    </section>
  );
}
```

`EditableText` accepts an `as` prop for any HTML element or component. `EditableImage` renders a full-bleed `<img>` with object-fit cover inside the region.

Use `EditableRegion` to wrap arbitrary content that maps to a field without rendering a specific element:

```tsx
import { EditableRegion } from "@makeablebrand/next-editor/client";

<EditableRegion fieldId="hero.heading">
  <h1 className="text-5xl font-bold">{value}</h1>
</EditableRegion>
```

---

### 5. Use the built-in content + upload handler

The route above handles both `saveUrl="/api/ne/content"` and `imageUploadUrl="/api/ne/upload"`. It checks editor auth, reads and writes page content, and optionally uploads images to Backblaze B2 when configured.

### 6. Query collection entries on the frontend

Use the package server helpers from your own pages and routes:

```ts
import {
  createIncomingCollectionEntry,
  getCollectionEntryById,
  getPublishedEntryBySlug,
  listCollectionEntries,
  listPublishedEntries,
} from "@makeablebrand/next-editor/server";

const allPosts = await listPublishedEntries("posts");
const event = await getPublishedEntryBySlug("events", slug);
const adminRows = await listCollectionEntries("posts");
const draft = await getCollectionEntryById("posts", entryId);
await createIncomingCollectionEntry(nextEditorConfig, {
  collectionId: "consultation-submissions",
  values: { name: "Ada Lovelace", email: "ada@example.com" },
});
```

---

## Image uploads

When `imageUploadUrl` is set on `EditorProvider`, the image field in the sidebar shows a drag-and-drop zone and a click-to-select file picker instead of a plain URL input. A URL paste fallback is always shown below the drop zone.

### Backblaze B2

The package upload handler uses the built-in B2 helper automatically when these variables are present.

Set these environment variables in your `.env.local`:

```bash
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_REGION=us-west-002
B2_BUCKET_NAME=your-bucket-name
B2_APPLICATION_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_PUBLIC_BASE_URL=https://your-bucket.s3.us-west-002.backblazeb2.com
```

Find these values in the Backblaze B2 console under **App Keys** and **Buckets**. `B2_PUBLIC_BASE_URL` is the base URL used to construct public image URLs after upload. The package also accepts `B2_BUCKET_PUBLIC_URL` as a fallback alias if you already use that name elsewhere.

---

## Rich text editor

The package includes a rich text editor built on [Lexxy](https://github.com/37signals/lexxy). It is exported from a separate entry point to keep the main bundle light.

```tsx
import { RichTextEditor } from "@makeablebrand/next-editor/rich-text";

<RichTextEditor
  name="body"           // hidden input name for form submission
  initialValue={html}   // HTML string
  uploadUrl="/api/ne/upload"  // optional image upload endpoint
/>
```

The editor loads Lexxy asynchronously — it shows a placeholder until ready. Style the shell with the CSS classes:

| Class | Purpose |
|---|---|
| `shellClassName` | Outermost wrapper div |
| `editorClassName` | The `<lexxy-editor>` element |
| `loadingClassName` | Placeholder shown while loading |
| `statusClassName` | Upload status / error message |

Import the bundled Lexxy styles in your root layout (already required above):

```tsx
import "@makeablebrand/next-editor/lexxy.css";
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_SECRET` | Yes | Secret used to sign NextAuth JWTs. Generate with `openssl rand -base64 32`. |
| `DATABASE_URL` | Yes | Postgres connection string. Works with Neon, Supabase, Railway, or any Postgres 13+. |
| `BREVO_API_KEY` | No | Required for the built-in password reset email flow. |
| `BREVO_SENDER_EMAIL` | No | Sender email address used for Brevo password reset emails. |
| `BREVO_SENDER_NAME` | No | Sender display name for Brevo password reset emails. Defaults to `NextEditor`. |
| `NEXT_EDITOR_APP_URL` | No | Optional canonical site origin for password reset links when the current request origin is unavailable. |
| `NEXT_EDITOR_TURNSTILE_ENABLED` | No | Defaults to enabled. Set `false`, `off`, `0`, or `no` to disable Turnstile on the login form. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile site key. Falls back to Cloudflare test keys if omitted while Turnstile remains enabled. |
| `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile secret key. Falls back to Cloudflare test keys if omitted while Turnstile remains enabled. |
| `B2_ENDPOINT` | No | Backblaze B2 S3-compatible endpoint URL. |
| `B2_REGION` | No | B2 region (e.g. `us-west-002`). |
| `B2_BUCKET_NAME` | No | Name of your B2 bucket. |
| `B2_APPLICATION_KEY_ID` | No | B2 application key ID. |
| `B2_APPLICATION_KEY` | No | B2 application key secret. |
| `B2_PUBLIC_BASE_URL` | No | Base URL for constructing public image URLs after upload. |

B2 variables are only required if you use the built-in upload handler or call `uploadImageToB2` directly. Image fields fall back to a plain URL input when `imageUploadUrl` is not configured.

The login form uses Turnstile by default. If you do not provide real Turnstile keys, NextEditor uses Cloudflare test keys so local and preview auth flows still render without breaking. Password reset links are available from `/admin/login` and require Brevo to be configured before reset emails can be sent.

---

## Package exports

| Import path | Contents |
|---|---|
| `@makeablebrand/next-editor` | `definePage`, `defineCollection`, `defineConfig`, field builders (`text`, `textarea`, `image`, `select`, `toggle`, `slug`, `dateTime`, `richText`, `embed`, `repeater`), and TypeScript types |
| `@makeablebrand/next-editor/client` | `EditorProvider`, `EditorSidebar`, `EditorViewport`, `FloatingAdminBar`, `EditableText`, `EditableImage`, `EditableRegion`, `useEditor` |
| `@makeablebrand/next-editor/server` | `getSession`, `canEdit`, `getPageContent`, collection read helpers |
| `@makeablebrand/next-editor/auth` | NextAuth route handlers plus auth helpers |
| `@makeablebrand/next-editor/admin` | `createAdminPage(...)` plus the built-in admin page |
| `@makeablebrand/next-editor/handlers` | Built-in `/api/ne/content` and `/api/ne/upload` handlers |
| `@makeablebrand/next-editor/rich-text` | `RichTextEditor`, `uploadEditorImage` |
| `@makeablebrand/next-editor/b2` | `uploadImageToB2`, `hasB2Config`, `getB2Config` |
| `@makeablebrand/next-editor/lexxy.css` | Bundled Lexxy and editor UI styles |

`@makeablebrand/next-editor/client` and `@makeablebrand/next-editor/rich-text` are client-oriented ESM entry points intended for normal Next.js `import` usage.

---

## Auth

The package ships with built-in auth and admin flows. Mount `@makeablebrand/next-editor/auth` and `@makeablebrand/next-editor/admin`, set `AUTH_SECRET` and `DATABASE_URL`, then visit `/admin` to create the first admin account.

Roles:

- `admin`: can edit content and manage users
- `editor`: can edit content but cannot manage users
