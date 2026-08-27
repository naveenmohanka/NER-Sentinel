"use client";

interface TopNavbarProps {
  title?: string;
}

export default function TopNavbar({ title = "Command Dashboard" }: TopNavbarProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-[#e2e8f0] shadow-xs flex justify-between items-center h-16 px-6 w-full z-20">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg md:text-xl font-bold text-[#1b1b1d] tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right Stats & Actions */}
      <div className="flex items-center gap-4 md:gap-5 text-sm">
        {/* Date & Time */}
        <span className="text-xs md:text-sm text-[#515f74] font-medium hidden sm:inline-block">
          24th Oct, 2023 | Tuesday | 10:44 AM
        </span>

        {/* System Status */}
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs md:text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span
            className="material-symbols-outlined text-[16px] text-emerald-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span>System Operational</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="text-[#515f74] hover:text-[#1b1b1d] hover:bg-gray-100 p-1.5 rounded-full transition-colors relative"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.png"
            alt="User Profile Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-300 shadow-xs"
          />
        </div>
      </div>
    </header>
  );
}

