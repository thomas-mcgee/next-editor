import { definePage, image, select, text, textarea, toggle } from "next-editor";

export const homePage = definePage({
  id: "home",
  label: "Home Page",
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        text({ id: "hero.eyebrow", label: "Eyebrow" }),
        text({ id: "hero.heading", label: "Heading" }),
        textarea({ id: "hero.subheading", label: "Subheading" }),
        image({ id: "hero.image", label: "Hero image URL" }),
        select({
          id: "hero.theme",
          label: "Hero theme",
          options: [
            { label: "Linen", value: "linen" },
            { label: "Stone", value: "stone" },
          ],
        }),
      ],
    },
    {
      id: "cta",
      label: "Call To Action",
      fields: [
        text({ id: "cta.heading", label: "CTA heading" }),
        text({ id: "cta.buttonText", label: "Button text" }),
        text({ id: "cta.buttonUrl", label: "Button URL" }),
        toggle({ id: "cta.enabled", label: "Show CTA section" }),
      ],
    },
  ],
});

export const aboutPage = definePage({
  id: "about",
  label: "About Page",
  sections: [
    {
      id: "intro",
      label: "Intro",
      fields: [
        text({ id: "intro.heading", label: "Heading" }),
        textarea({ id: "intro.body", label: "Body copy" }),
      ],
    },
    {
      id: "team",
      label: "Team Section",
      fields: [
        text({ id: "team.heading", label: "Heading" }),
        textarea({ id: "team.body", label: "Body copy" }),
        image({ id: "team.image", label: "Section image URL" }),
      ],
    },
  ],
});

export const pageRegistry = {
  about: aboutPage,
  home: homePage,
};

export type DemoPageId = keyof typeof pageRegistry;
