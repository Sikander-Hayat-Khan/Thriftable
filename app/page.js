"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer";
import FluidBackgroundFill from "@/components/fluid-background-fill";
import { useTheme } from "@/components/theme-provider";

const categories = [
  {
    num: "01",
    id: "streetwear",
    name: "Streetwear",
    eyebrow: "For the everyday uniform",
    headline: "Worn in. Never worn out.",
    body: "Oversized fits, bold graphics, the kind of pieces that already have a story before they meet yours. Streetwear that looks lived-in because it actually was.",
    cta: "Shop Streetwear →",
    href: "/shop?category=streetwear",
    image: "/hero_section/sections/streetwear.jpg",
    imageAspect: "aspect-[4/5]",
    objectPosition: "object-center",
  },
  {
    num: "02",
    id: "footwear",
    name: "Footwear",
    eyebrow: "Step into something with history",
    headline: "Broken in beats brand new.",
    body: "From scuffed classics to barely-touched finds, every pair has already done the hard work of getting comfortable. Now they're ready for your miles.",
    cta: "Shop Footwear →",
    href: "/shop?category=footwear",
    image: "/hero_section/sections/footwear.jpg",
    imageAspect: "aspect-[4/3]",
    objectPosition: "object-bottom",
  },
  {
    num: "03",
    id: "eyewear",
    name: "Eyewear",
    eyebrow: "See it your way",
    headline: "Frames with a point of view.",
    body: "Vintage shapes and forgotten designer finds you won't see on every third face on the street. One-of-one, literally.",
    cta: "Shop Eyewear →",
    href: "/shop?category=eyewear",
    image: "/hero_section/sections/eyewear.jpg",
    imageAspect: "aspect-[3/4]",
    objectPosition: "object-top",
  },
  {
    num: "04",
    id: "vintage",
    name: "Vintage",
    eyebrow: "The good stuff, dug up",
    headline: "Old is the new original.",
    body: "Pieces that predate fast fashion – real fabric, real cuts, real character. Every rack is a different decade.",
    cta: "Shop Vintage →",
    href: "/shop?category=vintage",
    image: "/hero_section/sections/vintage.jpg",
    imageAspect: "aspect-[16/10]",
    objectPosition: "object-top",
  },
  {
    num: "05",
    id: "kids",
    name: "Kids",
    eyebrow: "Little sizes, zero compromise",
    headline: "They'll outgrow it. Not outwear it.",
    body: "Gently loved clothing built to survive a kid's day, at prices that make sense for how fast they grow.",
    cta: "Shop Kids →",
    href: "/shop?category=kids",
    image: "/hero_section/sections/kids.jpg",
    imageAspect: "aspect-[4/3]",
    objectPosition: "object-center",
  },
  {
    num: "06",
    id: "accessories",
    name: "Accessories",
    eyebrow: "The details that finish a look",
    headline: "Small pieces, big personality.",
    body: "Bags, belts, hats, and jewelry that turn an outfit into a whole mood. Easy to thrift, hard to put down.",
    cta: "Shop Accessories →",
    href: "/shop?category=accessories",
    image: "/hero_section/sections/accessories.jpg",
    imageAspect: "aspect-[1/1]",
    objectPosition: "object-center",
  },
  {
    num: "07",
    id: "athletic",
    name: "Athletic Wear",
    eyebrow: "Built to move, made to last",
    headline: "Already warmed up for you.",
    body: "Durable activewear that's been tested – literally – so you know it holds up. Sweat proof style at a fraction of retail.",
    cta: "Shop Athletic Wear →",
    href: "/shop?category=athletic_wear",
    image: "/hero_section/sections/athletic.jpg",
    imageAspect: "aspect-[4/5]",
    objectPosition: "object-center",
  },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const mainRef = useRef(null);
  const { theme, mounted } = useTheme();

  const isDark = mounted ? theme === "dark" : true;

  // Track active section on scroll
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const sectionHeight = container.clientHeight;
      if (sectionHeight > 0) {
        const index = Math.round(scrollPosition / sectionHeight);
        setActiveSection(Math.min(8, Math.max(0, index)));
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index) => {
    const container = mainRef.current;
    if (!container) return;
    container.scrollTo({
      top: index * container.clientHeight,
      behavior: "smooth",
    });
  };

  return (
    <main
      ref={mainRef}
      className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-neutral-50 text-neutral-900 transition-colors duration-1000"
    >
      {/* Nine Vertical Section Dots Navigation (Fixed Center Right) */}
      <nav
        aria-label="Section dots navigation"
        className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 items-center pointer-events-auto"
      >
        {Array.from({ length: 9 }).map((_, idx) => {
          const isActive = activeSection === idx;
          const isDarkBg =
            isDark ||
            activeSection === 0 ||
            activeSection === 8 ||
            (activeSection > 0 && activeSection < 8 && (activeSection - 1) % 2 === 1);
          const colorClass = isDarkBg ? "bg-white" : "bg-black";

          return (
            <button
              key={idx}
              onClick={() => scrollToSection(idx)}
              aria-label={`Go to section ${idx + 1}`}
              className={`rounded-full transition-all duration-300 focus:outline-none ${colorClass} ${
                isActive
                  ? "w-2.5 h-2.5 opacity-100 scale-110"
                  : "w-1.5 h-1.5 opacity-40 hover:opacity-80 hover:scale-110"
              }`}
            />
          );
        })}
      </nav>

      {/* 00: Hero Section */}
      <section
        id="hero"
        className="relative h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center overflow-hidden"
      >
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_section/hero_image_3.png"
            alt="Thriftable Hero"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark Overlay for High Legibility */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] pointer-events-none" />
        </div>

        {/* Centered Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center gap-5 sm:gap-7 pt-16">
          <p className="text-xs sm:text-base md:text-lg font-proda font-light tracking-[0.3em] uppercase text-[#B2A376]">
            Find it. Thrift it. Love it.
          </p>

          <h1 className="font-logo text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white font-extrabold tracking-widest drop-shadow-2xl select-none">
            THRIFTABLE
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-md sm:max-w-xl mx-auto font-proda tracking-widest font-normal leading-relaxed">
            Thriftable is where secondhand feels like the best decision you made all week.
          </p>

          <div className="pt-3">
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs sm:text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
              <span className="relative z-10">Shop Now</span>
              <svg
                className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-70 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest text-[#B2A376]">Scroll</span>
          <svg className="w-4 h-4 text-[#B2A376]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 01-07: Category Sections (50/50 Split Flush Edge Layout) */}
      {categories.map((cat, idx) => {
        const isImageLeft = idx % 2 === 0;

        return (
          <section
            key={cat.id}
            id={cat.id}
            className="relative h-screen w-full snap-start snap-always shrink-0 flex flex-col lg:flex-row items-stretch overflow-hidden border-b border-black/10 dark:border-white/10 transition-colors duration-700"
          >
            {/* Ambient subtle background glow */}
            <div className="absolute inset-0 bg-radial from-[#B2A376]/5 via-transparent to-transparent pointer-events-none z-0" />

            {/* Image Panel — Stuck Flush to Left or Right Edge */}
            <div
              className={`w-full lg:w-1/2 h-[45vh] lg:h-full relative overflow-hidden group shrink-0 z-10 ${
                isImageLeft ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={idx < 2}
                className={`object-cover ${cat.objectPosition} group-hover:scale-105 transition-transform duration-700 ease-out`}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            </div>

            {/* Copy Block Panel — Opposite Side with Fluid Animated Background */}
            <div
              className={`w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-10 lg:py-0 z-10 relative overflow-hidden ${
                isImageLeft ? "lg:order-2" : "lg:order-1"
              }`}
            >
              {/* Fluid Liquid Wave Background Fill */}
              <FluidBackgroundFill />

              <div className="max-w-xl mx-auto lg:mx-0 flex flex-col justify-center gap-5 sm:gap-6 relative z-10">
                {/* Number & Eyebrow Row */}
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-proda font-extrabold text-[#B2A376]">
                    {cat.num}
                  </span>
                  <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#B2A376] font-proda font-medium">
                    {cat.eyebrow}
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-macsans font-bold tracking-wider text-neutral-900 dark:text-white leading-tight transition-colors duration-1000">
                  {cat.headline}
                </h2>

                {/* Body */}
                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-proda font-light leading-relaxed transition-colors duration-1000">
                  {cat.body}
                </p>

                {/* CTA Button with Bottom-to-Top Fill Hover Animation */}
                <div className="pt-2">
                  <Link
                    href={cat.href}
                    className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs sm:text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                    <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                      {cat.cta}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* 08: Footer Section */}
      <section id="footer" className="relative w-full snap-start snap-always shrink-0 min-h-[30vh]">
        <Footer />
      </section>
    </main>
  );
}

