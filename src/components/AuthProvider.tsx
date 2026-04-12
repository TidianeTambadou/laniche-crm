"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import dynamic from "next/dynamic";

const LoginAnimation = dynamic(() => import("./LoginAnimation"), { ssr: false });

const TICKER = ["INVENTAIRE", "VENTES PRIVÉES", "ANALYTICS", "RECOMMANDATIONS IA", "STOCK EN TEMPS RÉEL", "CRM BOUTIQUES"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy]         = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrorMsg("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name: shopName || "Nouvelle Boutique" } } });
        if (error) throw error;
        alert("Compte créé ! Vérifiez vos emails si la confirmation est activée.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue");
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-white/10">
            <Image src="/logo.jpg" alt="La Niche" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <Loader2 className="w-4 h-4 animate-spin text-white/30" />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full min-h-screen flex bg-[#0a0a0a]">

        {/* Left */}
        <div className="hidden lg:flex w-[54%] flex-col justify-between relative overflow-hidden p-12">
          <div className="absolute inset-0 opacity-20"><LoginAnimation /></div>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
          {/* Scan line */}
          <motion.div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            initial={{ top: "0%" }} animate={{ top: "100%" }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity, repeatDelay: 2 }} />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/15">
              <Image src="/logo.jpg" alt="La Niche" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-white text-lg">La Niche</span>
          </div>

          <motion.div className="relative z-10"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22,1,0.36,1] as [number,number,number,number] }}>
            <p className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase mb-6">CRM Boutiques Partenaires</p>
            <h1 className="text-5xl font-black text-white leading-[1.05] tracking-tight mb-5">
              Gérez votre boutique.<br />
              <span className="text-white/25">Intelligemment.</span>
            </h1>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Inventaire, ventes privées et analytics, dans un seul outil taillé pour les boutiques La Niche.
            </p>
          </motion.div>

          {/* Ticker */}
          <div className="relative z-10 overflow-hidden">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="text-[10px] font-bold tracking-[0.18em] text-white/15 uppercase flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-white/15" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 bg-white flex flex-col justify-center px-10 lg:px-16 rounded-l-3xl">
          <div className="max-w-sm w-full mx-auto">

            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-9 h-9 rounded-xl overflow-hidden">
                <Image src="/logo.jpg" alt="La Niche" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-foreground text-lg">La Niche</span>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-black text-foreground tracking-tight mb-1">
                {isLogin ? "Bon retour 👋" : "Créer votre espace"}
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                {isLogin ? "Connectez-vous à votre CRM La Niche." : "Rejoignez le réseau des boutiques La Niche."}
              </p>

              <form onSubmit={handleAuth} className="space-y-3">
                {!isLogin && (
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Boutique</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input required value={shopName} onChange={e => setShopName(e.target.value)} type="text" placeholder="Ma Boutique Paris"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="contact@boutique.com"
                      className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all" />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-500 text-sm font-medium border border-rose-100">{errorMsg}</div>
                )}

                <button disabled={busy} type="submit"
                  className="w-full mt-2 bg-foreground text-background font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-black/10">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isLogin ? "Se connecter" : "S'inscrire"} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-muted-foreground">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }} className="text-foreground font-bold hover:underline">
                  {isLogin ? "Demander un accès" : "Se connecter"}
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ProfileProvider>
        <div className="flex h-screen overflow-hidden bg-background w-full">
          <Sidebar />
          <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">{children}</main>
        </div>
      </ProfileProvider>
    </SidebarProvider>
  );
}
