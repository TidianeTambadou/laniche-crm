"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, BarChart2, Zap } from "lucide-react";
import Link from "next/link";

/* ── Floating stat badges ── */
const FLOATERS = [
  { label: "+23%",  sub: "ventes est.",  x: "78%", y: "18%", delay: 0    },
  { label: "⚡ x3",  sub: "réassort",    x: "82%", y: "62%", delay: 0.4  },
  { label: "↑ top", sub: "Chanel N°5",  x: "60%", y: "80%", delay: 0.8  },
  { label: "–12%",  sub: "stock mort",  x: "65%", y: "12%", delay: 1.2  },
];

/* ── Ticker items ── */
const TICKER = [
  "INTELLIGENCE ARTIFICIELLE",
  "STOCK PRÉDICTIF",
  "RECOMMANDATIONS PERSONNALISÉES",
  "ANALYSE EN TEMPS RÉEL",
  "OPTIMISATION AUTOMATIQUE",
  "DATA-DRIVEN DECISIONS",
];

/* ── Typewriter ── */
function Typewriter({ phrases }: { phrases: string[] }) {
  const [idx, setIdx]   = useState(0);
  const [text, setText] = useState("");
  const [del, setDel]   = useState(false);

  useEffect(() => {
    const full = phrases[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!del) {
      if (text.length < full.length) {
        timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setDel(true), 2200);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 28);
      } else {
        setDel(false);
        setIdx((idx + 1) % phrases.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, del, idx, phrases]);

  return (
    <span className="inline-block">
      {text}
      <span className="animate-pulse ml-0.5">|</span>
    </span>
  );
}

/* ── Magnetic button ── */
function MagneticButton() {
  const ref  = useRef<HTMLAnchorElement>(null);
  const x    = useMotionValue(0);
  const y    = useMotionValue(0);
  const sx   = useSpring(x, { stiffness: 200, damping: 18 });
  const sy   = useSpring(y, { stiffness: 200, damping: 18 });
  const [hov, setHov] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width  - 0.5) * 22);
    y.set(((e.clientY - r.top)  / r.height - 0.5) * 22);
  };

  return (
    <motion.a
      ref={ref}
      href="/ai-insights"
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); x.set(0); y.set(0); }}
      className="relative inline-flex items-center gap-3 bg-white text-black font-bold text-sm px-6 py-3.5 rounded-full overflow-hidden cursor-pointer select-none"
    >
      {/* Shimmer sweep */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/8 to-transparent"
        initial={{ x: "-100%" }}
        animate={hov ? { x: "200%" } : { x: "-100%" }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Découvrir mes insights IA
        <motion.span animate={hov ? { x: 4 } : { x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      </span>
      {hov && (
        <motion.span
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.4)" }}
        />
      )}
    </motion.a>
  );
}

/* ── Grid background ── */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ top: "-2%" }}
        animate={{ top: "102%" }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
      />
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/4 rounded-bl-[80px]" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-tr-[60px]" />
    </div>
  );
}

/* ── Main component ── */
export default function AIInsightsCard({ kpis }: { kpis?: { totalStock: number; brades: number; estRevenue: number } }) {

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 24 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={containerVariants}
      className="relative rounded-3xl bg-[#0a0a0a] overflow-hidden min-h-[340px] flex flex-col justify-between"
    >
      <AnimatedGrid />

      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none animate-noise"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Ticker */}
      <div className="relative z-10 flex overflow-hidden border-b border-white/8 py-2.5">
        <div className="animate-marquee flex gap-12 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase flex items-center gap-3">
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-8 lg:p-10 flex-1">

        {/* Left: copy */}
        <div className="max-w-lg">
          <motion.div variants={childVariants} className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-white/40 uppercase">
              Intelligence Artificielle
            </span>
          </motion.div>

          <motion.h2 variants={childVariants} className="text-4xl lg:text-5xl font-black text-white leading-[1.05] tracking-tight mb-4">
            Vos données<br />
            <span className="text-white/40">
              <Typewriter phrases={["cachent des\nopportunités.", "révèlent des\ntendances.", "optimisent vos\nventes."]} />
            </span>
          </motion.h2>

          <motion.p variants={childVariants} className="text-white/40 text-sm leading-relaxed mb-8 max-w-sm">
            Notre IA analyse votre stock, vos ventes et les tendances marché pour vous donner des recommandations qui font la différence.
          </motion.p>

          <motion.div variants={childVariants}>
            <MagneticButton />
          </motion.div>
        </div>

        {/* Right: animated stats preview */}
        <div className="relative w-full lg:w-auto lg:shrink-0 h-48 lg:h-auto">

          {/* Central orb */}
          <motion.div
            className="hidden lg:flex w-40 h-40 rounded-full border border-white/10 items-center justify-center relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          >
            <div className="w-28 h-28 rounded-full border border-white/8 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Zap className="w-7 h-7 text-white/60" />
              </div>
            </div>
            {/* Dot on orbit */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </motion.div>

          {/* Floating badges */}
          {FLOATERS.map((f, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/8 border border-white/12 backdrop-blur-sm rounded-xl px-3 py-2"
              style={{ left: f.x, top: f.y }}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: f.delay + 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              animate={{ y: [0, -5, 0] }}
            >
              <p className="text-white font-bold text-sm">{f.label}</p>
              <p className="text-white/40 text-[10px]">{f.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom stat strip */}
      <motion.div
        variants={childVariants}
        className="relative z-10 border-t border-white/8 grid grid-cols-3 divide-x divide-white/8"
      >
        {[
          { icon: BarChart2, label: "Analyse stock",      val: kpis ? `${kpis.totalStock} art.` : "—" },
          { icon: TrendingUp, label: "Articles bradés",   val: kpis ? `${kpis.brades}` : "—"           },
          { icon: Sparkles,   label: "Insights dispo.",   val: "Bientôt"                               },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} className="px-6 py-4 flex items-center gap-3">
            <Icon className="w-4 h-4 text-white/30 shrink-0" />
            <div>
              <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{label}</p>
              <p className="text-white font-bold text-sm">{val}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
