import type { Metadata } from "next";

type SeoValues = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    url?: string;
    type?: "website" | "article";
    siteName?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    card?: "summary" | "summary_large_image";
  };
};

export function createMetadata(seo: SeoValues): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonicalUrl
      ? {
          canonical: seo.canonicalUrl,
        }
      : undefined,
    robots: {
      index: seo.robotsIndex ?? true,
      follow: seo.robotsFollow ?? true,
    },
    openGraph: {
      title: seo.openGraph?.title ?? seo.title,
      description: seo.openGraph?.description ?? seo.description,
      url: seo.openGraph?.url ?? seo.canonicalUrl,
      type: seo.openGraph?.type ?? "website",
      siteName: seo.openGraph?.siteName,
      images: seo.openGraph?.image
        ? [
            {
              url: seo.openGraph.image,
              alt: seo.openGraph.imageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: seo.twitter?.card ?? "summary_large_image",
      title: seo.twitter?.title ?? seo.openGraph?.title ?? seo.title,
      description:
        seo.twitter?.description ?? seo.openGraph?.description ?? seo.description,
      images: seo.twitter?.image ? [seo.twitter.image] : undefined,
    },
  };
}
