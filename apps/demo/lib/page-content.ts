import { getPageContent } from "next-editor/server";

type EditorPageValues = Record<string, unknown>;

const demoPageDefaults: Record<string, EditorPageValues> = {
  home: {
    hero: {
      eyebrow: "Inline editing for custom client sites",
      heading: "Here is the New Headline!!",
      subheading: "So here is where the new text will go!",
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      theme: "linen",
    },
    features: {
      heading: "Everything you need, nothing you don't.",
      item1: {
        title: "Inline editing",
        body: "Fields are defined in code and mapped directly to the live page. Editors click to change text, swap images, and toggle sections without leaving the site.",
        enabled: true,
      },
      item2: {
        title: "Package-owned CMS backend",
        body: "Authentication, admin routes, content handlers, and persistence live in next-editor so downstream projects mount routes instead of rebuilding CMS plumbing.",
        enabled: true,
      },
      item3: {
        title: "Role-based access",
        body: "Editors update live content while admins manage users from the built-in admin panel.",
        enabled: true,
      },
    },
    cta: {
      heading: "Ship changes without a page builder.",
      buttonText: "Book a planning call",
      buttonUrl: "/about",
      enabled: true,
    },
    seo: {
      title: "NextEditor Demo Home",
      description: "A minimal inline editing system for custom-built Next.js client websites.",
      canonicalUrl: "https://demo.local/",
      slug: "/",
      robotsIndex: true,
      robotsFollow: true,
      openGraph: {
        title: "NextEditor Demo Home",
        description: "See the inline editor, floating admin bar, and left-hand customizer sidebar in action.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Designers reviewing a website layout",
        url: "https://demo.local/",
        type: "website",
        siteName: "NextEditor Demo",
      },
      twitter: {
        title: "NextEditor Demo Home",
        description: "Minimal editing controls for custom Next.js sites.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Designers reviewing a website layout",
        card: "summary_large_image",
      },
    },
  },
  about: {
    intro: {
      heading: "A practical editing workflow for custom sites.",
      body: "The public site stays lean, the editable fields stay explicit, and page structure remains in code where it belongs.",
    },
    team: {
      heading: "Built for internal client delivery",
      body: "Editors change a handful of fields from the live site. Admin users still manage accounts and posts separately.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    },
    values: {
      heading: "How we work.",
      item1: {
        title: "Code owns structure",
        body: "Page layouts, component hierarchies, and field schemas live in your codebase, not in a CMS. Editors work within the boundaries developers set.",
      },
      item2: {
        title: "Editors stay in context",
        body: "Changes happen on the live site, not in a disconnected admin dashboard. What you edit is exactly what your visitors see.",
      },
      item3: {
        title: "Simple by default",
        body: "No plugin ecosystem to manage. No visual builder to fight with. Just a lightweight CMS layer on top of your Next.js code.",
      },
    },
    seo: {
      title: "NextEditor Demo About",
      description: "About page for the NextEditor demo workspace.",
      canonicalUrl: "https://demo.local/about",
      slug: "/about",
      robotsIndex: true,
      robotsFollow: true,
      openGraph: {
        title: "NextEditor Demo About",
        description: "Learn how the demo site is structured.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Team planning in front of screens",
        url: "https://demo.local/about",
        type: "website",
        siteName: "NextEditor Demo",
      },
      twitter: {
        title: "NextEditor Demo About",
        description: "About page for the NextEditor demo workspace.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Team planning in front of screens",
        card: "summary_large_image",
      },
    },
  },
};

export async function getDemoPageValues(pageId: "home" | "about"): Promise<EditorPageValues> {
  const storedValues = await getPageContent(pageId);
  return Object.keys(storedValues).length > 0 ? storedValues : demoPageDefaults[pageId];
}
