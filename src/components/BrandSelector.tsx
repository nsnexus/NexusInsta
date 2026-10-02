import React, { useState, useRef, useEffect } from 'react';
import { useBrand } from '../context/BrandContext';
import { useInstagram } from '../context/InstagramContext';
import { ChevronDown, Plus, Check, ShieldCheck } from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';

export const BrandSelector: React.FC = () => {
  const { brands, activeBrand, setActiveBrandId } = useBrand();
  const { config, setActiveTab } = useInstagram();
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

  const getCleanLogo = (url?: string) => {
    if (!url || url.includes('unsplash') || url.includes('fbcdn.net') || url.includes('photo-15')) {
      return '/nsmusic-logo.png';
    }
    return url;
  };

  const displayHandle = activeBrand.handle || `@${config.username}` || '@_nsmusic';
  const displayName = activeBrand.name || config.accountName || 'NSMusic';
  const displayAvatar = getCleanLogo(config.avatarUrl || activeBrand.logoUrl);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-pink-500/50 hover:bg-slate-800/80 transition-all text-left shadow-sm group"
        title="Perfil do Instagram Conectado"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-pink-500/40 shrink-0 bg-slate-800">
          <img 
            src={displayAvatar} 
            alt={displayName} 
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/nsmusic-logo.png'; }}
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-slate-100 truncate max-w-[130px]">
              {displayHandle}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          </div>
          <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
            {displayName} • {config.followersCount || 817} seg.
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/90 z-50 py-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 flex items-center justify-between border-b border-slate-800/80 mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <div className="w-4 h-4 rounded-md bg-instagram-gradient flex items-center justify-center text-white">
                <InstagramIcon className="w-2.5 h-2.5" />
              </div>
              Perfis Reais do Instagram
            </span>
            <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Meta API v21
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-1">
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
                      ? 'bg-slate-800/90 text-white font-medium border border-pink-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={getCleanLogo(brand.logoUrl || config.avatarUrl)} 
                      alt={brand.name} 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/nsmusic-logo.png'; }}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500/40 shrink-0" 
                    />
                    <div className="truncate">
                      <p className="truncate text-xs font-bold text-slate-100 flex items-center gap-1">
                        {brand.handle}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {brand.name} • {config.followersCount || 817} seguidores
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-800/80 pt-2 mt-1 px-2.5">
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('config');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Conectar Outro Perfil do Instagram</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
