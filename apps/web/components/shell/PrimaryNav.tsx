"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/lab", label: "Lab" },
  { href: "/league", label: "League" },
  { href: "/room", label: "Room" },
] as const;

export function PrimaryNav() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="primary-nav">
      <Link href="/" className="primary-nav-brand" style={{ fontFamily: "var(--font-display)" }}>
        <span aria-hidden>🐯</span>
        <span>
          Razzle<span className="text-orange">.lol</span>
        </span>
      </Link>
      <nav className="primary-nav-links" aria-label="Main">
        {NAV.map(({ href, label }) => {
          const active = href === "/explore" ? pathname.startsWith("/explore") : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`primary-nav-link${active ? " active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
