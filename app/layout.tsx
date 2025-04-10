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
      <body className={inter.className}>
        <ImageProvider>{children}</ImageProvider>
      </body>
    </html>
  );
}
