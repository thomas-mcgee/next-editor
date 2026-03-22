# NextEditor

`@makeablebrand/next-editor` is a drop-in CMS layer for custom Next.js sites. It handles authentication, user management, an admin panel, and a live-site editing experience — everything you need to replace WordPress without giving up control of your code.

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
- **User roles** — Admin (content editing + user management) and Editor (content editing only)
- **Content storage** — page values saved to your Postgres database automatically
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

# Optional — enables drag-and-drop image uploads via Backblaze B2
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_REGION=us-west-002
B2_BUCKET_NAME=your-bucket-name
B2_APPLICATION_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_PUBLIC_BASE_URL=https://your-bucket.s3.us-west-002.backblazeb2.com
```

`DATABASE_URL` and `AUTH_SECRET` are the only required variables. The database tables (`ne_users`, `ne_content`) are created automatically on first run — no migration step needed.

### 2. Mount the auth route

```ts
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@makeablebrand/next-editor/auth";
```

### 3. Define your editable pages

Create your page and collection definitions in one place and export a NextEditor config. Pages are a built-in content type and always appear in the admin when they are included in this config. Collections add custom content types such as posts, events, announcements, or landing pages.

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

Every collection gets built-in publication metadata in admin:

- `status`: `draft`, `published`, or `scheduled`
- `slug`: optional URL slug
- `publishedAt`: publish/schedule date and time

Collections do not require a title field. If you want a human-friendly label in admin lists, set `useAsTitle` to one of your field ids.

### 4. Mount the admin panel

```ts
// app/admin/[[...slug]]/page.tsx
import { createAdminPage } from "@makeablebrand/next-editor/admin";
import { nextEditorConfig } from "@/lib/editor-config";

export default createAdminPage(nextEditorConfig);
```

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

### Render collection content on the frontend

Use the server helpers from `@makeablebrand/next-editor/server` in your own routes/pages:

```ts
import { listPublishedEntries, getPublishedEntryBySlug } from "@makeablebrand/next-editor/server";

const posts = await listPublishedEntries("posts");
const event = await getPublishedEntryBySlug("events", slug);
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

This repo uses Changesets and GitHub Actions for package releases.

1. Make a package change.
2. Run `npm run changeset` and describe the release.
3. Merge to `main`.
4. The `Release` workflow opens or updates a release PR.
5. Merging that PR publishes `@makeablebrand/next-editor` to npm.

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
