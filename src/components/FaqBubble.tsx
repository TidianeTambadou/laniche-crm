"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ChevronDown, ChevronUp, Mail } from "lucide-react";

const FAQS = [
  {
    q: "Comment ajouter un parfum à mon stock ?",
    a: "Allez dans Inventaire et cliquez sur le bouton + en haut à droite. Vous pouvez aussi importer un fichier CSV ou coller une liste.",
  },
  {
    q: "Comment mettre un parfum en vente privée (braderie) ?",
    a: "Dans Inventaire, cliquez sur l'icône étiquette à côté d'un article. Sur la page Ventes, vous pouvez aussi glisser-déposer les articles ou les sélectionner depuis les onglets.",
  },
  {
    q: "Comment ajouter une photo à un parfum ?",
    a: "Lors de l'ajout ou de la modification d'un parfum, un champ photo apparaît en bas du formulaire. Vous pouvez uploader une image ou prendre une photo directement.",
  },
  {
    q: "Comment renseigner mes horaires d'ouverture ?",
    a: "Ouvrez votre profil (icône en haut à droite ou menu latéral), puis faites défiler jusqu'à la section Horaires d'ouverture.",
  },
  {
    q: "Comment activer le mode sombre ?",
    a: "Sur mobile, utilisez le bouton Thème dans la barre de navigation en bas. Sur desktop, il se trouve en bas du menu latéral gauche.",
  },
  {
    q: "Je veux demander une nouvelle fonctionnalité.",
    a: null,
  },
];

export default function FaqBubble() {
  const [open, setOpen]       = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92, y: 12  }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="fixed right-4 lg:right-6 z-[60] w-[calc(100vw-2rem)] max-w-sm bg-background border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
            style={{ bottom: "calc(5rem + env(safe-area-inset-bottom) + 3.5rem)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-foreground text-background">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-black">Aide & FAQ</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FAQ list */}
            <div className="max-h-[60dvh] overflow-y-auto divide-y divide-border">
              {FAQS.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-foreground leading-snug">{faq.q}</span>
                    {expanded === i
                      ? <ChevronUp   className="w-4 h-4 text-muted-foreground shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    }
                  </button>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{   height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3">
                          {faq.a ? (
                            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                          ) : (
                            <a
                              href="mailto:lanichedev@gmail.com"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-2"
                            >
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              lanichedev@gmail.com
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border bg-secondary/30">
              <p className="text-[11px] text-muted-foreground text-center">
                Autre question ?{" "}
                <a href="mailto:lanichedev@gmail.com" className="font-bold text-foreground underline underline-offset-2">
                  lanichedev@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.07 }}
        className="fixed right-4 lg:right-6 z-[59] w-12 h-12 rounded-full bg-foreground text-background shadow-xl shadow-black/25 flex items-center justify-center"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        aria-label="Aide"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-5 h-5" />
              </motion.span>
            : <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle className="w-5 h-5" />
              </motion.span>
          }
        </AnimatePresence>
      </motion.button>
    </>
  );
}
