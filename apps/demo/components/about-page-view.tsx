"use client";

import { EditableImage, EditableText } from "@makeablebrand/next-editor/client";

export function AboutPageView() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <section className="rounded-[40px] border border-zinc-200 bg-white p-8 shadow-[0_20px_60px_rgba(24,24,27,0.08)] md:p-12">
        <EditableText
          fieldId="intro.heading"
          value=""
          as="h1"
          className="max-w-3xl text-5xl leading-tight font-semibold text-zinc-950"
        >{null}</EditableText>
        <EditableText
          fieldId="intro.body"
          value=""
          as="p"
          className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700"
        >{null}</EditableText>
      </section>

      <section className="mt-8 grid gap-8 rounded-[40px] border border-zinc-200 bg-[#f8f4ec] p-8 shadow-[0_20px_60px_rgba(24,24,27,0.06)] md:grid-cols-[0.95fr_1.05fr] md:items-center md:p-10">
        <EditableImage
          fieldId="team.image"
          src=""
          alt="Team planning around laptops"
          className="h-[360px] w-full"
        />
        <div>
          <EditableText
            fieldId="team.heading"
            value=""
            as="h2"
            className="text-3xl font-semibold text-zinc-950"
          >{null}</EditableText>
          <EditableText
            fieldId="team.body"
            value=""
            as="p"
            className="mt-5 text-lg leading-8 text-zinc-700"
          >{null}</EditableText>
        </div>
      </section>

      <section className="mt-8 rounded-[40px] border border-zinc-200 bg-white p-8 shadow-[0_20px_60px_rgba(24,24,27,0.06)] md:p-10">
        <EditableText
          fieldId="values.heading"
          value=""
          as="h2"
          className="text-2xl font-semibold text-zinc-950"
        >{null}</EditableText>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(["item1", "item2", "item3"] as const).map((key) => (
            <div key={key} className="border-t border-zinc-200 pt-6">
              <EditableText
                fieldId={`values.${key}.title`}
                value=""
                as="h3"
                className="text-base font-semibold text-zinc-950"
              >{null}</EditableText>
              <EditableText
                fieldId={`values.${key}.body`}
                value=""
                as="p"
                className="mt-3 text-sm leading-7 text-zinc-600"
              >{null}</EditableText>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
