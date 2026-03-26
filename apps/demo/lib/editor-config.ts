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
  slug,
  text,
  textarea,
  toggle,
} from "@makeablebrand/next-editor";

export const homePage = definePage({
  id: "home",
  label: "Home Page",
  path: "/",
  description: "Landing page with hero, features, CTA, and SEO controls.",
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        text({ id: "hero.eyebrow", label: "Eyebrow" }),
        text({ id: "hero.heading", label: "Heading" }),
        richText({ id: "hero.subheading", label: "Subheading" }),
        image({ id: "hero.image", label: "Hero image" }),
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
      id: "features",
      label: "Features",
      fields: [
        text({ id: "features.heading", label: "Section heading" }),
        text({ id: "features.item1.title", label: "Feature 1 title" }),
        textarea({ id: "features.item1.body", label: "Feature 1 description" }),
        toggle({ id: "features.item1.enabled", label: "Show feature 1" }),
        text({ id: "features.item2.title", label: "Feature 2 title" }),
        textarea({ id: "features.item2.body", label: "Feature 2 description" }),
        toggle({ id: "features.item2.enabled", label: "Show feature 2" }),
        text({ id: "features.item3.title", label: "Feature 3 title" }),
        textarea({ id: "features.item3.body", label: "Feature 3 description" }),
        toggle({ id: "features.item3.enabled", label: "Show feature 3" }),
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
  path: "/about",
  description: "About page content blocks and SEO controls.",
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
        image({ id: "team.image", label: "Section image" }),
      ],
    },
    {
      id: "values",
      label: "Values",
      fields: [
        text({ id: "values.heading", label: "Section heading" }),
        text({ id: "values.item1.title", label: "Value 1 title" }),
        textarea({ id: "values.item1.body", label: "Value 1 description" }),
        text({ id: "values.item2.title", label: "Value 2 title" }),
        textarea({ id: "values.item2.body", label: "Value 2 description" }),
        text({ id: "values.item3.title", label: "Value 3 title" }),
        textarea({ id: "values.item3.body", label: "Value 3 description" }),
      ],
    },
  ],
});

export const pageRegistry = {
  about: aboutPage,
  home: homePage,
};

export const postsCollection = defineCollection({
  id: "posts",
  label: "Posts",
  singularLabel: "Post",
  path: "/blog",
  description: "Editorial content such as blog posts, articles, and announcements.",
  useAsTitle: "title",
  sections: [
    {
      id: "content",
      label: "Content",
      fields: [
        text({ id: "title", label: "Title" }),
        slug({ id: "customSlug", label: "Custom slug override", description: "Optional internal slug field if you want a dedicated editable slug in addition to the system slug." }),
        textarea({ id: "excerpt", label: "Excerpt" }),
        image({ id: "thumbnail", label: "Thumbnail" }),
        richText({ id: "body", label: "Body" }),
        embed({ id: "embedCode", label: "Embed code", description: "Optional embed for video, forms, or interactive widgets." }),
      ],
    },
    {
      id: "seo",
      label: "Post Blocks",
      fields: [
        repeater({
          id: "relatedLinks",
          label: "Related links",
          fields: [
            text({ id: "label", label: "Label" }),
            text({ id: "url", label: "URL" }),
          ],
        }),
      ],
    },
  ],
});

export const eventsCollection = defineCollection({
  id: "events",
  label: "Events",
  singularLabel: "Event",
  path: "/events",
  description: "Time-based entries with event-specific fields and repeatable agenda items.",
  useAsTitle: "title",
  sections: [
    {
      id: "details",
      label: "Details",
      fields: [
        text({ id: "title", label: "Event title" }),
        textarea({ id: "summary", label: "Summary" }),
        richText({ id: "description", label: "Description" }),
        image({ id: "thumbnail", label: "Thumbnail" }),
        dateTime({ id: "startAt", label: "Start date & time" }),
        dateTime({ id: "endAt", label: "End date & time" }),
        text({ id: "venue", label: "Venue" }),
        repeater({
          id: "agenda",
          label: "Agenda items",
          fields: [
            text({ id: "title", label: "Item title" }),
            dateTime({ id: "time", label: "Time" }),
            textarea({ id: "notes", label: "Notes" }),
          ],
        }),
      ],
    },
  ],
});

export const nextEditorConfig = defineConfig({
  pages: Object.values(pageRegistry),
  collections: [postsCollection, eventsCollection],
  dashboardLinks: [
    defineDashboardLink({
      title: "NextEditor Repository",
      description: "View the source code, issues, and package development history.",
      href: "https://github.com/thomas-mcgee/next-editor",
    }),
  ],
});

export type DemoPageId = keyof typeof pageRegistry;
