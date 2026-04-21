"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Plus, Pencil, Trash2, Tag, Search, Package, ClipboardList, X, Check } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import PerfumeModal, { PerfumeFormData } from "@/components/PerfumeModal";

interface Item {
  id: string;
  perfume_name: string;
  brand: string;
  price: number | null;
  quantity: number;
  is_private_sale: boolean;
  private_sale_price: number | null;
}

export default function InventoryPage() {
  const [items, setItems]           = useState<Item[]>([]);
  const [query, setQuery]           = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [shopId, setShopId]         = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Item | null>(null);
  const [pasteOpen, setPasteOpen]   = useState(false);
  const [pasteText, setPasteText]   = useState("");
  const [pastePreview, setPastePreview] = useState<{ name: string; brand: string; price: number; quantity: number }[]>([]);
  const [pasteLoading, setPasteLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;
      setShopId(uid);
      fetchItems(uid);
    });
  }, []);

  const fetchItems = async (id: string) => {
    const { data, error } = await supabase
      .from("shop_stock")
      .select("id, perfume_name, brand, price, quantity, is_private_sale, private_sale_price")
      .eq("shop_id", id)
      .order("perfume_name");
    if (error) console.error("[fetchItems]", error);
    if (data) setItems(data as Item[]);
  };

  /* ── CSV import ── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shopId) return;
    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = (results.data as any[]).filter(r => r.name || r.nom).map(r => ({
          shop_id:      shopId,
          perfume_name: r.name  || r.nom    || "Inconnu",
          brand:        r.brand || r.marque || "Inconnue",
          price:        parseFloat(r.price  || r.prix)    || 0,
          quantity:     parseInt(r.quantity || r.quantite) || 1,
        }));
        if (rows.length) {
          const { error } = await supabase.from("shop_stock").insert(rows);
          if (error) console.error("[csv import]", error);
          await fetchItems(shopId);
        }
        setIsUploading(false);
      },
    });
  };

  /* ── CRUD ── */
  const handleAdd = async (data: PerfumeFormData) => {
    const { error } = await supabase.from("shop_stock").insert([{
      shop_id:      shopId,
      perfume_name: data.name,
      brand:        data.brand,
      price:        data.price,
      quantity:     data.quantity,
    }]);
    if (error) console.error("[handleAdd]", error);
    await fetchItems(shopId);
  };

  const handleEdit = async (data: PerfumeFormData) => {
    if (!editTarget) return;
    const { error } = await supabase.from("shop_stock")
      .update({ perfume_name: data.name, brand: data.brand, price: data.price, quantity: data.quantity })
      .eq("id", editTarget.id);
    if (error) console.error("[handleEdit]", error);
    await fetchItems(shopId);
  };

  const togglePrivateSale = async (item: Item) => {
    const nowSale = !item.is_private_sale;
    await supabase.from("shop_stock").update({
      is_private_sale:        nowSale,
      private_sale_price:     nowSale ? (item.price ?? 0) * 0.8 : null,
      private_sale_enabled_at: nowSale ? new Date().toISOString() : null,
    }).eq("id", item.id);
    fetchItems(shopId);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer ce parfum ?")) return;
    await supabase.from("shop_stock").delete().eq("id", id);
    fetchItems(shopId);
  };

  /* ── Paste/text import ── */
  const parsePasteLine = (line: string) => {
    // Formats acceptés (séparateurs : - | , tab) :
    // "Chance Eau Tendre - Chanel - 120 - 3"
    // "Sauvage Dior 89.99 5"
    // "La Vie Est Belle" (marque et prix optionnels)
    const sep = /[\-\|,\t]+/;
    const parts = line.split(sep).map(p => p.trim()).filter(Boolean);
    const name  = parts[0] ?? "Inconnu";
    const brand = parts[1] ?? "";
    const price = parseFloat(parts.find(p => /^\d+(\.\d+)?$/.test(p.replace("€","").replace(",","."))) ?? "0") || 0;
    const qty   = parseInt(parts[parts.length - 1]) || 1;
    return { name, brand, price, quantity: qty };
  };

  const handlePasteChange = (text: string) => {
    setPasteText(text);
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    setPastePreview(lines.map(parsePasteLine));
  };

  const confirmPasteImport = async () => {
    if (!shopId || !pastePreview.length) return;
    setPasteLoading(true);
    const rows = pastePreview.map(p => ({
      shop_id:      shopId,
      perfume_name: p.name,
      brand:        p.brand,
      price:        p.price,
      quantity:     p.quantity,
    }));
    const { error } = await supabase.from("shop_stock").insert(rows);
    if (error) console.error("[paste import]", error);
    await fetchItems(shopId);
    setPasteOpen(false);
    setPasteText("");
    setPastePreview([]);
    setPasteLoading(false);
  };

  const openAdd    = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (item: Item) => { setEditTarget(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const filtered = items.filter(i =>
    i.perfume_name.toLowerCase().includes(query.toLowerCase()) ||
    i.brand.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-background">

      <PageHeader
        title="Inventaire & Stock"
        right={
          <>
            <button onClick={() => setPasteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-muted transition-colors">
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Coller une liste</span>
            </button>
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-muted transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isUploading ? "Lecture…" : "CSV"}</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-85 transition-opacity">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </>
        }
      />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">

        {/* Search */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-border px-4 py-3 gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher…"
              className="w-full bg-secondary/50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/15 transition-all" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground shrink-0">{filtered.length} art.</span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["Parfum", "Marque", "Stock", "Prix", "Statut", ""].map(h => (
                  <th key={h} className="py-3 px-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <motion.tr key={item.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-secondary/30 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center font-black text-xs shrink-0">
                          {item.perfume_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm text-foreground">{item.perfume_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-muted-foreground">{item.brand}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.quantity < 5 ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-sm font-bold font-mono">{item.price?.toFixed(2) ?? "—"} €</td>
                    <td className="py-3.5 px-5">
                      {item.is_private_sale
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-foreground text-background"><Tag className="w-3 h-3"/>Bradé</span>
                        : <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">Standard</span>
                      }
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => togglePrivateSale(item)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Basculer bradé">
                          <Tag className="w-3.5 h-3.5"/>
                        </button>
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Pencil className="w-3.5 h-3.5"/>
                        </button>
                        <button onClick={() => deleteItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                  Aucun article. Importez un CSV ou ajoutez manuellement.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center font-black text-sm shrink-0">
                      {item.perfume_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{item.perfume_name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.is_private_sale && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground text-background">Bradé</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.quantity < 5 ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}>
                      {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="font-black text-base font-mono">{item.price?.toFixed(2) ?? "—"} €</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePrivateSale(item)}
                      className="p-2 rounded-xl bg-secondary text-foreground hover:bg-muted transition-colors"><Tag className="w-3.5 h-3.5"/></button>
                    <button onClick={() => openEdit(item)}
                      className="p-2 rounded-xl bg-secondary text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={() => deleteItem(item.id)}
                      className="p-2 rounded-xl bg-secondary text-foreground hover:bg-muted transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-border py-16 text-center text-sm text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
              Aucun article. Importez un CSV ou ajoutez manuellement.
            </div>
          )}
          <motion.button onClick={openAdd} whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-foreground text-background shadow-xl shadow-black/20 flex items-center justify-center z-30">
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* ── Paste import modal ── */}
      <AnimatePresence>
        {pasteOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) { setPasteOpen(false); setPasteText(""); setPastePreview([]); }}}>
            <motion.div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-base">Coller une liste</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Une ligne = un parfum. Format libre :<br/>
                    <span className="font-mono">Nom - Marque - Prix - Quantité</span> (marque/prix optionnels)</p>
                </div>
                <button onClick={() => { setPasteOpen(false); setPasteText(""); setPastePreview([]); }}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                autoFocus
                value={pasteText}
                onChange={e => handlePasteChange(e.target.value)}
                placeholder={"Chance Eau Tendre - Chanel - 120 - 3\nSauvage - Dior - 89.99\nLa Vie Est Belle"}
                rows={6}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-mono resize-none outline-none focus:ring-2 focus:ring-foreground/15"
              />

              {pastePreview.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Aperçu — {pastePreview.length} article{pastePreview.length > 1 ? "s" : ""}
                  </p>
                  {pastePreview.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-3 py-2 text-sm">
                      <span className="font-semibold flex-1 truncate">{p.name}</span>
                      <span className="text-muted-foreground text-xs truncate">{p.brand || "—"}</span>
                      <span className="font-mono text-xs shrink-0">{p.price ? `${p.price}€` : "—"}</span>
                      <span className="text-xs font-bold shrink-0">×{p.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={confirmPasteImport}
                disabled={!pastePreview.length || pasteLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background text-sm font-bold disabled:opacity-40 hover:opacity-85 transition-opacity">
                <Check className="w-4 h-4" />
                {pasteLoading ? "Import…" : `Importer ${pastePreview.length || ""} article${pastePreview.length > 1 ? "s" : ""}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PerfumeModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={editTarget ? handleEdit : handleAdd}
        initial={editTarget ? { name: editTarget.perfume_name, brand: editTarget.brand, price: editTarget.price ?? 0, quantity: editTarget.quantity } : undefined}
        mode={editTarget ? "edit" : "add"}
      />
    </div>
  );
}
