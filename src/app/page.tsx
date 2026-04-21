"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Package, TrendingUp, Tags, DollarSign, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, subDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useProfile } from "@/contexts/ProfileContext";
import AIInsightsCard from "@/components/AIInsightsCard";
import PageHeader from "@/components/PageHeader";
import ShopMap from "@/components/ShopMap";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

interface KPIProps { label: string; value: string | number; Icon: React.ElementType; }
function KPICard({ label, value, Icon }: KPIProps) {
  return (
    <motion.div variants={fade}
      className="bg-background rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
    </motion.div>
  );
}

export default function Dashboard() {
  const { openProfile } = useProfile();
  const [shopName, setShopName]             = useState("Boutique");
  const [kpis, setKpis]                     = useState({ totalStock: 0, brades: 0, estRevenue: 0, totalViews: 0 });
  const [topBrands, setTopBrands]           = useState<any[]>([]);
  const [stockEvolution, setStockEvolution] = useState<any[]>([]);
  const [shopLat, setShopLat]               = useState(0);
  const [shopLng, setShopLng]               = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      const { data: shop } = await supabase
        .from("shops").select("name, latitude, longitude").eq("id", uid).maybeSingle();
      if (shop) {
        setShopName(shop.name);
        setShopLat(shop.latitude ?? 0);
        setShopLng(shop.longitude ?? 0);
      }
      const id = uid;
      const { data: perf } = await supabase
        .from("shop_stock")
        .select("perfume_name, brand, price, quantity, is_private_sale, private_sale_price, created_at")
        .eq("shop_id", id);
      if (!perf) return;
      let tS = 0, br = 0, rv = 0;
      const bMap: Record<string,number> = {};
      const dMap: Record<string,number> = {};
      for (let i = 6; i >= 0; i--) dMap[format(subDays(new Date(), i), "dd MMM", { locale: fr })] = 0;
      perf.forEach(p => {
        tS += p.quantity;
        if (p.is_private_sale) br++;
        rv += p.quantity * (p.is_private_sale && p.private_sale_price ? p.private_sale_price : (p.price ?? 0));
        bMap[p.brand] = (bMap[p.brand] || 0) + p.quantity;
        const ds = format(parseISO(p.created_at), "dd MMM", { locale: fr });
        if (dMap[ds] !== undefined) dMap[ds] += p.quantity;
      });
      setKpis({ totalStock: tS, brades: br, estRevenue: rv, totalViews: 0 });
      setTopBrands(Object.entries(bMap).map(([name, stock]) => ({ name, stock })).sort((a,b) => b.stock-a.stock).slice(0,5));
      setStockEvolution(Object.entries(dMap).map(([name, ajouts]) => ({ name, ajouts })));
    }
    load();
  }, []);

  const KPI_LIST = [
    { label: "Parfums en stock",     value: kpis.totalStock,                                       Icon: Package },
    { label: "Vues profil",          value: kpis.totalViews,                                        Icon: TrendingUp },
    { label: "Articles bradés",      value: kpis.brades,                                            Icon: Tags },
    { label: "Valeur est. du stock", value: `${kpis.estRevenue.toLocaleString("fr-FR")} €`,         Icon: DollarSign },
  ];

  return (
    <div className="w-full min-h-screen bg-background">

      <PageHeader
        title={shopName}
        left={<Image src="/logo.jpg" alt="" width={24} height={24} className="w-6 h-6 rounded-md object-cover hidden sm:block" />}
        right={
          <>
            <span className="text-xs text-muted-foreground hidden md:block">{format(new Date(), "EEEE d MMM", { locale: fr })}</span>
            <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground rounded-full" />
            </button>
            <button onClick={openProfile}
              className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center text-xs font-black uppercase hover:opacity-80 transition-opacity">
              {shopName.substring(0, 2)}
            </button>
          </>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-5">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-xl font-black text-foreground tracking-tight">Bonjour, {shopName} 👋</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Voici un aperçu de votre activité du jour.</p>
        </motion.div>

        {/* KPI grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {KPI_LIST.map(k => <KPICard key={k.label} {...k} />)}
        </motion.div>

        {/* ── AI INSIGHTS CARD — hero section ── */}
        <AIInsightsCard kpis={kpis} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 bg-background rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">Stocks — 7 derniers jours</h3>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-medium">Quantités ajoutées</span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockEvolution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBW" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#0a0a0a" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 11 }} dy={8} />
                  <YAxis  axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }} />
                  <Area type="monotone" dataKey="ajouts" stroke="#0a0a0a" strokeWidth={2} fill="url(#gBW)" dot={{ r: 3, fill: "#0a0a0a" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">Top 5 Marques</h3>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-medium">Qté</span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBrands} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 11 }} dy={8} />
                  <YAxis  axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }} cursor={{ fill: "#f5f5f5" }} />
                  <Bar dataKey="stock" fill="#0a0a0a" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Localisation boutique */}
        {shopLat !== 0 && (
          <motion.div variants={fade} className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Ma boutique</h3>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-medium">Localisation</span>
            </div>
            <ShopMap lat={shopLat} lng={shopLng} label={shopName} height={220} />
          </motion.div>
        )}

      </div>
    </div>
  );
}
