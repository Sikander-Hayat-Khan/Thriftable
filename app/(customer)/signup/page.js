"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  const {
    user,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(urlError || "");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already logged in
  if (user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="p-8 sm:p-12 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/90 backdrop-blur-md shadow-2xl max-w-lg w-full flex flex-col items-center gap-5"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
            ✓
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#B2A376] font-semibold">
            Session Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Already Signed In
          </h2>
          <p className="text-xs font-proda text-neutral-600 dark:text-neutral-300">
            You are signed in as <span className="font-mono text-neutral-900 dark:text-white font-semibold">{user.email}</span>
          </p>
          <Link
            href={next}
            className="group relative w-full py-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer block mt-2"
          >
            <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
            <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
              Continue to Destination →
            </span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle(
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
          : undefined
      );
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign up with Google.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please provide your full legal name.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUpWithEmail(email, password, fullName.trim());
      if (res?.user && !res?.session) {
        setSuccessMsg(
          "Account created! Please check your email inbox to confirm your registration."
        );
      } else {
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push(next);
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || "Could not complete account creation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Breadcrumb & Status Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#B2A376] font-semibold">Sign Up</span>
        </div>
      </div>

      {/* Main Split Layout: Left Image (50%) | Right Sign Up Form (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        {/* Left Column: High Quality Image (50%) */}
        <div className="w-full relative flex">
          <div className="relative w-full h-95 sm:h-120 lg:h-auto min-h-130 overflow-hidden border border-black/15 dark:border-white/15 bg-neutral-900 shadow-xl group">
            <Image
              src="/authentication/auth.jpg"
              alt="Thriftable Archival Collection"
              fill
              priority
              quality={95}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            {/* Dark Vignette Overlay for Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/10" />
          </div>
        </div>

        {/* Right Column: Sign Up Form (50%) */}
        <div className="w-full flex flex-col justify-center">
          <div className="p-6 sm:p-10 dark:border-white/15 bg-white dark:bg-neutral-900/90  flex flex-col gap-5">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Join The Archive
              </h1>
              <p className="text-xs font-proda text-neutral-600 dark:text-neutral-300 mt-1">
                Enter your email address and a secure password on the sign-up page.
              </p>
            </div>

            {/* Google Fast Onboarding */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="group relative w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-mono text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign Up with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-black/10 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-neutral-900 px-4 text-[10px] uppercase font-mono tracking-widest text-neutral-500 shrink-0">
                Or Register with Credentials
              </span>
              <div className="border-t border-black/10 dark:border-white/10 w-full" />
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-4 rounded-none bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono flex items-start gap-2.5">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="p-4 rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-start gap-2.5">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-400 font-semibold">
                  Full Name <span className="text-[#B2A376]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Name"
                  className="w-full px-4 py-3 rounded-none bg-neutral-50 dark:bg-neutral-950 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#B2A376] transition-colors font-mono"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-400 font-semibold">
                  Email Address <span className="text-[#B2A376]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-none bg-neutral-50 dark:bg-neutral-950 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#B2A376] transition-colors font-mono"
                />
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-400 font-semibold">
                    Password <span className="text-[#B2A376]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6+ chars"
                      className="w-full px-4 py-3 rounded-none bg-neutral-50 dark:bg-neutral-950 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#B2A376] transition-colors font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-400 font-semibold">
                    Confirm Password <span className="text-[#B2A376]">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 rounded-none bg-neutral-50 dark:bg-neutral-950 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#B2A376] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="flex gap-1 items-center">
                <input type="checkbox" className="cursor-pointer" />
                <p className="text-[11px] font-proda text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
                  By registering, you accept Thriftable&apos;s Archival Terms and Privacy Policy.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer block border border-[#B2A376] mt-2 disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black group-hover:border-white dark:group-hover:border-black border-t-transparent rounded-full animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <span>Create Account →</span>
                  )}
                </span>
              </button>
            </form>

            {/* Bottom Switcher */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 text-center text-xs font-mono">
              <span className="text-neutral-500">Already a member? </span>
              <Link
                href={`/login${next !== "/dashboard" && next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="text-[black] dark:text-white font-bold uppercase tracking-wider hover:underline underline-offset-4"
              >
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 text-center">
          <div className="w-8 h-8 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Loading Archive Registration...
          </p>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
