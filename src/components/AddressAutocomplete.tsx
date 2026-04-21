"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

export interface AddressResult {
  line: string;
  postalCode: string;
  city: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  inputClassName?: string;
}

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder, inputClassName }: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);
  const debounce                      = useRef<ReturnType<typeof setTimeout>>();
  const wrapper                       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const fetch_ = (q: string) => {
    clearTimeout(debounce.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Essaie d'abord housenumber pour avoir rue + numéro, puis fallback street
        const r = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=6`,
          { headers: { "Accept": "application/json" } }
        );
        const data = await r.json();
        const feats = data.features ?? [];
        setSuggestions(feats);
        setOpen(feats.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const pick = (f: any) => {
    const p = f.properties;
    const line = [p.housenumber, p.street ?? p.thoroughfare ?? p.name].filter(Boolean).join(" ").trim() || p.label;
    onSelect({ line, postalCode: p.postcode ?? "", city: p.city ?? "", lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] });
    onChange(line);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapper} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        {loading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        <input
          type="text"
          value={value}
          autoComplete="off"
          onChange={e => { onChange(e.target.value); fetch_(e.target.value); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "30 Rue Henri Barbusse"}
          className={inputClassName}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1.5 bg-white border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
          {suggestions.map((f, i) => (
            <button key={i} type="button" onMouseDown={e => { e.preventDefault(); pick(f); }}
              className="w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors flex items-start gap-3 border-b border-border/50 last:border-0">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {f.properties.housenumber ? `${f.properties.housenumber} ` : ""}{f.properties.street ?? f.properties.name ?? f.properties.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{f.properties.postcode} {f.properties.city}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
