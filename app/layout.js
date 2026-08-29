import localFont from "next/font/local";
import { Caveat } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import ScrollToTop from "@/components/scroll-to-top";
import Preloader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/cart-provider";
import { AuthProvider } from "@/components/auth-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { OrdersProvider } from "@/components/orders-provider";
import { ReviewsProvider } from "@/components/reviews-provider";
import AppToastContainer from "@/components/toast-container";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-signature",
  weight: ["400", "700"],
  display: "swap",
});

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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${broela.variable} ${calluna.variable} ${nomad.variable} ${macSans.variable} ${prodaSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('thriftable-theme');
                  if (stored === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else if (stored === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <OrdersProvider>
                <ReviewsProvider>
                  <CartProvider>
                    <Preloader />
                    <Nav />
                    <main className="flex-1">{children}</main>
                    <AppToastContainer />
                    <ScrollToTop />
                  </CartProvider>
                </ReviewsProvider>
              </OrdersProvider>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

