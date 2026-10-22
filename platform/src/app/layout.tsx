import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "WeiterWert", template: "%s – WeiterWert" },
  description: "Gebrauchte Laptops und Tablets spenden – für Bildung, gegen Elektroschrott.",
  icons: { icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }, { url: "/favicon.png" }], apple: "/apple-touch-icon.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>
        <SiteHeader />
        <main><div className="container">{children}</div></main>
        <SiteFooter />
      </body>
    </html>
  );
}
