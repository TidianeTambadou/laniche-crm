"use client";

import React, { useEffect, useState } from "react";
import { X, Save, LogOut, Mail, Lock, Store, Calendar, CheckCircle2, AlertCircle, MapPin, Globe, AtSign, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AddressAutocomplete from "./AddressAutocomplete";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

type DayHours = { ouvert: boolean; debut: string; fin: string };
type OpeningHours = Record<string, DayHours>;

const DAYS: { key: string; label: string }[] = [
  { key: "lundi",    label: "Lun" },
  { key: "mardi",    label: "Mar" },
  { key: "mercredi", label: "Mer" },
  { key: "jeudi",    label: "Jeu" },
  { key: "vendredi", label: "Ven" },
  { key: "samedi",   label: "Sam" },
  { key: "dimanche", label: "Dim" },
];

const DEFAULT_HOURS: OpeningHours = {
  lundi:    { ouvert: true,  debut: "09:00", fin: "19:00" },
  mardi:    { ouvert: true,  debut: "09:00", fin: "19:00" },
  mercredi: { ouvert: true,  debut: "09:00", fin: "19:00" },
  jeudi:    { ouvert: true,  debut: "09:00", fin: "19:00" },
  vendredi: { ouvert: true,  debut: "09:00", fin: "19:00" },
  samedi:   { ouvert: true,  debut: "10:00", fin: "18:00" },
  dimanche: { ouvert: false, debut: "10:00", fin: "17:00" },
};

function OpeningHoursEditor({ value, onChange }: { value: OpeningHours; onChange: (v: OpeningHours) => void }) {
  const toggle = (key: string) => onChange({ ...value, [key]: { ...value[key], ouvert: !value[key].ouvert } });
  const setTime = (key: string, field: "debut" | "fin", t: string) =>
    onChange({ ...value, [key]: { ...value[key], [field]: t } });

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const day = value[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggle(key)}
              className={`w-10 shrink-0 text-[11px] font-bold rounded-lg py-1 transition-colors ${
                day.ouvert
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {label}
            </button>
            {day.ouvert ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="time"
                  value={day.debut}
                  onChange={e => setTime(key, "debut", e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-secondary/40 border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                <span className="text-muted-foreground text-xs shrink-0">→</span>
                <input
                  type="time"
                  value={day.fin}
                  onChange={e => setTime(key, "fin", e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-secondary/40 border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground flex-1">Fermé</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const [shopName, setShopName]         = useState("");
  const [email, setEmail]               = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createdAt, setCreatedAt]       = useState("");
  const [initials, setInitials]         = useState("??");
  const [saveStatus, setSaveStatus]     = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg]         = useState("");

  // Location fields
  const [addrLine, setAddrLine]         = useState("");
  const [postalCode, setPostalCode]     = useState("");
  const [city, setCity]                 = useState("");
  const [country, setCountry]           = useState("France");
  const [websiteUrl, setWebsiteUrl]     = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_HOURS);
  const [shopLat, setShopLat]           = useState(0);
  const [shopLng, setShopLng]           = useState(0);

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
      .select("id, name, created_at, address_line, postal_code, city, country, website_url, instagram_url, latitude, longitude, opening_hours")
      .eq("id", session.user.id)
      .maybeSingle();

    if (shop) {
      setShopName(shop.name);
      setInitials(shop.name.substring(0, 2).toUpperCase());
      setCreatedAt(new Date(shop.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
      setAddrLine(shop.address_line ?? "");
      setPostalCode(shop.postal_code ?? "");
      setCity(shop.city ?? "");
      setCountry(shop.country ?? "France");
      setWebsiteUrl(shop.website_url ?? "");
      setInstagramUrl(shop.instagram_url ?? "");
      setShopLat(shop.latitude ?? 0);
      setShopLng(shop.longitude ?? 0);
      setOpeningHours((shop.opening_hours as OpeningHours) ?? DEFAULT_HOURS);
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non connecté");
      const uid = session.user.id;

      // Coordonnées : depuis autocomplete si disponibles, sinon Nominatim fallback
      let lat: number | undefined = shopLat || undefined;
      let lng: number | undefined = shopLng || undefined;
      if ((!lat || !lng) && addrLine && city) {
        try {
          const q = encodeURIComponent(`${addrLine}, ${postalCode} ${city}, ${country}`);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
            { headers: { "Accept-Language": "fr" } }
          );
          const geo = await res.json();
          if (geo[0]) { lat = parseFloat(geo[0].lat); lng = parseFloat(geo[0].lon); }
        } catch {}
      }

      const shopUpdate: Record<string, unknown> = {
        name: shopName,
        address_line: addrLine,
        postal_code: postalCode,
        city,
        country,
        website_url: websiteUrl || null,
        instagram_url: instagramUrl || null,
        opening_hours: openingHours,
        updated_at: new Date().toISOString(),
      };
      if (lat !== undefined && lng !== undefined) {
        shopUpdate.latitude = lat;
        shopUpdate.longitude = lng;
      }

      const { error: shopError } = await supabase
        .from("shops")
        .update(shopUpdate)
        .eq("id", uid);
      if (shopError) throw shopError;

      if (email !== session.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
      }

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
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-primary px-6 pt-8 pb-10">
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

          {/* Shop identity */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Informations boutique</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <Store className="w-4 h-4 text-accent" /> Nom de la boutique
              </label>
              <input
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                placeholder="Ma Boutique"
              />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Location */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Localisation</h3>
            <p className="text-xs text-muted-foreground -mt-2">
              Visible sur la carte de l&apos;application mobile. Les coordonnées GPS sont calculées automatiquement.
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" /> Adresse
              </label>
              <AddressAutocomplete
                value={addrLine}
                onChange={setAddrLine}
                onSelect={r => {
                  setAddrLine(r.line);
                  setPostalCode(r.postalCode);
                  setCity(r.city);
                  setShopLat(r.lat);
                  setShopLng(r.lng);
                }}
                inputClassName="w-full pl-10 pr-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary">Code postal</label>
                <input value={postalCode} onChange={e => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                  placeholder="75001" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary">Ville</label>
                <input value={city} onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                  placeholder="Paris" />
              </div>
            </div>

          </section>

          <div className="border-t border-border" />

          {/* Opening hours */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Horaires d&apos;ouverture</h3>
            <p className="text-xs text-muted-foreground -mt-2">
              Affichés sur la fiche boutique dans l&apos;application mobile.
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" /> Heures par jour
              </label>
              <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Web presence */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Présence en ligne</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" /> Site web
              </label>
              <input
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                type="url"
                className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <AtSign className="w-4 h-4 text-accent" /> Instagram
              </label>
              <input
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                type="url"
                className="w-full px-4 py-3 bg-secondary/40 border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-medium transition-all"
                placeholder="https://instagram.com/maboutique"
              />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Account */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Compte</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" /> Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                onChange={e => setNewPassword(e.target.value)}
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
                  onChange={e => setConfirmPassword(e.target.value)}
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
              Profil mis à jour — boutique visible sur le mobile !
            </div>
          )}
          {saveStatus === "error" && errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-border space-y-3 bg-background">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-60"
          >
            {saveStatus === "saving"
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Géolocalisation + sauvegarde…</>
              : <><Save className="w-4 h-4" />Sauvegarder les modifications</>
            }
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
