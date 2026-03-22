import { defineConfig } from "tsup";

const external = [
  "next",
  "react",
  "react-dom",
  "next-auth",
  "pg",
  "bcryptjs",
  "@aws-sdk/client-s3",
  "@37signals/lexxy",
];

export default defineConfig([
  // ── Bundled with DTS — pure server or universal modules ──────────────────
  {
    entry: {
      index: "src/index.ts",
      server: "src/server.ts",
      b2: "src/b2.ts",
      "handlers/index": "src/handlers/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    splitting: true,
    external,
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
  },

  // ── Auth handlers — bundled, no DTS (next-auth type complexity) ───────────
  {
    entry: { "auth/index": "src/auth/index.ts" },
    format: ["esm", "cjs"],
    dts: false,
    splitting: true,
    external,
  },

  // ── Client boundary modules — ESM only to preserve "use client" ──────────
  {
    entry: {
      client: "src/client.ts",
      "rich-text-editor": "src/rich-text-editor.tsx",
    },
    format: ["esm"],
    dts: true,
    splitting: true,
    external,
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
  },

  // ── Admin panel — NOT bundled ─────────────────────────────────────────────
  // Each file is compiled individually so Next.js can see "use client" /
  // "use server" directives at the top of each output file.
  {
    entry: [
      "src/admin/index.tsx",
      "src/admin/theme-script.tsx",
      "src/admin/theme-provider.tsx",
      "src/admin/shell.tsx",
      "src/admin/login.tsx",
      "src/admin/setup.tsx",
      "src/admin/dashboard.tsx",
      "src/admin/pages.tsx",
      "src/admin/collection-list.tsx",
      "src/admin/collection-form.tsx",
      "src/admin/collection-actions.ts",
      "src/admin/users.tsx",
      "src/admin/users-new.tsx",
      "src/admin/account.tsx",
      "src/admin/settings.tsx",
      // Auth + content sub-modules imported by the admin components
      "src/auth/config.ts",
      "src/auth/actions.ts",
      "src/auth/user-store.ts",
      "src/auth/db.ts",
      "src/content/store.ts",
      "src/content/collection-store.ts",
    ],
    bundle: false,
    // These files are consumed by Next's RSC/server-action pipeline.
    // Emitting both `.mjs` and `.js` variants leaves extensionless relative
    // imports like `../auth/actions` ambiguous, and Turbopack can resolve the
    // CommonJS file from an ESM parent. That breaks server action references at
    // runtime (`$$RSC_SERVER_ACTION_* is not defined`). Emit ESM only here so
    // the relative graph stays format-consistent.
    format: ["esm"],
    dts: false,
    external,
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
  },
]);
