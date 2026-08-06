import "./globals.css";
import Nav from "@/components/nav";

export const metadata = {
  title: "Thriftable",
  description: "Pre-loved premium. Curated by hand.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
