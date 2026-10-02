import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Target, 
  Filter, 
  Check
} from 'lucide-react';
import type { ContentObjective, ContentIdea } from '../types/brand';

interface EditorialPlannerViewProps {
  onOpenCarouselEditor?: (contentId: string) => void;
}

export const EditorialPlannerView: React.FC<EditorialPlannerViewProps> = ({ onOpenCarouselEditor }) => {
  const { 
    activeBrand, 
    activeBrandIdeas, 
    generateIdeasForActiveBrand, 
    regenerateIdea, 
    generateCarouselFromIdea,
    creditBalance,
    setIsLedgerModalOpen,
    setEditingContentId
  } = useBrand();

  const [selectedObjective, setSelectedObjective] = useState<ContentObjective>('vender');
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState<string>('all');

  const handleGenerateIdeas = async () => {
    if (creditBalance < 2) {
      setIsLedgerModalOpen(true);
      return;
    }
    setIsGenerating(true);
    try {
      await generateIdeasForActiveBrand(selectedObjective, 3);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSingle = async (ideaId: string) => {
    if (creditBalance < 1) {
      setIsLedgerModalOpen(true);
      return;
    }
    setRegeneratingId(ideaId);
    try {
      await regenerateIdea(ideaId);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleConvertIdeaToCarousel = async (idea: ContentIdea) => {
    if (creditBalance < 15) {
      setIsLedgerModalOpen(true);
      return;
    }
    setConvertingId(idea.id);
    try {
      const structured = await generateCarouselFromIdea(idea);
      if (onOpenCarouselEditor) {
        onOpenCarouselEditor(structured.id);
      } else {
        setEditingContentId(structured.id);
      }
    } finally {
      setConvertingId(null);
    }
  };

  const filteredIdeas = activeBrandIdeas.filter((idea) => {
    if (filterFormat !== 'all' && idea.format !== filterFormat) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold"
              style={{ backgroundColor: activeBrand.colors.primary }}
            >
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                IA Editorial & Calendário de Pautas
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {activeBrand.name}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Geração de ganchos virais e calendário respeitando o Brand Kit e tom de voz
              </p>
            </div>
          </div>
        </div>

        {/* Generate Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {(['vender', 'educar', 'autoridade', 'engajamento'] as ContentObjective[]).map((obj) => (
              <button
                key={obj}
                onClick={() => setSelectedObjective(obj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  selectedObjective === obj
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {obj}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateIdeas}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isGenerating ? 'Gerando Pautas...' : 'Gerar 3 Novas Pautas (-2 cr)'}</span>
          </button>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-300">Filtrar Formato:</span>
          {['all', 'carousel', 'reel', 'feed'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFilterFormat(fmt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors cursor-pointer ${
                filterFormat === fmt
                  ? 'bg-slate-800 text-pink-400 font-bold border border-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {fmt === 'all' ? 'Todos' : fmt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {filteredIdeas.length} Pautas cadastradas
          </span>
          <span>•</span>
          <span className="font-mono text-amber-400">Saldo: {creditBalance} créditos</span>
        </div>
      </div>

      {/* Grid of Content Ideas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => {
          const isConverting = convertingId === idea.id;
          const isRegenerating = regeneratingId === idea.id;
          const isAlreadyGenerated = !!idea.structuredContentId;

          return (
            <div
              key={idea.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group"
            >
              {/* Top Meta info */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Target className="w-3 h-3 text-pink-400" />
                    {idea.objective}
                  </span>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    idea.format === 'carousel' 
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' 
                      : idea.format === 'reel'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {idea.format.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-pink-300 transition-colors">
                  {idea.title}
                </h3>

                {/* Hook Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1 mb-1">
                    <Flame className="w-3 h-3 text-pink-500" />
                    Gancho Viral (Hook de Retenção)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{idea.hook}"
                  </p>
                </div>

                {idea.campaign && (
                  <p className="text-[11px] text-slate-500 mb-2">
                    Campanha: <span className="text-slate-400 font-medium">{idea.campaign}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleRegenerateSingle(idea.id)}
                  disabled={isRegenerating}
                  title="Regenerar apenas esta pauta sem afetar o resto (-1 cr)"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-pink-400' : ''}`} />
                </button>

                <div className="flex items-center gap-2">
                  {isAlreadyGenerated ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenCarouselEditor && idea.structuredContentId) {
                          onOpenCarouselEditor(idea.structuredContentId);
                        } else if (idea.structuredContentId) {
                          setEditingContentId(idea.structuredContentId);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Abrir no Editor</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConvertIdeaToCarousel(idea)}
                      disabled={isConverting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
                      <span>{isConverting ? 'Montando...' : 'Gerar Carrossel (-15 cr)'}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
