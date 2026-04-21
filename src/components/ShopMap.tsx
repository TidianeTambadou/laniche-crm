"use client";

import { useState, useEffect } from "react";
import { MapPin, WifiOff } from "lucide-react";

interface Props {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
  height?: number;
}

export default function ShopMap({ lat, lng, label, className = "", height = 200 }: Props) {
  const [online, setOnline] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (!lat || !lng) return null;

  const d    = 0.004;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src  = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className={`rounded-2xl overflow-hidden border border-border relative bg-secondary/40 ${className}`}
      style={{ height }}>

      {/* Fallback offline */}
      {!online && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <WifiOff className="w-6 h-6 opacity-40" />
          <p className="text-xs font-medium opacity-60">Carte indisponible hors connexion</p>
          {label && <p className="text-xs font-bold text-foreground/70">{label}</p>}
        </div>
      )}

      {/* Skeleton pendant le chargement */}
      {online && !loaded && (
        <div className="absolute inset-0 bg-secondary/60 animate-pulse" />
      )}

      {/* Iframe OSM */}
      {online && (
        <iframe
          src={src}
          width="100%"
          height={height}
          style={{ border: 0, display: "block" }}
          loading="lazy"
          title={label ?? "Localisation boutique"}
          onLoad={() => setLoaded(true)}
        />
      )}

      {/* Label + lien externe */}
      {label && loaded && online && (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-3 py-2 flex items-center gap-1.5 hover:from-black/80 transition-all">
          <MapPin className="w-3 h-3 text-white shrink-0" />
          <p className="text-white text-xs font-bold truncate">{label}</p>
        </a>
      )}
    </div>
  );
}
