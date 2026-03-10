import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Select option', required }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Hidden native input for form validation */}
      {required && <input type="text" required value={value} readOnly className="sr-only" tabIndex={-1} />}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all
          ${open
            ? 'bg-white/15 border-emerald-400 ring-1 ring-emerald-400/30'
            : 'bg-white/10 border-emerald-500/20 hover:bg-white/15'
          }`}
      >
        <span className={value ? 'text-white' : 'text-white/30'}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-emerald-400/70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-emerald-500/30 bg-[#052e1c] shadow-2xl overflow-hidden">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                ${value === opt
                  ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
            >
              {value === opt && <span className="mr-2 text-emerald-400">✓</span>}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
