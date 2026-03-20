# next-editor

Installable editing package for custom Next.js sites.

## Public API

- `definePage`
- `text`, `textarea`, `image`, `select`, `toggle`
- `next-editor/client` for client-side editing components
- `next-editor/rich-text` for the Lexxy editor
- `next-editor/b2` for B2 upload helpers

## Rich Text

Import the bundled Lexxy styles once from your app root:

```tsx
import "next-editor/lexxy.css";
```

Use the editor from the package:

```tsx
import { RichTextEditor } from "next-editor/rich-text";
```

Import inline editing components from the client entrypoint:

```tsx
import { EditorProvider, EditableText } from "next-editor/client";
```

By default the editor posts images to `/api/uploads/image`. If you want a
different endpoint, pass `uploadUrl`, or pass a custom `uploadImage` callback.

## Backblaze B2

Server-side B2 helpers are exported from:

```ts
import { hasB2Config, uploadImageToB2 } from "next-editor/b2";
```

The host app still owns routes, auth, persistence, and page-level content
loading. The package owns the editor implementation and its required runtime
dependencies.
