import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = { title: "ARCHIVE", description: "A private personal archive.", manifest: "/manifest.json", appleWebApp: { capable: true, title: "ARCHIVE", statusBarStyle: "default" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="min-h-dvh antialiased">{children}<Script src="https://cdn-chatly.vyro.ai/chatly-make/sites-script/make-preview-runtime.js" strategy="afterInteractive" /><Script src="https://cdn-chatly.vyro.ai/chatly-make/sites-script/heading-override.js" strategy="afterInteractive" /></body></html>;
}
