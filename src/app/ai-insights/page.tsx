"use client";

import React from "react";
import { Sparkles, ArrowRight, Code2, Database, Smartphone, Palette, ChevronRight, Target, Bot } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";

const DataAnimationPlayer = dynamic(() => import("@/remotion/DataAnimationPlayer"), { ssr: false });

export default function AiInsights() {
  return (
    <div className="w-full min-h-screen bg-background relative overflow-y-auto pb-32">
      {/* Background Ambience with Remotion Player */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none opacity-20">
        <DataAnimationPlayer />
      </div>

      <PageHeader title="Intelligence IA" />

      <div className="p-8 max-w-6xl mx-auto space-y-24 relative z-10 w-full mt-8">
        
        {/* --- SECTION 1: L'IA (Exemples Visuels) --- */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Intelligence Artificielle (Bientôt)</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tight font-display">
              La data au service de vos ventes.
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez comment l'IA de La Niche va transformer votre façon de gérer votre stock en se basant sur les réelles envies des consommateurs locaux.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Exemple 1 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-border shadow-lg shadow-accent/5 overflow-hidden relative">
              <Bot className="w-10 h-10 text-accent mb-6" />
              <h3 className="text-2xl font-bold mb-4">Génération de Campagnes Ads</h3>
              <p className="text-muted-foreground mb-8">Ne cherchez plus comment vendre. L'IA rédige pour vous les accroches parfaites pour TikTok et Instagram en ciblant les âges de vos acheteurs.</p>
              
              <div className="bg-secondary/50 rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded border border-border">Généré par l'IA</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Ciblage Meta recommandé</p>
                    <p className="font-semibold text-sm text-foreground">Femmes 24-35 ans • Intérêt : Niche & Luxe</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Hook (Accroche vidéo)</p>
                    <p className="font-medium text-sm italic text-foreground">"Tu cherches le parfum que personne ne porte et qui laisse un sillage incroyable ? Le Baccarat Rouge est de retour en stock chez nous..."</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Exemple 2 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-border shadow-lg shadow-accent/5 overflow-hidden relative">
              <Target className="w-10 h-10 text-foreground mb-6" />
              <h3 className="text-2xl font-bold mb-4">Prédiction & Braderie Auto</h3>
              <p className="text-muted-foreground mb-8">L'interface vous alerte sur les parfums dormants et vous propose de les pousser en Vente Privée VIP directement depuis le CRM.</p>
              
              <div className="bg-secondary/50 rounded-2xl p-6 border border-border">
                <div className="bg-white rounded-xl p-4 border border-border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-foreground" />
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm text-primary">Ombre Leather</p>
                      <p className="text-xs text-foreground font-medium">Stock dormant (4 mois sans vente)</p>
                    </div>
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-foreground font-bold">!</div>
                  </div>
                  <button className="w-full bg-foreground text-background font-bold py-2 rounded-lg text-sm shadow-md hover:opacity-80 transition-colors">
                    Passer en Bradé (-20%)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- SECTION 2: PRESTATION CRM PERSONNALISÉE --- */}
        <section className="relative">
          <div className="absolute inset-0 bg-primary rounded-[3rem] transform -rotate-1 scale-105 z-0" />
          <div className="bg-primary rounded-[3rem] p-10 md:p-16 text-primary-foreground shadow-2xl relative z-10 overflow-hidden">
            {/* Decors */}
            <div className="absolute -right-20 -top-20 w-96 h-96 border-[40px] border-white/5 rounded-full pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 border-[30px] border-accent/20 rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 text-accent font-bold mb-6 uppercase tracking-widest text-xs px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                  <Code2 className="w-4 h-4" /> Prestation de Développement
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Un besoin unique ? <br/>
                  <span className="text-accent">Nous codons votre CRM sur-mesure.</span>
                </h2>
                <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
                  La Niche n'est pas qu'une application standard. C'est votre outil de travail. 
                  Si vous avez besoin d'une fonctionnalité spécifique pour votre boutique, notre équipe technique la développe pour vous.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    "Connexion de notre CRM avec votre Logiciel de Caisse actuel",
                    "Génération d'étiquettes à code-barres automatiques",
                    "Envoi de SMS marketing ciblés à vos clients fidèles",
                    "Application iPad exclusive pour vos vendeurs en boutique"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-primary-foreground/90 font-medium">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <ChevronRight className="w-4 h-4 text-accent" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <motion.a 
                  href="https://calendly.com/tidiane-tamba92/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(0, 107, 255, 0)", "0 0 40px rgba(0, 107, 255, 0.4)", "0 0 0px rgba(0, 107, 255, 0)"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="group relative bg-[#006BFF] hover:bg-[#005be6] text-white transition-all duration-300 px-8 py-5 rounded-2xl font-bold text-lg inline-flex items-center gap-4 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <div className="bg-white p-1.5 rounded-lg flex items-center justify-center z-10">
                    {/* Calendly 'C' abstract logo style */}
                    <div className="w-6 h-6 border-4 border-[#006BFF] rounded-full border-t-transparent -rotate-45" />
                  </div>
                  <span className="z-10 flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-white/80">Discutons de votre projet</span>
                    <span>Réserver un appel Calendly</span>
                  </span>
                  <ArrowRight className="w-6 h-6 z-10 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </motion.a>
              </div>

              {/* Gaphic Right Side */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform translate-x-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Migration de vos Bases</h4>
                      <p className="text-sm text-white/60">Import complet de vos anciens systèmes</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform -translate-x-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">App Mobile Vendeur</h4>
                      <p className="text-sm text-white/60">Module scanner sur-mesure pour vos employés</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform translate-x-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Design Marque Blanche</h4>
                      <p className="text-sm text-white/60">Un CRM aux couleurs de votre Parfumerie</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
