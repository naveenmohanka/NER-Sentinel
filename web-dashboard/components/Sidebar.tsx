"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Live Situation", icon: "public", href: "/live-situation" },
  { label: "Risk Assessment", icon: "monitoring", href: "/risk-assessment" },
  { label: "Report Hazard", icon: "report_problem", href: "#" },
  { label: "Response Coordination", icon: "groups", href: "#" },
  { label: "Alerts & Status", icon: "notifications_active", href: "#" },
  { label: "Settings", icon: "settings", href: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] min-w-[260px] bg-[#131b2e] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-[#263352] z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <span
            className="material-symbols-outlined text-white text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield
          </span>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              NER-Sentinel
            </h1>
            <p className="text-xs text-[#7c839b] font-medium tracking-wide">
              Emergency Response
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-2.5 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href !== "#" && pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#3d4b68] text-white shadow-sm"
                    : "text-[#8f9bb3] hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="px-3 pb-4 pt-3 border-t border-[#263352]/60 space-y-3">
        {/* Operational Desk Box */}
        <div className="bg-[#1c263e] rounded-lg p-3 border border-[#2d3a58]">
          <h6 className="text-[10px] font-bold text-[#7c839b] uppercase tracking-wider mb-2">
            Operational Desk
          </h6>
          <div className="space-y-1.5 font-mono text-[11px] text-[#b0bcd6]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#7c839b]">
                call
              </span>
              <span>1800 3456 145</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#7c839b]">
                mail
              </span>
              <span className="truncate">fmiscbihar@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Support & Logout */}
        <div className="space-y-0.5">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8f9bb3] hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-base">help</span>
            <span>Support</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8f9bb3] hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

