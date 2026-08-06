import Link from "next/link";

const customerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
];

const adminLinks = [{ href: "/admin/dashboard", label: "Admin" }];

export default function Nav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-ink">
          Thriftable
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          {customerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
