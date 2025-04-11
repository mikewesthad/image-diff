import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ImageProvider } from "./ImageProvider/ImageProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Comparison Tool",
  description: "Compare two images pixel by pixel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${inter.className} text-slate-900`}>
        <ImageProvider>{children}</ImageProvider>
      </body>
    </html>
  );
}
