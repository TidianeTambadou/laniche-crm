"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  PointerSensor, TouchSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Tag, Share2, CheckCheck, GripVertical, X, Loader2,
  Pencil, Sparkles, Package, Copy, Send, ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";

interface StockItem {
  id: string;
  perfume_name: string;
  brand: string;
  price: number | null;
  quantity: number;
  is_private_sale: boolean;
  private_sale_price: number | null;
  sale_quantity: number | null;
}

/* ─────────────────────────────────────────────
   DRAGGABLE STOCK CARD (left panel)
───────────────────────────────────────────── */
function StockCard({
  item, isDragging, onBrader,
}: {
  item: StockItem;
  isDragging?: boolean;
  onBrader?: (item: StockItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: item.id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }}
      {...attributes}
      {...(onBrader ? {} : listeners)}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`bg-background rounded-2xl border border-border p-4 select-none group ${onBrader ? "cursor-default" : "cursor-grab active:cursor-grabbing touch-none"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-sm shrink-0 text-foreground">
          {item.perfume_name.charAt(0)}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.quantity < 5 ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}>
          {item.quantity}
        </span>
      </div>
      <p className="font-bold text-sm text-foreground leading-tight mb-0.5 truncate">{item.perfume_name}</p>
      <p className="text-xs text-muted-foreground mb-2 truncate">{item.brand}</p>
      <p className="text-sm font-black font-mono text-foreground">{item.price?.toFixed(2) ?? "—"} €</p>

      {onBrader ? (
        /* Mobile: tap button */
        <button
          onClick={() => onBrader(item)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-foreground text-background text-[11px] font-bold hover:opacity-85 transition-opacity"
        >
          <Tag className="w-3 h-3" /> Brader
        </button>
      ) : (
        /* Desktop: drag hint */
        <div className="mt-3 flex items-center gap-1 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" {...listeners}>
          <GripVertical className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium">Glisser en vitrine</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   DRAG OVERLAY
───────────────────────────────────────────── */
function DragPreview({ item }: { item: StockItem }) {
  return (
    <div className="bg-background rounded-2xl border-2 border-foreground/20 p-4 shadow-2xl shadow-black/25 rotate-2 scale-105 w-44">
      <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center font-black text-background text-sm mb-3">
        {item.perfume_name.charAt(0)}
      </div>
      <p className="font-bold text-sm text-foreground truncate">{item.perfume_name}</p>
      <p className="text-xs text-muted-foreground">{item.brand}</p>
      <p className="text-sm font-black font-mono text-foreground mt-1">{item.price?.toFixed(2) ?? "—"} €</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VITRINE CARD (right dark panel)
───────────────────────────────────────────── */
function VitrineCard({
  item, onEditPrice, onRemove,
}: { item: StockItem; onEditPrice: (item: StockItem) => void; onRemove: (item: StockItem) => void }) {
  const original = item.price ?? 0;
  const vip      = item.private_sale_price ?? original;
  const pct      = original > 0 ? Math.round((1 - vip / original) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -10 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="relative bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-4 group hover:bg-white/[0.09] transition-colors"
    >
      <div className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
        <Tag className="w-2.5 h-2.5" /> VIP
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-white text-sm shrink-0">
          {item.perfume_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-white truncate leading-tight">{item.perfume_name}</p>
          <p className="text-xs text-white/40 truncate">{item.brand}</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-white/25 line-through font-mono">{original.toFixed(2)} €</p>
          <p className="text-2xl font-black text-white font-mono leading-none">{vip.toFixed(2)} €</p>
          {pct > 0 && <p className="text-[10px] text-white/30 mt-0.5">−{pct}%</p>}
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => onEditPrice(item)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white">
            <Pencil className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => onRemove(item)}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-500/40 transition-colors text-white">
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between text-white/25">
        <div className="flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span className="text-[10px]">Vitrine VIP active</span>
        </div>
        <span className="text-[10px] font-bold">
          {item.sale_quantity ?? item.quantity} unité{(item.sale_quantity ?? item.quantity) > 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PRICE MODAL
───────────────────────────────────────────── */
function PriceModal({
  item, onConfirm, onClose, mode,
}: {
  item: StockItem | null;
  onConfirm: (price: number, qty: number) => Promise<void>;
  onClose: () => void;
  mode: "add" | "edit";
}) {
  const [price,   setPrice]   = useState("");
  const [qty,     setQty]     = useState(1);
  const [loading, setLoading] = useState(false);

  const maxQty = item?.quantity ?? 1;

  useEffect(() => {
    if (item) {
      setPrice(
        mode === "edit"
          ? String(item.private_sale_price ?? item.price ?? "")
          : ((item.price ?? 0) * 0.8).toFixed(2)
      );
      setQty(mode === "edit" ? (item.sale_quantity ?? item.quantity) : item.quantity);
    }
  }, [item, mode]);

  const original = item?.price ?? 0;
  const pct = original > 0 && parseFloat(price) > 0
    ? Math.round((1 - parseFloat(price) / original) * 100) : 0;

  const handleConfirm = async () => {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) return;
    setLoading(true);
    await onConfirm(p, qty);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 28 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="fixed inset-x-4 bottom-[calc(1rem+4rem+env(safe-area-inset-bottom))] sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <motion.div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                initial={{ top: "0%" }} animate={{ top: "100%" }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-white text-sm">
                      {item.perfume_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-white text-sm leading-tight">{item.perfume_name}</p>
                      <p className="text-[11px] text-white/35">{item.brand} · {item.price?.toFixed(2) ?? "—"} €</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
                  <span className="text-[11px] text-white/35 font-medium">Prix original</span>
                  <span className="text-sm font-bold text-white/50 font-mono line-through">{item.price?.toFixed(2) ?? "—"} €</span>
                </div>

                <div className="mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                    {mode === "add" ? "Fixer le prix VIP" : "Modifier le prix VIP"}
                  </label>
                  <div className="flex items-center bg-white/8 rounded-xl overflow-hidden ring-1 ring-white/12 focus-within:ring-white/30 transition-all">
                    <input
                      type="number" min="0" step="0.01" value={price}
                      onChange={e => setPrice(e.target.value)}
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && handleConfirm()}
                      className="flex-1 px-4 py-3.5 bg-transparent text-white font-black text-2xl outline-none placeholder:text-white/15"
                      placeholder="0.00"
                    />
                    <span className="px-4 text-white/30 font-bold border-l border-white/8 text-sm">€</span>
                  </div>
                </div>

                <AnimatePresence>
                  {pct > 0 && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-white/35 mb-5 px-1">
                      −{pct}% de réduction pour vos clients VIP
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 mb-4">
                  {[10, 20, 30].map(d => (
                    <button key={d} onClick={() => setPrice(((item.price ?? 0) * (1 - d / 100)).toFixed(2))}
                      className="flex-1 py-1.5 rounded-lg bg-white/6 text-white/40 text-[11px] font-bold hover:bg-white/12 hover:text-white/70 transition-colors border border-white/6">
                      −{d}%
                    </button>
                  ))}
                </div>

                {/* Quantity selector */}
                <div className="mb-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                    Unités à brader
                    <span className="ml-2 text-white/20 normal-case tracking-normal font-medium">sur {maxQty} en stock</span>
                  </label>
                  <div className="flex items-center gap-3 bg-white/8 rounded-xl px-4 py-2 ring-1 ring-white/12">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 text-white font-black text-lg flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
                      disabled={qty <= 1}
                    >−</button>
                    <span className="flex-1 text-center text-white font-black text-xl">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 text-white font-black text-lg flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
                      disabled={qty >= maxQty}
                    >+</button>
                  </div>
                </div>

                <motion.button onClick={handleConfirm}
                  disabled={!price || parseFloat(price) <= 0 || loading}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full bg-white text-black font-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-25 overflow-hidden">
                  <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent"
                    initial={{ x: "-100%" }} whileHover={{ x: "200%" }} transition={{ duration: 0.55 }} />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" />En cours…</>
                      : <><Sparkles className="w-4 h-4" />{mode === "add" ? "Mettre en vitrine VIP" : "Mettre à jour le prix"}</>
                    }
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   NOTIFY SHOPIFY MODAL
───────────────────────────────────────────── */
function getNextMonths(n = 6): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + i);
    const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
  });
}

function NotifyModal({
  open, items, shopName, onClose,
}: {
  open: boolean;
  items: StockItem[];
  shopName: string;
  onClose: () => void;
}) {
  const months = getNextMonths();
  const [month,   setMonth]   = useState(months[0]);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");

  useEffect(() => { if (open) { setDone(false); setErr(""); setMonth(months[0]); } }, [open]);

  const send = async () => {
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/notify-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, month, items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setDone(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div key="modal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed inset-x-4 bottom-[calc(1rem+4rem+env(safe-area-inset-bottom))] sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-background rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-[#0a0a0a] px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Shopify</p>
                  <h2 className="text-base font-black text-white">Notifier la braderie</h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {done ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                      <CheckCheck className="w-5 h-5 text-background" />
                    </div>
                    <div>
                      <p className="font-black text-foreground">Email envoyé !</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        La liste est dans ta boîte mail.<br />
                        Tu peux maintenant mettre à jour Shopify.
                      </p>
                    </div>
                    <button onClick={onClose} className="mt-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold">
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Month picker */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Mois de lancement
                      </label>
                      <div className="relative">
                        <select value={month} onChange={e => setMonth(e.target.value)}
                          className="w-full appearance-none bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer">
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Items preview */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        {items.length} article{items.length > 1 ? "s" : ""} à notifier
                      </label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {items.map(i => {
                          const original = i.price ?? 0;
                          const vip = i.private_sale_price ?? original;
                          const pct = original > 0 ? Math.round((1 - vip / original) * 100) : 0;
                          return (
                            <div key={i.id} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-3 py-2.5">
                              <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background font-black text-[10px] shrink-0">
                                {i.perfume_name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{i.perfume_name}</p>
                                <p className="text-[10px] text-muted-foreground">{i.brand}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-black font-mono text-foreground">{vip.toFixed(2)} €</p>
                                {pct > 0 && <p className="text-[10px] text-muted-foreground">−{pct}%</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {err && (
                      <div className="p-3 rounded-xl bg-rose-50 text-rose-500 text-sm border border-rose-100">{err}</div>
                    )}

                    <button onClick={send} disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-foreground text-background text-sm font-black disabled:opacity-50 hover:opacity-85 transition-opacity">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi…</>
                        : <><Send className="w-4 h-4" />Envoyer à Shopify</>
                      }
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   DROPPABLE VITRINE ZONE
───────────────────────────────────────────── */
function VitrineDropZone({ children, isOver }: { children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: "vitrine" });
  return (
    <div ref={setNodeRef} className="flex-1 relative">
      <AnimatePresence>
        {isOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-4 rounded-2xl border-2 border-dashed border-white/40 bg-white/5 z-10 pointer-events-none flex items-center justify-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}
              className="flex flex-col items-center gap-2">
              <Tag className="w-6 h-6 text-white/60" />
              <p className="text-white/60 text-sm font-bold">Déposer ici</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE MAIN
───────────────────────────────────────────── */
export default function SalesPage() {
  const [stock,       setStock]      = useState<StockItem[]>([]);
  const [vitrine,     setVitrine]    = useState<StockItem[]>([]);
  const [shopId,      setShopId]     = useState("");
  const [shopName,    setShopName]   = useState("Ma Boutique");
  const [copied,      setCopied]     = useState(false);
  const [isOver,      setIsOver]     = useState(false);
  const [activeDrag,  setActiveDrag] = useState<StockItem | null>(null);
  const [priceModal,  setPriceModal] = useState<{ item: StockItem; mode: "add" | "edit" } | null>(null);
  const [notifyOpen,  setNotifyOpen] = useState(false);
  const [mobileTab,   setMobileTab]  = useState<"stock" | "vitrine">("stock");
  const stockRef = useRef<StockItem[]>([]);
  stockRef.current = stock;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;
      setShopId(uid);
      fetchAll(uid);
      const { data: shop } = await supabase.from("shops").select("name").eq("id", uid).maybeSingle();
      if (shop?.name) setShopName(shop.name);
    });
  }, []);

  const fetchAll = async (sid: string) => {
    const { data, error } = await supabase
      .from("shop_stock")
      .select("id, perfume_name, brand, price, quantity, is_private_sale, private_sale_price, sale_quantity")
      .eq("shop_id", sid)
      .order("perfume_name");
    if (error) { console.error("[fetchAll]", error); return; }
    const all = (data ?? []) as StockItem[];
    setStock(all.filter(i => !i.is_private_sale));
    setVitrine(all.filter(i => i.is_private_sale));
  };

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const item = stockRef.current.find(i => i.id === e.active.id);
    if (item) setActiveDrag(item);
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setIsOver(false);
    if (e.over?.id === "vitrine") {
      const item = stockRef.current.find(i => i.id === e.active.id);
      if (item) setPriceModal({ item, mode: "add" });
    }
    setActiveDrag(null);
  }, []);

  const handleAddToVitrine = useCallback(async (price: number, qty: number) => {
    if (!priceModal) return;
    const { error } = await supabase.from("shop_stock").update({
      is_private_sale:         true,
      private_sale_price:      price,
      sale_quantity:           qty,
      private_sale_enabled_at: new Date().toISOString(),
    }).eq("id", priceModal.item.id);
    if (error) console.error("[addToVitrine]", error);
    await fetchAll(shopId);
    setPriceModal(null);
  }, [priceModal, shopId]);

  const handleEditPrice = useCallback(async (price: number, qty: number) => {
    if (!priceModal) return;
    const { error } = await supabase.from("shop_stock")
      .update({ private_sale_price: price, sale_quantity: qty })
      .eq("id", priceModal.item.id);
    if (error) console.error("[editPrice]", error);
    await fetchAll(shopId);
    setPriceModal(null);
  }, [priceModal, shopId]);

  const handleRemove = async (item: StockItem) => {
    await supabase.from("shop_stock").update({
      is_private_sale: false, private_sale_price: null, private_sale_enabled_at: null,
    }).eq("id", item.id);
    fetchAll(shopId);
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://laniche.app/vip/boutique");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background overflow-hidden">

      <PageHeader title="Vitrine VIP"
        right={
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-85 transition-opacity">
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copié !" : "Lien VIP"}</span>
          </button>
        }
      />

      {/* ── MOBILE: onglets ── */}
      <div className="lg:hidden flex border-b border-border bg-background">
        {(["stock", "vitrine"] as const).map(tab => (
          <button key={tab} onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 text-xs font-black tracking-wide transition-colors ${
              mobileTab === tab
                ? tab === "vitrine" ? "bg-[#0a0a0a] text-white" : "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}>
            {tab === "stock" ? `Stock (${stock.length})` : `Vitrine VIP (${vitrine.length})`}
          </button>
        ))}
      </div>

      {/* ── MOBILE: contenu onglet ── */}
      <div className="lg:hidden flex-1 overflow-y-auto">
        {mobileTab === "stock" ? (
          <div className="p-4">
            {stock.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 pt-16 text-muted-foreground/50">
                <Package className="w-10 h-10" />
                <p className="text-sm text-center">{vitrine.length > 0 ? "Tous vos parfums sont déjà en vitrine !" : "Aucun parfum. Ajoutez-en dans l'inventaire."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stock.map(item => (
                  <StockCard key={item.id} item={item}
                    onBrader={i => { setPriceModal({ item: i, mode: "add" }); setMobileTab("vitrine"); }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0a0a0a] min-h-full relative">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative z-10 p-4">
              {vitrine.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 pt-16 text-white/30">
                  <Tag className="w-10 h-10" />
                  <p className="text-sm text-center">Aucun article en vitrine.<br/>Allez dans Stock et bradez un parfum.</p>
                </div>
              ) : (
                <>
                  {vitrine.length > 0 && (
                    <div className="flex items-center justify-end gap-2 mb-4">
                      <button onClick={() => setNotifyOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-black text-xs font-bold">
                        <Send className="w-3.5 h-3.5" /> Envoyer à Shopify
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence>
                      {vitrine.map(item => (
                        <VitrineCard key={item.id} item={item}
                          onEditPrice={i => setPriceModal({ item: i, mode: "edit" })}
                          onRemove={handleRemove}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP: split drag & drop ── */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}
        onDragOver={e => setIsOver(e.over?.id === "vitrine")}>

        <div className="hidden lg:flex flex-1 overflow-hidden">

          {/* LEFT: STOCK */}
          <div className="w-1/2 flex flex-col border-r border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-background">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Stock disponible</p>
              <p className="text-lg font-black text-foreground">{stock.length} parfum{stock.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {stock.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/50">
                  <Package className="w-10 h-10" />
                  <p className="text-sm font-medium text-center">
                    {vitrine.length > 0 ? "Tous vos parfums sont déjà en vitrine !" : "Aucun parfum.\nAjoutez-en dans l'inventaire."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {stock.map(item => (
                    <StockCard key={item.id} item={item} isDragging={activeDrag?.id === item.id} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: VITRINE */}
          <div className="w-1/2 flex flex-col bg-[#0a0a0a] overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
            <motion.div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
              initial={{ top: "0%" }} animate={{ top: "100%" }}
              transition={{ duration: 5, ease: "linear", repeat: Infinity, repeatDelay: 2 }} />

            <div className="relative z-10 px-5 py-4 border-b border-white/8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5">Vitrine VIP</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-black text-white">{vitrine.length} article{vitrine.length !== 1 ? "s" : ""}</p>
                {vitrine.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button onClick={copyLink}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/8 text-white/50 text-[10px] font-bold hover:bg-white/14 transition-colors">
                      {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copié" : "Lien"}
                    </button>
                    <button onClick={() => setNotifyOpen(true)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white text-black text-[10px] font-bold hover:opacity-85 transition-opacity">
                      <Send className="w-3 h-3" /> Shopify
                    </button>
                  </div>
                )}
              </div>
            </div>

            <VitrineDropZone isOver={isOver}>
              <div className="relative z-10 flex-1 overflow-y-auto p-4">
                {vitrine.length === 0 ? (
                  <motion.div
                    animate={{ borderColor: isOver ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)" }}
                    className="h-full min-h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4">
                    <motion.div animate={{ y: isOver ? -6 : 0 }} transition={{ type: "spring", stiffness: 300 }}
                      className="w-14 h-14 rounded-2xl bg-white/8 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-white/30" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white/40">Glissez vos parfums ici</p>
                      <p className="text-xs text-white/20 mt-1">Ils apparaîtront sur votre lien VIP</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence>
                      {vitrine.map(item => (
                        <VitrineCard key={item.id} item={item}
                          onEditPrice={i => setPriceModal({ item: i, mode: "edit" })}
                          onRemove={handleRemove}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </VitrineDropZone>
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeDrag ? <DragPreview item={activeDrag} /> : null}
        </DragOverlay>

      </DndContext>

      <PriceModal
        item={priceModal?.item ?? null}
        mode={priceModal?.mode ?? "add"}
        onConfirm={priceModal?.mode === "edit" ? handleEditPrice : handleAddToVitrine}
        onClose={() => setPriceModal(null)}
      />

      <NotifyModal
        open={notifyOpen}
        items={vitrine}
        shopName={shopName}
        onClose={() => setNotifyOpen(false)}
      />
    </div>
  );
}
