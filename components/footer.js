"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white px-8 sm:px-16 lg:px-24 py-10 min-h-[30vh] flex flex-col justify-between border-t border-white/10 relative z-20">
      {/* Top Header Row: GET IN TOUCH with Phone and Email Icons */}
      <div className="flex justify-between sm:justify-end items-center gap-6 pb-6 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-proda tracking-widest text-[#B2A376]">
          <div className="group border-gray-400 hover:bg-gray-400 cursor-pointer transition-all duration-300 ease-in border p-3 rounded-full">
            <a href="tel:+18005558474" className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          </div>

          <div className="group border-gray-400 hover:bg-gray-400 cursor-pointer transition-all duration-300 ease-in border p-3 rounded-full">
            <a href="mailto:hello@thriftable.com" className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>

          <span className="font-semibold text-white uppercase tracking-widest text-xs">
            GET IN TOUCH
          </span>
        </div>
      </div>

      {/* 4 Main Columns Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8">
        {/* Section 1: Contact */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-proda font-semibold tracking-widest uppercase text-white">
            Contact
          </h3>
          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-gray-300 font-proda font-light">
            <li>123 Vintage Lane, Suite 400</li>
            <li>New York, NY 10001</li>
            <li>Support: Mon - Fri, 9am - 6pm EST</li>
            <li className="pt-1 text-gray-300 hover:underline cursor-pointer">
              Find an Outlet Store →
            </li>
          </ul>
        </div>

        {/* Section 2: Information */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-proda font-semibold tracking-widest uppercase text-white">
            Information
          </h3>
          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-gray-300 font-proda font-light">
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">About Us</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Sustainability Impact</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Curated Sourcing</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Thriftable Journal</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Careers</Link></li>
          </ul>
        </div>

        {/* Section 3: Help */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-proda font-semibold tracking-widest uppercase text-white">
            Help
          </h3>
          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-300 font-proda font-light">
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Shipping & Delivery</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Condition Grade Guide</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Size Guide</Link></li>
            <li><Link href="/shop" className="hover:text-[#B2A376] transition-colors">Frequently Asked Questions</Link></li>
          </ul>
        </div>

        {/* Section 4: Sign Up For Our Newsletter */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-proda font-semibold tracking-widest uppercase text-white">
            Sign Up For Our Newsletter
          </h3>
          <p className="text-xs text-gray-300 font-proda leading-relaxed">
            Be first to know about rare vintage drops, exclusive promos, and weekly curations.
          </p>

          {/* Email Input & Subscribe Button */}
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center w-full">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-neutral-900 border placeholder-neutral-500 text-xs px-3 py-2.5 focus:outline-none focus:border-[#B2A376] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#B2A376] hover:bg-white text-black cursor-pointer font-semibold text-xs px-4 py-2.5 uppercase tracking-wider transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>

          {/* Social Icons Row */}
          <div className="flex items-center gap-3.5 pt-2">
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-neutral-400 hover:text-[#B2A376] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="text-neutral-400 hover:text-[#B2A376] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-neutral-400 hover:text-[#B2A376] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-neutral-400 hover:text-[#B2A376] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* TikTok */}
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="text-neutral-400 hover:text-[#B2A376] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525 2.165A.08.08 0 0 0 12.443 2.08h-2.736a.08.08 0 0 0-.08.081v13.566a3.176 3.176 0 1 1-3.176-3.176c.264 0 .524.032.775.097a.08.08 0 0 0 .098-.073l.006-2.82a.08.08 0 0 0-.063-.078 6.002 6.002 0 0 0-1.424-.17 6.007 6.007 0 1 0 6.007 6.007V8.585a9.07 9.07 0 0 0 5.485 1.802a.08.08 0 0 0 .08-.08V7.559a.08.08 0 0 0-.08-.08c-1.896 0-3.626-.677-4.996-1.808V2.165z" />
              </svg>
            </a>

            {/* Pinterest */}
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest" className="text-neutral-400 hover:text-[#B2A376] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.604 0 12.017 0z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a href="https://whatsapp.com" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-neutral-400 hover:text-[#B2A376] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Row */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-proda">
        <div>
          © 2026 Thriftable. All Rights Reserved.
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/shop" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/shop" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/shop" className="hover:text-white transition-colors">Cookie Settings</Link>
        </div>
      </div>
    </footer>
  );
}
