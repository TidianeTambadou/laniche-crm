"use client";

import React from "react";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

interface PageHeaderProps {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export default function PageHeader({ title, left, right }: PageHeaderProps) {
  const { openProfile } = useProfile();

  return (
    <header
      className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-border bg-white sticky top-0 z-10 gap-3"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo — mobile only */}
        <div className="lg:hidden w-7 h-7 rounded-lg overflow-hidden shrink-0">
          <Image src="/logo.jpg" alt="La Niche" width={28} height={28} className="w-full h-full object-cover" />
        </div>

        {left}
        <h1 className="text-sm font-black text-foreground tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {right}
        {/* Profile — mobile only */}
        <button
          onClick={openProfile}
          className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground"
          aria-label="Mon profil"
        >
          <UserCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
