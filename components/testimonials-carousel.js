"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useReviews } from "./reviews-provider";

export default function TestimonialsCarousel() {
  const { getFeaturedTestimonials } = useReviews();
  const testimonials = getFeaturedTestimonials();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const total = testimonials.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay with pause on hover
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (!testimonials || testimonials.length === 0) return null;

  const current = testimonials[currentIndex] || testimonials[0];

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        filter: { duration: 0.3 },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
      filter: "blur(4px)",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  return (
    <section
      id="testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-10 w-full py-24 sm:py-32 px-6 sm:px-12 lg:px-16 bg-neutral-50 dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 border-b border-black/10 dark:border-white/10 transition-colors duration-700 overflow-hidden"
    >
      {/* Ambient background subtle lighting */}
      <div className="absolute inset-0 bg-radial from-[#B2A376]/8 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-[#B2A376]/30 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Eyebrow */}
        <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#B2A376] font-proda font-semibold mb-3">
          Testimonials
        </span>

        {/* Section Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-calluna tracking-tight text-neutral-900 dark:text-white font-normal mb-12 sm:mb-16">
          What our community says
        </h2>

        {/* Main Testimonial Card with Navigation Arrows */}
        <div className="w-full relative flex items-center justify-between min-h-80 sm:min-h-70">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="group p-3 sm:p-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all transform hover:-translate-x-1 cursor-pointer shrink-0 z-20"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Testimonial Content Wrapper */}
          <div className="flex-1 max-w-2xl px-4 sm:px-8 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id || currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                {/* Avatar Portrait */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border-2 border-white dark:border-neutral-800 mb-6 shrink-0 bg-neutral-200 dark:bg-neutral-800">
                  <Image
                    src={current.userAvatar}
                    alt={current.userName}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>

                {/* Testimonial Quote */}
                <p className="text-base sm:text-lg lg:text-xl font-calluna italic text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-xl mx-auto mb-6">
                  &ldquo;{current.reviewText}&rdquo;
                </p>

                {/* Customer Handwritten Signature */}
                <div className="font-signature text-3xl sm:text-4xl text-neutral-900 dark:text-white tracking-wide mb-2 select-none">
                  {current.signature || current.userName}
                </div>

                {/* Verified Purchase & Item Subtitle */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {current.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[#B2A376] font-medium">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified Buyer
                    </span>
                  )}
                  {current.purchaseTag && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span>{current.purchaseTag}</span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="group p-3 sm:p-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all transform hover:translate-x-1 cursor-pointer shrink-0 z-20"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Minimalist Pagination Dots */}
        <div className="flex items-center gap-2 pt-8 sm:pt-10">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-[#B2A376]"
                  : "w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
