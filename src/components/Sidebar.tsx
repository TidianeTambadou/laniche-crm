"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PackageSearch, Tag, Settings, Sparkles, Moon, Sun, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useProfile } from "@/contexts/ProfileContext";

const NAV = [
  { href: "/",             label: "Tableau de Bord", Icon: LayoutDashboard },
  { href: "/inventory",   label: "Inventaire",        Icon: PackageSearch   },
  { href: "/sales",       label: "Ventes Privées",    Icon: Tag             },
  { href: "/ai-insights", label: "Intelligence IA",   Icon: Sparkles, badge: "Soon" },
];

function SidebarContent() {
  const pathname            = usePathname();
  const { theme, setTheme } = useTheme();
  const { openProfile }     = useProfile();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-white/6">
        <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10">
            <Image src="/logo.jpg" alt="La Niche" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 leading-none">
            <span className="text-sm font-black text-white block">La Niche</span>
            <span className="text-[10px] text-white/30 font-medium">CRM</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5">
        <p className="px-3 text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] mb-3">Menu</p>
        {NAV.map(({ href, label, Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active ? "bg-white text-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
              }`}>
              <Icon style={{ width: 16, height: 16 }}
                className={`shrink-0 ${active ? "text-black" : "text-white/30 group-hover:text-white/60"}`} />
              <span className="flex-1">{label}</span>
              {badge && !active && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/8 text-white/30 tracking-wider uppercase">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 pb-4 space-y-0.5 border-t border-white/5 pt-3">
        {[
          { label: "Mon Profil",  Icon: UserCircle, action: openProfile },
          { label: "Paramètres", Icon: Settings,   action: openProfile },
        ].map(({ label, Icon, action }) => (
          <button key={label} onClick={action}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-all">
            <Icon style={{ width: 16, height: 16 }} className="shrink-0 text-white/30" />
            {label}
          </button>
        ))}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-all">
          {theme === "dark"
            ? <Sun  style={{ width: 16, height: 16 }} className="shrink-0 text-white/30" />
            : <Moon style={{ width: 16, height: 16 }} className="shrink-0 text-white/30" />}
          {theme === "dark" ? "Thème Clair" : "Mode Sombre"}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col h-full shrink-0 border-r border-white/5">
      <SidebarContent />
    </aside>
  );
}
