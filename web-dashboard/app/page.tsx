"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Authenticating...");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    // Demo credentials check
    if (email === "official@nersentinel.demo" && password === "admin123") {
      setIsLoading(true);
      setLoadingText("Authenticating...");

      setTimeout(() => {
        setLoadingText("Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }, 600);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3f5] text-[#1b1b1d] flex flex-col justify-center items-center px-4 sm:px-6 py-8 antialiased">
      <div className="w-full max-w-[430px]">
        <div
          className="w-full bg-white rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-200"
          style={{ border: "1px solid rgba(226, 232, 240, 0.85)" }}
        >
          {/* Brand Crest & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#131b2e] flex items-center justify-center shadow-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1b1b1d] mt-4">
              NER-Sentinel
            </h1>
            <p className="text-xs font-medium text-[#515f74] tracking-wide mt-1">
              Emergency Response &amp; Disaster Intelligence
            </p>
          </div>

          {/* Welcome Note */}
          <div className="mt-8 mb-6 text-left">
            <h2 className="text-xl font-bold tracking-tight text-[#1b1b1d]">
              Welcome Back
            </h2>
            <p className="text-sm font-normal text-[#515f74] mt-1">
              Sign in to access the NER-Sentinel Command Dashboard.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200/80 rounded-lg text-xs font-medium text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[16px] shrink-0">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#45464d] mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#76777d]">
                  <span className="material-symbols-outlined text-[18px]">
                    mail
                  </span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  className="w-full pl-10 pr-3.5 py-3 bg-[#f6f3f5] text-[#1b1b1d] text-sm rounded-lg transition-all placeholder:text-[#76777d]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  style={{ border: "1px solid rgba(203, 213, 225, 0.8)" }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#45464d] mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#76777d]">
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-3 bg-[#f6f3f5] text-[#1b1b1d] text-sm rounded-lg transition-all placeholder:text-[#76777d]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  style={{ border: "1px solid rgba(203, 213, 225, 0.8)" }}
                />
                <button
                  id="togglePassword"
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#76777d] hover:text-[#1b1b1d] cursor-pointer transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="submitBtn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] active:bg-[#1e3a8a] text-white font-medium text-sm py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span>{loadingText}</span>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <p className="text-xs text-[#76777d] font-normal text-center mt-5">
            Authorized dashboard access
          </p>
        </div>
      </div>
    </main>
  );
}
