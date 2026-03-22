"use client";

import Link from "next/link";
import { EditableImage, EditableText, useEditor } from "@makeablebrand/next-editor/client";

type DemoEditorApi = {
  getFieldValue: <T = unknown>(fieldId: string) => T | undefined;
};

export function HomePageView() {
  const { getFieldValue } = useEditor() as DemoEditorApi;
  const theme = getFieldValue<"linen" | "stone">("hero.theme") ?? "linen";
  const showCta = getFieldValue<boolean>("cta.enabled") ?? true;
  const ctaUrl = getFieldValue<string>("cta.buttonUrl") ?? "/about";
  const showFeature1 = getFieldValue<boolean>("features.item1.enabled") ?? true;
  const showFeature2 = getFieldValue<boolean>("features.item2.enabled") ?? true;
  const showFeature3 = getFieldValue<boolean>("features.item3.enabled") ?? true;
  const heroTheme =
    theme === "stone"
      ? "from-stone-300 via-stone-100 to-white"
      : "from-amber-200 via-orange-50 to-white";

  const visibleFeatures = [
    showFeature1 && "item1",
    showFeature2 && "item2",
    showFeature3 && "item3",
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <section
        className={`editor-demo-grid overflow-hidden rounded-[40px] border border-white/70 bg-gradient-to-br ${heroTheme} p-6 shadow-[0_24px_80px_rgba(24,24,27,0.12)] md:p-10`}
      >
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <EditableText
              fieldId="hero.eyebrow"
              value=""
              as="p"
              className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-600"
            >{null}</EditableText>
            <EditableText
              fieldId="hero.heading"
              value=""
              as="h1"
              className="mt-6 max-w-3xl text-5xl leading-[1.05] font-semibold text-zinc-950 md:text-7xl"
            >{null}</EditableText>
            <EditableText
              fieldId="hero.subheading"
              value=""
              as="p"
              className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700"
            >{null}</EditableText>
          </div>
          <EditableImage
            fieldId="hero.image"
            src=""
            alt="Workspace showing website design planning"
            className="h-[420px] w-full"
          />
        </div>
      </section>

      {visibleFeatures.length > 0 ? (
        <section className="mt-8 rounded-[36px] border border-zinc-200 bg-[#fffdf8] p-8 shadow-[0_12px_40px_rgba(24,24,27,0.06)] md:p-10">
          <EditableText
            fieldId="features.heading"
            value=""
            as="h2"
            className="text-2xl font-semibold text-zinc-950"
          >{null}</EditableText>
          <div
            className={`mt-8 grid gap-5 ${
              visibleFeatures.length === 1
                ? "grid-cols-1"
                : visibleFeatures.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
            }`}
          >
            {visibleFeatures.map((key) => (
              <div
                key={key}
                className="rounded-[20px] border border-zinc-200 bg-white p-6 shadow-[0_4px_16px_rgba(24,24,27,0.05)]"
              >
                <EditableText
                  fieldId={`features.${key}.title`}
                  value=""
                  as="h3"
                  className="text-base font-semibold text-zinc-950"
                >{null}</EditableText>
                <EditableText
                  fieldId={`features.${key}.body`}
                  value=""
                  as="p"
                  className="mt-3 text-sm leading-7 text-zinc-600"
                >{null}</EditableText>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showCta ? (
        <section className="mt-8 rounded-[36px] border border-zinc-200 bg-[#fffdf8] p-10 shadow-[0_12px_40px_rgba(24,24,27,0.08)]">
          <EditableText
            fieldId="cta.heading"
            value=""
            as="h2"
            className="max-w-2xl text-3xl font-semibold text-zinc-950 md:text-4xl"
          >{null}</EditableText>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={ctaUrl}
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <EditableText
                fieldId="cta.buttonText"
                value=""
                as="span"
                className="font-sans text-white"
              >{null}</EditableText>
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
