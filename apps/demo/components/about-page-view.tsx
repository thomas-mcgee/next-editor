"use client";

import { EditableImage, EditableText } from "next-editor";

export function AboutPageView() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <section className="rounded-[40px] border border-zinc-200 bg-white p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] md:p-12">
        <EditableText
          fieldId="intro.heading"
          as="h1"
          className="max-w-3xl text-5xl leading-tight font-semibold text-zinc-950"
        />
        <EditableText
          fieldId="intro.body"
          as="p"
          className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700"
        />
      </section>

      <section className="mt-8 grid gap-8 rounded-[40px] border border-zinc-200 bg-[#f8f4ec] p-8 shadow-[0_20px_60px_rgba(24,24,27,0.06)] md:grid-cols-[0.95fr_1.05fr] md:items-center md:p-10">
        <EditableImage
          fieldId="team.image"
          alt="Team planning around laptops"
          className="h-[360px] w-full"
        />
        <div>
          <EditableText
            fieldId="team.heading"
            as="h2"
            className="text-3xl font-semibold text-zinc-950"
          />
          <EditableText
            fieldId="team.body"
            as="p"
            className="mt-5 text-lg leading-8 text-zinc-700"
          />
        </div>
      </section>
    </main>
  );
}
