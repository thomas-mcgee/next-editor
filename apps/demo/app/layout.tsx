import type { Metadata } from "next";
import "@makeablebrand/next-editor/lexxy.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextEditor Demo",
  description: "Inline editing demo for custom-built Next.js client sites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
