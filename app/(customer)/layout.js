import Footer from "@/components/footer";

// Customer portal shell. Auth gating goes here once the provider is picked.
export default function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
