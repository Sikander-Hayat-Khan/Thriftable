"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-provider";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
  } = useAuth();

  const [tab, setTab] = useState("signin"); // "signin" | "signup" | "forgot"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Sync tab state when modal is opened from external trigger
  useEffect(() => {
    if (authModalTab) {
      setTab(authModalTab);
    }
    setErrorMsg("");
    setSuccessMsg("");
  }, [authModalTab, isAuthModalOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (tab === "forgot") {
      setIsSubmitting(true);
      try {
        await resetPassword(email);
        setSuccessMsg("Password reset link sent to your email!");
      } catch (err) {
        setErrorMsg(err.message || "Could not send reset email.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    if (tab === "signup") {
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
        const res = await signUpWithEmail(email, password, fullName);
        if (res?.user && !res?.session) {
          setSuccessMsg(
            "Account created! Please check your email to confirm your account."
          );
        } else {
          setSuccessMsg("Account created successfully!");
          setTimeout(() => {
            closeAuthModal();
          }, 1200);
        }
      } catch (err) {
        setErrorMsg(err.message || "Could not create account.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Sign In
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
      // closeAuthModal is handled inside signInWithEmail
    } catch (err) {
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8 overflow-y-auto no-scrollbar">
      {/* Dimmed Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md max-h-[86vh] overflow-y-auto no-scrollbar bg-neutral-900/95 dark:bg-neutral-950/95 border border-white/10 text-white rounded-3xl shadow-2xl backdrop-blur-xl z-10 p-6 sm:p-8 animate-scaleIn my-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close dialog"
          className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="text-xl sm:text-2xl font-extrabold tracking-widest text-[#B2A376] font-logo uppercase">
            THRIFTABLE
          </span>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1">
            {tab === "signin"
              ? "Welcome back to conscious fashion"
              : tab === "signup"
              ? "Join the sustainable movement"
              : "Recover your account"}
          </p>
        </div>

        {/* Tab Switcher (SignIn / SignUp) */}
        {tab !== "forgot" && (
          <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                tab === "signin"
                  ? "bg-[#B2A376] text-black shadow-md scale-[1.02]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                tab === "signup"
                  ? "bg-[#B2A376] text-black shadow-md scale-[1.02]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 animate-fadeIn">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2 animate-fadeIn">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        {tab !== "forgot" && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white text-neutral-900 hover:bg-neutral-100 font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
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
              <span>Continue with Google</span>
            </button>

            {/* Aesthetic Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-neutral-900 dark:bg-neutral-950 px-3 text-[10px] uppercase font-bold tracking-widest text-neutral-500 shrink-0">
                Or with email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter Your Name"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#B2A376] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#B2A376] transition-colors"
            />
          </div>

          {tab !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300">
                  Password
                </label>
                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab("forgot");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-[11px] text-[#B2A376] hover:underline cursor-pointer tracking-wider font-medium"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#B2A376] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === "signup" && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#B2A376] transition-colors"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#B2A376] text-black font-extrabold text-xs uppercase tracking-widest hover:bg-[#c4b689] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : tab === "signin" ? (
              "Sign In"
            ) : tab === "signup" ? (
              "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="mt-6 text-center text-xs text-neutral-400">
          {tab === "forgot" ? (
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-[#B2A376] hover:underline font-semibold tracking-wider cursor-pointer"
            >
              Back to Sign In
            </button>
          ) : tab === "signin" ? (
            <span>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-[#B2A376] hover:underline font-semibold tracking-wider cursor-pointer"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-[#B2A376] hover:underline font-semibold tracking-wider cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
