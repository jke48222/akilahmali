import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import SubscribeFooter from "@/components/SubscribeFooter";

export const metadata: Metadata = {
  title: "Akilah Mali",
  description: "Official site of Akilah Mali — music, tour, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Header />
        <main>{children}</main>
        <SubscribeFooter />
      </body>
    </html>
  );
}
