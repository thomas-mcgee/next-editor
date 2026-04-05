# NextEditor

`@makeablebrand/next-editor` is a drop-in CMS layer for custom Next.js sites. It handles authentication, user management, an admin panel, incoming-form intake, and a live-site editing experience — everything you need to replace WordPress without giving up control of your code.

**The intended workflow:**

1. Start a blank Next.js project
2. `npm install @makeablebrand/next-editor`
3. Set three environment variables
4. Create two small stub files
5. Build your frontend

Your client gets login-protected, live-site content editing. You keep full control of the code, the database, and the hosting.

---

## What's included

- **Floating edit bar** — appears for logged-in editors; lets them enter edit mode or go to admin
- **Sidebar editor** — fields panel that opens alongside the live page so editors see changes in context
- **Admin panel** — built-in at `/admin`; first visit triggers a setup screen when no users exist
- **First-run setup** — prompts for the first administrator account when the database is empty
- **Authentication** — username/password login with JWT sessions via NextAuth v5
- **Password reset** — request/reset flow with Brevo email delivery
- **Bot protection** — Cloudflare Turnstile on the login form with a disable flag and test-key fallback
- **User roles** — Admin (content editing + user management) and Editor (content editing only)
- **Content storage** — page values saved to your Postgres database automatically
- **Incoming collections** — public form submissions can be saved into admin-visible intake collections
- **Image uploads** — drag-and-drop or click-to-select, stored in Backblaze B2 (optional)
- **Rich text** — built-in rich text editor via Lexxy

---

## Installation

```bash
npm install @makeablebrand/next-editor
```

Requires **Next.js ≥ 15** and **React ≥ 19**.

---

## Setup

### 1. Environment variables

```bash
# Required
DATABASE_URL=postgres://...    # Any Postgres database (Neon, Supabase, Railway, local)
AUTH_SECRET=...                # Random secret — run: openssl rand -base64 32

# Optional — password reset emails via Brevo
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=admin@example.com
BREVO_SENDER_NAME=Your Site Name
NEXT_EDITOR_APP_URL=https://your-site.com

# Optional — login protection via Cloudflare Turnstile
# Default behavior is ON. Set to false/off/0/no to disable.
NEXT_EDITOR_TURNSTILE_ENABLED=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key

# Optional — enables drag-and-drop image uploads via Backblaze B2
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_REGION=us-west-002
B2_BUCKET_NAME=your-bucket-name
B2_APPLICATION_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_PUBLIC_BASE_URL=https://your-bucket.s3.us-west-002.backblazeb2.com
```

`DATABASE_URL` and `AUTH_SECRET` are the only required variables. Password reset email delivery requires the Brevo variables. Turnstile defaults to enabled; if you do not provide real Turnstile keys, NextEditor falls back to Cloudflare's test keys so local/dev login flows do not break. The database tables (`ne_users`, `ne_content`, `ne_collection_entries`, `ne_password_reset_tokens`) are created automatically on first run — no migration step needed.

### 2. Mount the auth route

```ts
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@makeablebrand/next-editor/auth";
```

### 3. Define your editable pages

Create your page and collection definitions in one place and export a NextEditor config. Pages are a built-in content type and always appear in the admin when they are included in this config. Collections add custom content types such as posts, events, announcements, landing pages, or incoming submissions.

```ts
// lib/editor-config.ts
import {
  dateTime,
  defineCollection,
  defineConfig,
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

Standard collections get built-in publication metadata in admin:

- `status`: `draft`, `published`, or `scheduled`
- `slug`: optional URL slug
- `publishedAt`: publish/schedule date and time

Collections do not require a title field. If you want a human-friendly label in admin lists, set `useAsTitle` to one of your field ids.

Incoming collections are also supported for contact forms, assessments, lead capture, and other public-site submissions:

```ts
const contactSubmissions = defineCollection({
  id: "contact-submissions",
  label: "Contact Submissions",
  singularLabel: "Submission",
  mode: "incoming",
  useAsTitle: "name",
  incoming: {
    statuses: [
      { label: "New", value: "new" },
      { label: "Contacted", value: "contacted" },
      { label: "Resolved", value: "resolved" },
    ],
    defaultStatus: "new",
  },
  sections: [
    {
      id: "contact",
      label: "Contact Details",
      fields: [
        text({ id: "name", label: "Name" }),
        text({ id: "email", label: "Email" }),
        text({ id: "phone", label: "Phone" }),
        textarea({ id: "message", label: "Message" }),
      ],
    },
  ],
});
```

### Page import template and importer

The package includes a page-only import helper at `@makeablebrand/next-editor/import`. It validates JSON against your registered page definitions and imports the result into `ne_content`, one payload per page.

There is also a generic reference file at `@makeablebrand/next-editor/templates/pages-import.template.json`, but the intended workflow is to generate a config-specific template from your actual `nextEditorConfig`:

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
```

