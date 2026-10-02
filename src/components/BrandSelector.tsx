import React, { useState, useRef, useEffect } from 'react';
import { useBrand } from '../context/BrandContext';
import { ChevronDown, Plus, Check, Sparkles, Building2 } from 'lucide-react';

export const BrandSelector: React.FC = () => {
  const { brands, activeBrand, setActiveBrandId, setIsBrandModalOpen } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-pink-500/50 hover:bg-slate-800/80 transition-all text-left shadow-sm group"
        title="Alternar Marca Ativa"
      >
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-inner relative overflow-hidden shrink-0"
          style={{ backgroundColor: activeBrand.colors.primary }}
        >
          {activeBrand.logoUrl ? (
            <img src={activeBrand.logoUrl} alt={activeBrand.name} className="w-full h-full object-cover" />
          ) : (
            activeBrand.name.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-100 truncate max-w-[120px]">
              {activeBrand.name}
            </span>
            <span 
              className="w-1.5 h-1.5 rounded-full shrink-0" 
              style={{ backgroundColor: activeBrand.colors.accent }}
            />
          </div>
          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
            {activeBrand.handle}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 z-50 py-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400 flex items-center justify-between border-b border-slate-800/80 mb-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-pink-400" />
              Marcas da Organização
            </span>
            <span className="text-slate-400 font-mono text-[9px]">SaaS v1.0</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {brands.map((brand) => {
              const isSelected = brand.id === activeBrand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => {
                    setActiveBrandId(brand.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors rounded-xl mx-auto max-w-[95%] ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden"
                      style={{ backgroundColor: brand.colors.primary }}
                    >
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
                      ) : (
                        brand.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <p className="truncate text-xs font-semibold text-slate-200">{brand.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{brand.niche}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-800/80 pt-1 mt-1 px-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsBrandModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Nova Marca</span>
              <Sparkles className="w-3 h-3 ml-auto text-pink-400 animate-pulse" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
