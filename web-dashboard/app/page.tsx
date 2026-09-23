"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("official@nersentinel.demo");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Signing in...");
  const [error, setError] = useState("");
  const [liveIstTime, setLiveIstTime] = useState("");

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveIstTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const executeLogin = (userEmail: string, userPass: string) => {
    setError("");

    if (!userEmail || !userPass) {
      setError("Please fill in both Email Address and Password.");
      return;
    }

    const validEmails = [
      "official@nersentinel.demo",
      "gis.analyst@nersentinel.demo",
      "tactical.mesh@nersentinel.demo",
      "admin@nersentinel.gov.in",
    ];

    if (validEmails.includes(userEmail.trim().toLowerCase()) && userPass === "admin123") {
      setIsLoading(true);
      setLoadingText("Authenticating Command Access...");

      setTimeout(() => {
        setLoadingText("Synchronizing Sentinel-1A Satellite Feed...");
        setTimeout(() => {
          setLoadingText("Redirecting to Command Dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 450);
        }, 500);
      }, 550);
    } else {
      setError("Invalid credentials. Please use demo credentials: official@nersentinel.demo / admin123");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleQuickDemo = () => {
    setEmail("official@nersentinel.demo");
    setPassword("admin123");
    executeLogin("official@nersentinel.demo", "admin123");
  };

  return (
    <main
      className="min-h-screen w-full relative flex flex-col justify-between bg-cover bg-center bg-no-repeat font-sans selection:bg-orange-500/40 selection:text-white"
      style={{
        backgroundImage: "url('/disaster-bg.jpg')",
      }}
    >
      {/* Dark Cinematic Vignette & Atmospheric Overlay for maximum text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/75 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 z-0 pointer-events-none" />

      {/* Top Header / Branding Bar */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/90 border border-orange-400/40 shadow-lg flex items-center justify-center backdrop-blur-md">
            <span
              className="material-symbols-outlined text-white text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>NER-Sentinel</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-400/30">
                DISASTER COMMAND
              </span>
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              National Emergency Response &amp; Satellite GIS Portal
            </p>
          </div>
        </div>

        {/* Live Operational Clock & Status */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-200">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold">GRID ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-bold">
            <span className="material-symbols-outlined text-[15px] text-orange-400">schedule</span>
            <span>{liveIstTime || "12:00:00 IST"}</span>
          </div>
        </div>
      </header>

      {/* Main Split Screen Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Welcome Back & Disaster Mission Description */}
        <div className="lg:col-span-6 space-y-6 text-white text-left">
          <div className="space-y-1">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.05]">
              Welcome
              <br />
              <span className="text-orange-400 drop-shadow-[0_4px_24px_rgba(249,115,22,0.4)]">
                Back
              </span>
            </h2>
          </div>

          <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed max-w-xl font-normal drop-shadow">
            NER-Sentinel provides real-time disaster surveillance, Copernicus Sentinel-1A SAR ground deformation tracking, and AI-powered Dijkstra safe corridor routing across the North-East Himalayan belt.
          </p>

          {/* Social / Operational Nodes & Emergency Hotlines */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-4 text-white/80">
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors cursor-pointer" title="National Disaster Management Authority">
                <span className="material-symbols-outlined text-lg">public</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors cursor-pointer" title="Copernicus Satellite InSAR">
                <span className="material-symbols-outlined text-lg">satellite_alt</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors cursor-pointer" title="Emergency Field Mesh">
                <span className="material-symbols-outlined text-lg">cell_tower</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors cursor-pointer" title="Emergency Helpdesk">
                <span className="material-symbols-outlined text-lg">call</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/15 text-xs font-mono text-slate-300">
              <span className="text-orange-400 font-bold">24/7 Helpline:</span>
              <span className="text-white font-bold">NDMA 1078</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">NER Desk: 1800 3456 145</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign in Form (matching the reference image layout) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-[460px] bg-black/45 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] p-7 sm:p-9 text-white">
            <div className="mb-6">
              <h3 className="text-3xl font-extrabold tracking-tight text-white">
                Sign in
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Access the official disaster command and response dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-950/80 border border-red-500/80 rounded-lg text-xs font-medium text-red-200">
                <span className="material-symbols-outlined text-base text-red-400 shrink-0">
                  error
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email Address Input */}
              <div>
                <label
                  className="block text-xs font-semibold text-slate-200 mb-1.5"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="official@nersentinel.demo"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-[#e8ecf2] text-slate-900 placeholder:text-slate-500 rounded-md text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 shadow-inner transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  className="block text-xs font-semibold text-slate-200 mb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    className="w-full px-4 pr-11 py-3 bg-[#e8ecf2] text-slate-900 placeholder:text-slate-500 rounded-md text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 shadow-inner transition-all"
                  />
                  <button
                    id="togglePassword"
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-900 cursor-pointer transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Quick Fill */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-400 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                  />
                  <span className="font-medium">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={isLoading}
                  className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Demo Autofill
                </button>
              </div>

              {/* Sign in now Button (Matching orange CTA in reference image) */}
              <div className="pt-2">
                <button
                  id="submitBtn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#f25c05] hover:bg-[#e05300] active:bg-[#c94900] text-white font-bold text-sm py-3.5 rounded-md shadow-lg shadow-orange-950/50 hover:shadow-orange-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
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
                      <span>{loadingText}</span>
                    </div>
                  ) : (
                    <span>Sign in now</span>
                  )}
                </button>
              </div>

              {/* Lost your password link */}
              <div className="text-center pt-1">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Emergency password reset: Contact DDMA Gangtok Operations Desk at 1800 3456 145 or use demo login: official@nersentinel.demo / admin123");
                  }}
                  className="text-xs text-slate-300 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Lost your password?
                </a>
              </div>

              {/* 1-Click Fast Evaluator Access Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-md bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="text-emerald-400 font-bold">⚡</span>
                  <span>Instant Evaluator Demo Access &rarr;</span>
                </button>
              </div>

              {/* Terms of Service & Privacy Policy Disclaimer */}
              <div className="pt-3 border-t border-white/15 text-center text-[11px] text-slate-300/80 leading-relaxed">
                By clicking on &quot;Sign in now&quot; you agree to
                <br />
                <span className="text-white hover:underline cursor-pointer">Terms of Service</span>
                {" | "}
                <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Regulatory Footer Bar */}
      <footer className="relative z-10 w-full px-6 py-3 bg-black/60 backdrop-blur-md border-t border-white/10 text-center text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="material-symbols-outlined text-sm text-emerald-400">verified_user</span>
          <span>National Disaster Management Authority (NDMA) &amp; North Eastern Council</span>
        </div>
        <div className="mx-auto sm:mx-0 text-slate-400 font-mono text-[10px]">
          NER-SENTINEL SECURE GATEWAY v2.4-PROD
        </div>
      </footer>
    </main>
  );
}
