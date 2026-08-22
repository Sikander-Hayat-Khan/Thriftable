import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/nav";
import Preloader from "@/components/loader";

const broela = localFont({
  src: "../public/fonts/broela/Broela.otf",
  variable: "--font-broela",
  display: "swap",
});

const calluna = localFont({
  src: "../public/fonts/calluna/Calluna-Regular.woff",
  variable: "--font-calluna",
  display: "swap",
});

const nomad = localFont({
  src: "../public/fonts/nomad/Nomad.otf",
  variable: "--font-nomad",
  display: "swap",
});

const macSans = localFont({
  src: "../public/fonts/mac_sans/MacSans-Regular.otf",
  variable: "--font-macsans",
  display: "swap",
});

const prodaSans = localFont({
  src: "../public/fonts/proda_sans/ProdaSans-Regular.woff2",
  variable: "--font-proda",
  display: "swap",
});

export const metadata = {
  title: "Thriftable",
  description: "Pre-loved premium. Curated by hand.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${broela.variable} ${calluna.variable} ${nomad.variable} ${macSans.variable} ${prodaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <Preloader />
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

