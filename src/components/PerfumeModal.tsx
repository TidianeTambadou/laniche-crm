"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check, Loader2, Sparkles } from "lucide-react";
import PerfumeAutocomplete from "./PerfumeAutocomplete";

export interface PerfumeFormData {
  name:     string;
  brand:    string;
  price:    number;
  quantity: number;
}

interface PerfumeModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  onSubmit:   (data: PerfumeFormData) => Promise<void>;
  initial?:   Partial<PerfumeFormData>;
  mode?:      "add" | "edit";
  existingPerfumes?: Array<{ perfume_name: string; brand: string }>;
}

/* ── Animated input field ── */
function Field({
  label, value, onChange, type = "text", placeholder, autoFocus,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5"
    >
      <motion.label
        animate={{ color: focused ? "#0a0a0a" : "#737373" }}
        className="block text-[11px] font-bold uppercase tracking-widest transition-colors"
      >
        {label}
      </motion.label>
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(10,10,10,0.15), 0 1px 3px rgba(0,0,0,0.08)"
            : "0 0 0 1px rgba(0,0,0,0.1)",
        }}
        className="rounded-xl overflow-hidden bg-secondary/40"
      >
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
      </motion.div>
    </motion.div>
  );
}

/* ── Quantity stepper ── */
function QuantityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const inc = () => onChange(value + 1);
  const dec = () => onChange(Math.max(1, value - 1));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Quantité initiale
      </label>
      <div className="flex items-center gap-3">
        <motion.button type="button" onClick={dec} whileTap={{ scale: 0.88 }}
          className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition-colors shrink-0">
          <Minus className="w-4 h-4" />
        </motion.button>
        <motion.div
          key={value}
          initial={{ scale: 1.2, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex-1 text-center text-2xl font-black text-foreground select-none"
        >
          {value}
        </motion.div>
        <motion.button type="button" onClick={inc} whileTap={{ scale: 0.88 }}
          className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center text-background hover:opacity-80 transition-opacity shrink-0">
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Price field with € badge ── */
function PriceField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
      <motion.label animate={{ color: focused ? "#0a0a0a" : "#737373" }}
        className="block text-[11px] font-bold uppercase tracking-widest">
        Prix unitaire
      </motion.label>
      <motion.div
        animate={{ boxShadow: focused ? "0 0 0 2px rgba(10,10,10,0.15), 0 1px 3px rgba(0,0,0,0.08)" : "0 0 0 1px rgba(0,0,0,0.1)" }}
        className="rounded-xl overflow-hidden bg-secondary/40 flex items-center">
        <input
          type="number" min="0" step="0.01" value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0.00"
          className="flex-1 px-4 py-3 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
        <span className="px-4 text-sm font-bold text-muted-foreground border-l border-border/60">€</span>
      </motion.div>
    </motion.div>
  );
}

/* ── Success overlay ── */
function SuccessOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 rounded-2xl"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
        className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mb-5"
      >
        <Check className="w-8 h-8 text-background" strokeWidth={3} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-base font-black text-foreground"
      >
        Parfum ajouté !
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-sm text-muted-foreground mt-1"
      >
        Le stock a été mis à jour.
      </motion.p>
    </motion.div>
  );
}

export default function PerfumeModal({
  isOpen, onClose, onSubmit, initial, mode = "add", existingPerfumes = [],
}: PerfumeModalProps) {
  const [name,     setName]     = useState(initial?.name     ?? "");
  const [brand,    setBrand]    = useState(initial?.brand    ?? "");
  const [price,    setPrice]    = useState(String(initial?.price ?? ""));
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [status,   setStatus]   = useState<"idle"|"loading"|"success">("idle");

  useEffect(() => {
    if (isOpen) {
      setName(initial?.name     ?? "");
      setBrand(initial?.brand   ?? "");
      setPrice(String(initial?.price ?? ""));
      setQuantity(initial?.quantity ?? 1);
      setStatus("idle");
    }
  }, [isOpen]);

  const valid = name.trim().length > 0 && brand.trim().length > 0 && parseFloat(price) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status !== "idle") return;
    setStatus("loading");
    await onSubmit({ name: name.trim(), brand: brand.trim(), price: parseFloat(price), quantity });
    setStatus("success");
    setTimeout(onClose, 1400);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.94, y: 24  }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-x-4 bottom-[calc(1rem+4rem+env(safe-area-inset-bottom))] sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-full sm:max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">

              {/* Success overlay */}
              <AnimatePresence>
                {status === "success" && <SuccessOverlay />}
              </AnimatePresence>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-background" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-foreground leading-none">
                      {mode === "add" ? "Nouveau parfum" : "Modifier le parfum"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Renseignez les informations du produit</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <motion.div
                  variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Nom du parfum</label>
                    <PerfumeAutocomplete
                      value={name}
                      onChange={setName}
                      onSelect={opt => { setName(opt.name); setBrand(opt.brand); }}
                      existingPerfumes={existingPerfumes}
                      placeholder="Ex: Bleu de Chanel"
                      inputClassName="w-full px-4 py-3 bg-secondary/40 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 outline-none border border-transparent focus:border-foreground/20 transition-colors"
                    />
                  </div>
                  <Field label="Marque" value={brand} onChange={setBrand}
                    placeholder="Ex: Chanel" />
                  <PriceField value={price} onChange={setPrice} />
                  <QuantityStepper value={quantity} onChange={setQuantity} />
                </motion.div>

                {/* CTA */}
                <motion.button
                  type="submit"
                  disabled={!valid || status !== "idle"}
                  whileTap={valid ? { scale: 0.97 } : {}}
                  className="relative w-full mt-2 overflow-hidden bg-foreground text-background font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-40 transition-opacity"
                >
                  {/* Shimmer on hover */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.55 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {status === "loading"
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Ajout en cours…</>
                      : <>{mode === "add" ? <Plus className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          {mode === "add" ? "Ajouter au stock" : "Enregistrer"}</>
                    }
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
