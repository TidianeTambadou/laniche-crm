"use client";

import React, { useEffect, useState } from "react";
import { X, Save, LogOut, User, Mail, Lock, Store, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [initials, setInitials] = useState("??");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    loadProfile();
  }, [isOpen]);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setEmail(session.user.email ?? "");

    const { data: shop } = await supabase
      .from("shops")
      .select("id, name, created_at")
      .eq("id", session.user.id)
      .maybeSingle();

    if (shop) {
      setShopName(shop.name);
      setInitials(shop.name.substring(0, 2).toUpperCase());
      const date = new Date(shop.created_at);
      setCreatedAt(date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non connecté");

      // Update shop name
      const { error: shopError } = await supabase
        .from("shops")
        .update({ name: shopName })
        .eq("id", session.user.id);
      if (shopError) throw shopError;

      // Update email if changed
      if (email !== session.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
      }

      // Update password if filled
      if (newPassword) {
        if (newPassword !== confirmPassword) throw new Error("Les mots de passe ne correspondent pas");
        if (newPassword.length < 6) throw new Error("Mot de passe trop court (6 caractères min.)");
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) throw pwError;
        setNewPassword("");
        setConfirmPassword("");
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la sauvegarde");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-primary px-6 pt-8 pb-10">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-accent/20" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-end gap-4 mt-2">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center font-bold text-xl text-amber-950 shadow-lg border-2 border-white/20">
              {initials}
            </div>
            <div>
              <p className="text-primary-foreground/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Votre profil</p>
              <h2 className="text-white text-xl font-bold truncate max-w-[220px]">{shopName || "Ma Boutique"}</h2>
              {createdAt && (
                <p className="text-primary-foreground/50 text-xs mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Membre depuis {createdAt}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Shop info */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Informations boutique</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <Store className="w-4 h-4 text-accent" /> Nom de la boutique
              </label>
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                placeholder="Ma Boutique"
              />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Account info */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Compte</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" /> Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                placeholder="email@boutique.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" /> Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>

            {newPassword && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" /> Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-secondary/40 border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all ${
                    confirmPassword && confirmPassword !== newPassword ? "border-rose-400" : "border-border"
                  }`}
                  placeholder="••••••••"
                />
              </div>
            )}
          </section>

          {/* Status feedback */}
          {saveStatus === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profil mis à jour avec succès !
            </div>
          )}
          {saveStatus === "error" && errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-5 border-t border-border space-y-3 bg-white">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-60"
          >
            {saveStatus === "saving" ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === "saving" ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}
