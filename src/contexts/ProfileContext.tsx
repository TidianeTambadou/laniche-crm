"use client";

import React, { createContext, useContext, useState } from "react";

interface ProfileContextType {
  openProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType>({ openProfile: () => {} });

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ProfileContext.Provider value={{ openProfile: () => setIsOpen(true) }}>
      {children}
      {/* Lazy-load ProfilePanel to avoid it being in the initial bundle */}
      <ProfilePanelLazy isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ProfileContext.Provider>
  );
}

// Inline lazy panel to keep the context file self-contained
import dynamic from "next/dynamic";
const ProfilePanelLazy = dynamic(() => import("@/components/ProfilePanel"), { ssr: false });
