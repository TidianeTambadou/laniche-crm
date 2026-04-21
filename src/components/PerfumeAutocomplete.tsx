"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export interface PerfumeOption {
  name: string;
  brand: string;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (option: PerfumeOption) => void;
  existingPerfumes: Array<{ perfume_name: string; brand: string }>;
  placeholder?: string;
  inputClassName?: string;
}

export default function PerfumeAutocomplete({
  value, onChange, onSelect, existingPerfumes, placeholder, inputClassName,
}: Props) {
  const [suggestions, setSuggestions] = useState<PerfumeOption[]>([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const updateSuggestions = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounce.current = setTimeout(() => {
      const query = q.toLowerCase();
      const filtered = existingPerfumes
        .filter(p =>
          p.perfume_name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
        )
        .map(p => ({ name: p.perfume_name, brand: p.brand }));
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    }, 180);
  };

  const pick = (opt: PerfumeOption) => {
    onSelect(opt);
    onChange(opt.name);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapper} className="relative">
      <div className="relative">
        <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <input
          type="text"
          value={value}
          autoComplete="off"
          onChange={e => { onChange(e.target.value); updateSuggestions(e.target.value); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "Oud tempête"}
          className={inputClassName}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1.5 bg-white border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
          {suggestions.map((opt, i) => (
            <button key={i} type="button" onMouseDown={e => { e.preventDefault(); pick(opt); }}
              className="w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors flex items-start gap-3 border-b border-border/50 last:border-0">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {opt.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{opt.brand}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
