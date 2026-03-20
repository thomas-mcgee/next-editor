import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import "next-editor/lexxy.css";
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
      <body>
        <ThemeScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
