"use client";

import Link from "next/link";
import { EditableImage, EditableText, useEditor } from "next-editor/client";

export function HomePageView() {
  const { getFieldValue } = useEditor();
  const theme = getFieldValue<"linen" | "stone">("hero.theme") ?? "linen";
  const showCta = getFieldValue<boolean>("cta.enabled") ?? true;
  const ctaUrl = getFieldValue<string>("cta.buttonUrl") ?? "/about";
  const heroTheme =
    theme === "stone"
      ? "from-stone-300 via-stone-100 to-white"
      : "from-amber-200 via-orange-50 to-white";

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <section
        className={`editor-demo-grid overflow-hidden rounded-[40px] border border-white/70 bg-gradient-to-br ${heroTheme} p-6 shadow-[0_24px_80px_rgba(24,24,27,0.12)] md:p-10`}
      >
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <EditableText
              fieldId="hero.eyebrow"
              as="p"
              className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-600"
            />
            <EditableText
              fieldId="hero.heading"
              as="h1"
              className="mt-6 max-w-3xl text-5xl leading-[1.05] font-semibold text-zinc-950 md:text-7xl"
            />
            <EditableText
              fieldId="hero.subheading"
              as="p"
              className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700"
            />
          </div>
          <EditableImage
            fieldId="hero.image"
            alt="Workspace showing website design planning"
            className="h-[420px] w-full"
          />
        </div>
      </section>

      {showCta ? (
        <section className="mt-8 rounded-[36px] border border-zinc-200 bg-[#fffdf8] p-10 shadow-[0_12px_40px_rgba(24,24,27,0.08)]">
          <EditableText
            fieldId="cta.heading"
            as="h2"
            className="max-w-2xl text-3xl font-semibold text-zinc-950 md:text-4xl"
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={ctaUrl}
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <EditableText
                fieldId="cta.buttonText"
                as="span"
                className="font-sans"
              />
            </Link>
            <p className="font-sans text-sm text-zinc-500">
              Target URL:
              <span className="ml-2 text-zinc-800">{ctaUrl}</span>
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
