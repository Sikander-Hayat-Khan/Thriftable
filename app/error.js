"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleGoBack = () => {
    if (typeof reset === "function") {
      reset();
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[90vh] sm:min-h-screen bg-[#FDFDFD] dark:bg-[#0c0c0c] text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden select-none">
      {/* Floating Cloud Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-100 sm:max-w-115 md:max-w-125 flex items-center justify-center p-8 sm:p-12 my-auto"
      >
        {/* Merged Cloud Silhouette with Soft Drop Shadow */}
        <div className="absolute inset-0 pointer-events-none filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          {/* Main Card Body */}
          <div className="absolute inset-4 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-100/80 dark:border-neutral-800/80" />

          {/* Cloud Bulges / Curves */}
          {/* Top Center Main Arch */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-28 bg-white dark:bg-neutral-900 rounded-full" />
          {/* Top Left Arch */}
          <div className="absolute -top-3 left-6 sm:left-10 w-32 sm:w-36 h-24 bg-white dark:bg-neutral-900 rounded-full" />
          {/* Top Right Arch */}
          <div className="absolute -top-3 right-6 sm:right-10 w-32 sm:w-36 h-24 bg-white dark:bg-neutral-900 rounded-full" />

          {/* Side Left Bulge */}
          <div className="absolute top-1/2 -left-5 sm:-left-6 -translate-y-1/2 w-24 sm:w-28 h-32 sm:h-36 bg-white dark:bg-neutral-900 rounded-full" />
          {/* Side Right Bulge */}
          <div className="absolute top-1/2 -right-5 sm:-right-6 -translate-y-1/2 w-24 sm:w-28 h-32 sm:h-36 bg-white dark:bg-neutral-900 rounded-full" />

          {/* Bottom Left Curve */}
          <div className="absolute -bottom-3 left-10 sm:left-14 w-28 sm:w-32 h-20 bg-white dark:bg-neutral-900 rounded-full" />
          {/* Bottom Right Curve */}
          <div className="absolute -bottom-3 right-10 sm:right-14 w-28 sm:w-32 h-20 bg-white dark:bg-neutral-900 rounded-full" />
        </div>

        {/* Cloud Content */}
        <div className="relative z-10 flex flex-col items-center text-center w-full pt-4 pb-2">
          {/* OOPS! Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight text-black dark:text-white leading-none">
            OOPS!
          </h1>

          {/* Error Subtitle */}
          <p className="text-xs sm:text-sm md:text-base font-sans font-medium text-neutral-800 dark:text-neutral-200 mt-3 sm:mt-4 tracking-normal">
            Something went wrong
          </p>

          {/* Go Back Green Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleGoBack}
            className="mt-5 sm:mt-6 px-6 sm:px-7 py-2 sm:py-2.5 bg-[#52D677] hover:bg-[#46c669] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-md shadow-[0_2px_8px_rgba(82,214,119,0.3)] transition-colors cursor-pointer"
          >
            TRY AGAIN
          </motion.button>

          {/* Social Media / Action Buttons */}
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-7">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#E2E2E2] hover:bg-[#D5D5D5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white dark:text-neutral-300 flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.7 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#E2E2E2] hover:bg-[#D5D5D5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white dark:text-neutral-300 flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>

            {/* Pinterest */}
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#E2E2E2] hover:bg-[#D5D5D5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white dark:text-neutral-300 flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.056.208-.18.252-.415.152-1.554-.723-2.525-2.994-2.525-4.82 0-3.927 2.853-7.534 8.229-7.534 4.319 0 7.677 3.077 7.677 7.192 0 4.29-2.705 7.744-6.46 7.744-1.262 0-2.448-.656-2.854-1.43l-.777 2.964c-.281 1.077-1.042 2.427-1.552 3.254C9.539 23.824 10.749 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </a>

            {/* Google+ */}
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#E2E2E2] hover:bg-[#D5D5D5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white dark:text-neutral-300 flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M7 11v2.4h3.97c-.16 1.03-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42s1.95-4.42 4.34-4.42c1.36 0 2.27.58 2.79 1.08l1.9-1.83C10.42 5.69 8.87 5 7 5 3.13 5 0 8.13 0 12s3.13 7 7 7c4.04 0 6.72-2.84 6.72-6.84 0-.46-.05-.81-.11-1.16H7zm14 0h-2V9h-2v2h-2v2h2v2h2v-2h2v-2z" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
