"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PackageSearch, Tag, Sparkles } from "lucide-react";

const TABS = [
  { href: "/",             label: "Accueil",    Icon: LayoutDashboard },
  { href: "/inventory",   label: "Inventaire", Icon: PackageSearch   },
  { href: "/sales",       label: "Ventes",     Icon: Tag             },
  { href: "/ai-insights", label: "IA",         Icon: Sparkles        },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-foreground/8" : ""}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-semibold tracking-tight ${active ? "font-black" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
