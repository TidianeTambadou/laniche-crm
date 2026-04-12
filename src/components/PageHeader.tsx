"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

interface PageHeaderProps {
  title: string;
  left?: React.ReactNode;   // extra element left of title
  right?: React.ReactNode;  // action buttons
}

export default function PageHeader({ title, left, right }: PageHeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-border bg-white sticky top-0 z-10 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — visible on mobile only */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground shrink-0"
          aria-label="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {left}
        <h1 className="text-sm font-black text-foreground tracking-tight truncate">{title}</h1>
      </div>

      {right && (
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      )}
    </header>
  );
}