Run it with a TypeScript runner such as:

```bash
npx tsx scripts/generate-page-import-template.ts
```

The generated JSON uses this shape:

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

Import rules:

- Only pages are imported by this workflow.
- `pageId` must exist in your registered page config.
- `path` is optional, but if present it must match the registered page path.
- `toggle` values must be booleans.
- `select` values must match configured option values.
- `text`, `textarea`, `image`, `slug`, `dateTime`, `richtext`, and `embed` values must be strings.

### 4. Mount the admin panel

```ts
// app/admin/[[...slug]]/page.tsx
import { createAdminPage } from "@makeablebrand/next-editor/admin";
import { nextEditorConfig } from "@/lib/editor-config";

export default createAdminPage(nextEditorConfig);
```

### `next.config.ts` for the admin panel

If you mount the built-in admin UI, add:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@material-symbols-svg/react"],
  },
};

export default nextConfig;
```

This keeps development-time module resolution fast for the admin icon package. The icons remain admin-only and do not belong in any public route import graph.

### 5. Import styles

```ts
// app/layout.tsx
import "@makeablebrand/next-editor/lexxy.css";
```

### 6. First run

Start your dev server and visit `/admin`. Since no users exist yet, you'll be shown a setup screen to create your first administrator account.

---

## Building your site

### Use your page definitions
`definePage` automatically appends an SEO section (meta title, description, Open Graph, Twitter card) unless you pass `includeSeoSection: false`.

### Wrap your page

```tsx
// app/page.tsx
import { EditorProvider, EditorSidebar, FloatingAdminBar, EditorViewport } from "@makeablebrand/next-editor/client";
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
      {isEditor && <EditorSidebar />}
      {isEditor && <FloatingAdminBar />}
      <EditorViewport>
        <YourPageContent />
      </EditorViewport>
    </EditorProvider>
  );
}
```

### Mount the content + upload handlers

The `saveUrl` and `imageUploadUrl` above need a route handler:

```ts
// app/api/ne/[...path]/route.ts
export { GET, POST } from "@makeablebrand/next-editor/handlers";
```

This single file handles both `/api/ne/content` (save/load page values) and `/api/ne/upload` (B2 image upload).

### Save public form submissions into an incoming collection

Incoming collections are written by your app code, not by the built-in `/api/ne/*` handler. Use the server helper from your own route:

```ts
// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createIncomingCollectionEntry } from "@makeablebrand/next-editor/server";
import { nextEditorConfig } from "@/lib/editor-config";

export async function POST(req: NextRequest) {
  const body = await req.json();

  await createIncomingCollectionEntry(nextEditorConfig, {
    collectionId: "contact-submissions",
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

### Import page content from JSON

Create a script in your app to run the import:

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

Run it with:

```bash
npx tsx scripts/import-pages.ts ./content/pages-import.json
```

`mode: "replace"` expects a complete page payload. `mode: "merge"` lets you patch existing page values instead. Validation is strict by default, so every registered page and field is expected unless you opt into `allowPartialPages` or `allowPartialFields` in code.

Recommended sequence:

1. Generate the page template from your `nextEditorConfig`.
2. Fill that JSON with content scraped from the site you are replacing.
3. Review image URLs, select values, toggles, and SEO fields.
4. Run the import script against the target database.
5. Verify the redesigned site renders imported content rather than code-level fallback copy.

### Render collection content on the frontend

Use the server helpers from `@makeablebrand/next-editor/server` in your own routes/pages:

```ts
import {
  createIncomingCollectionEntry,
  getPublishedEntryBySlug,
  listPublishedEntries,
} from "@makeablebrand/next-editor/server";

const posts = await listPublishedEntries("posts");
const event = await getPublishedEntryBySlug("events", slug);
await createIncomingCollectionEntry(nextEditorConfig, {
  collectionId: "contact-submissions",
  values: { name: "Ada Lovelace", email: "ada@example.com" },
});
```

### Mark editable elements

```tsx
"use client";

import { EditableText, EditableImage, useEditor } from "@makeablebrand/next-editor/client";

export function HeroSection() {
  const { getFieldValue } = useEditor();
  const theme = getFieldValue<string>("hero.theme") ?? "light";

  return (
    <section style={{ background: theme === "dark" ? "#18181b" : "#fff" }}>
      <EditableText fieldId="hero.heading" as="h1" className="text-5xl font-bold" />
      <EditableText fieldId="hero.subheading" as="p" />
      <EditableImage fieldId="hero.image" alt="Hero image" className="w-full h-[480px]" />
    </section>
  );
}
```

---

## User roles

| Role | Edit content | Manage users |
|---|---|---|
| **Admin** | Yes | Yes |
| **Editor** | Yes | No |

The first account created via the setup screen is always an Admin. Additional users are added from the admin panel at `/admin/users`.

---

## Image uploads

When `imageUploadUrl` is set (or you use the package handlers), the image field in the sidebar shows a drag-and-drop zone and a click-to-select file picker. A URL paste fallback is always shown.

Image uploads require the B2 environment variables. If they are not set, the upload endpoint returns an error and the sidebar falls back to URL-only input.

---

## Rich text

The package includes a rich text editor built on [Lexxy](https://github.com/37signals/lexxy).

```tsx
import { RichTextEditor } from "@makeablebrand/next-editor/rich-text";

<RichTextEditor
  name="body"
  initialValue={html}
  uploadUrl="/api/ne/upload"
/>
```

Import the bundled styles in your root layout (required):

```ts
import "@makeablebrand/next-editor/lexxy.css";
```

---

## Package exports

| Import | Contents |
|---|---|
| `@makeablebrand/next-editor` | `definePage`, `defineCollection`, `defineConfig`, field builders (`text`, `textarea`, `image`, `select`, `toggle`, `slug`, `dateTime`, `richText`, `embed`, `repeater`), TypeScript types |
| `@makeablebrand/next-editor/client` | `EditorProvider`, `EditorSidebar`, `FloatingAdminBar`, `EditorViewport`, `EditableText`, `EditableImage`, `EditableRegion`, `useEditor` |
| `@makeablebrand/next-editor/server` | `canEdit()`, `getPageContent()`, `getSession()`, collection entry helpers for published and admin-facing reads |
| `@makeablebrand/next-editor/auth` | NextAuth route handlers — mount at `app/api/auth/[...nextauth]/route.ts` |
| `@makeablebrand/next-editor/admin` | `createAdminPage(...)` plus the admin page component |
| `@makeablebrand/next-editor/handlers` | Content + upload route handlers — mount at `app/api/ne/[...path]/route.ts` |
| `@makeablebrand/next-editor/rich-text` | `RichTextEditor` |
| `@makeablebrand/next-editor/b2` | `uploadImageToB2`, `hasB2Config` |
| `@makeablebrand/next-editor/lexxy.css` | Bundled Lexxy and editor UI styles |

---

## Repo structure

```
apps/
  demo/           Reference Next.js app showing a minimal @makeablebrand/next-editor integration
packages/
  next-editor/    The installable npm package
```

The demo is an end-to-end reference, not part of the product. The package is the product.

---

## Releases

This repo uses Changesets for versioning and changelog generation. The package publishes to the `@makeablebrand` npm scope.

### Standard release flow

1. Make a package change.
2. Run `npm run changeset` and describe the release.
3. Run `npm run version-packages`.
4. Review the generated version bump and changelog updates.
5. Commit the release changes.
6. Publish the package.

### Local publish

If you are publishing manually from your machine:

```bash
cd packages/next-editor
npm publish --access public --provenance=false
```

Notes:

- `publishConfig.provenance` is enabled in the package for CI-supported publishes, but local CLI publishes may fail with `Automatic provenance generation not supported for provider: null`. Use `--provenance=false` when publishing manually.
- npm may require an interactive browser approval or other 2FA/security-key verification during publish.
- If your npm org requires stronger publish auth, make sure your account or token satisfies that policy before publishing.

### GitHub Actions publish

This repo also includes a `Release` workflow driven by Changesets. If you publish through GitHub Actions instead of locally:

1. Merge your package changes to `main`.
2. The `Release` workflow opens or updates a release PR.
3. Merging that PR publishes `@makeablebrand/next-editor` to npm.

Required GitHub repository secret:

- `NPM_TOKEN` with publish access to the `@makeablebrand` npm scope

---

## Working on the package

### Prerequisites

- Node 20+
- A Postgres database (Neon, Supabase, Railway, or local)

### Install

```bash
npm install
```

### Set up the demo

```bash
cp apps/demo/.env.example apps/demo/.env.local
# Fill in DATABASE_URL and AUTH_SECRET
```

### Build the package

The demo consumes the workspace package directly. Build it before running the dev server:

```bash
npm run build --workspace=@makeablebrand/next-editor
```

### Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visit `/admin` to create the first admin account.
