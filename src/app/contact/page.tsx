"use client";

import React, { useState } from "react";
import { Send, ArrowLeft, Lightbulb, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    boutique: "",
    idea: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Nouvelle Idée CRM - ${formData.boutique} (${formData.name})`);
    const body = encodeURIComponent(`Bonjour l'équipe,\n\nVoici notre idée de fonctionnalité pour le CRM La Niche:\n\n${formData.idea}\n\nCordialement,\n${formData.name} - ${formData.boutique}`);
    
    window.location.href = `mailto:tamba.tidiane22@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="w-full min-h-screen bg-background/50 flex flex-col relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="h-20 px-8 flex items-center border-b border-border bg-white/80 backdrop-blur-md flex-shrink-0 sticky top-0 z-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-8 relative z-10 w-full">
        <div className="bg-white rounded-3xl border border-border shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side: Copy */}
          <div className="w-full md:w-5/12 bg-primary p-12 text-primary-foreground flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20" />
            
            <Lightbulb className="w-10 h-10 text-accent mb-6 relative z-10" />
            <h2 className="text-3xl font-bold mb-4 relative z-10">
              Parlons de votre futur outil sur-mesure.
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed mb-8 relative z-10">
              Un besoin spécifique ? Un tableau de bord inédit ? Une idée farfelue liée à l'IA ? <strong className="text-white">Toute feature en plus, TOUT est possible.</strong> Décrivez votre idée, notre équipe technique s'occupe de lui donner vie.
            </p>
            
            <div className="mt-auto pt-8 border-t border-white/10 relative z-10">
              <p className="text-sm text-primary-foreground/60">Contacter directement la technique :</p>
              <a href="mailto:tamba.tidiane22@gmail.com" className="text-accent font-medium hover:underline text-lg mt-1 inline-block">
                tamba.tidiane22@gmail.com
              </a>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-7/12 p-12 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary" htmlFor="name">Votre Nom</label>
                <input 
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary" htmlFor="boutique">Nom de la Boutique</label>
                <input 
                  id="boutique"
                  required
                  value={formData.boutique}
                  onChange={(e) => setFormData({...formData, boutique: e.target.value})}
                  type="text" 
                  placeholder="Boutique Paris 1er"
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary" htmlFor="idea">Votre Super Idée (Feature)</label>
                <textarea 
                  id="idea"
                  required
                  value={formData.idea}
                  onChange={(e) => setFormData({...formData, idea: e.target.value})}
                  placeholder="Décrivez ici la fonctionnalité que vous aimeriez avoir dans le CRM, par exemple : 'J'aimerais une automatisation qui m'envoie un SMS quand le stock de Baccarat Rouge est vide'..."
                  rows={6}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold text-lg px-8 py-4 rounded-xl hover:bg-primary/90 hover:scale-[1.02] transform transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
              >
                <Send className="w-5 h-5" />
                Envoyer ma demande
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
