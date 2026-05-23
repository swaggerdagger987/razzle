"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/explore", label: "Explore", icon: "🔍" },
  { href: "/lab", label: "Lab", icon: "🧪" },
  { href: "/league", label: "League", icon: "🏈" },
  { href: "/room", label: "Room", icon: "🐯" },
] as const;

export function MobileNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="mobile-nav" aria-label="Mobile">
      {NAV.map(({ href, label, icon }) => {
        const active =
          href === "/explore" ? pathname.startsWith("/explore") : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`mobile-nav-item${active ? " active" : ""}`}>
            <span className="mobile-nav-icon" aria-hidden>
              {icon}
            </span>
            <span className="mobile-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
