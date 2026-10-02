import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { 
  Layers, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { CarouselVisualEditor } from './CarouselVisualEditor';
import type { ContentObjective } from '../types/brand';

export const CarouselEngineView: React.FC = () => {
  const { 
    activeBrand, 
    activeBrandContents, 
    editingContentId, 
    setEditingContentId,
    createStructuredContent,
    deleteStructuredContent,
    creditBalance,
    deductCredits,
    setIsLedgerModalOpen
  } = useBrand();

  const [filterStatus, setFilterStatus] = useState<string>('all');

  // If currently editing a carousel, show the full visual editor
  if (editingContentId) {
    return (
      <CarouselVisualEditor
        contentId={editingContentId}
        onBack={() => setEditingContentId(null)}
      />
    );
  }

  const handleCreateEmptyCarousel = () => {
    if (creditBalance < 15) {
      setIsLedgerModalOpen(true);
      return;
    }
    deductCredits(15, `Criação de Novo Carrossel Studio (${activeBrand.name})`, 'ai_carousel');

    const newContent = createStructuredContent({
      brandId: activeBrand.id,
      title: `Novo Carrossel ${activeBrand.name}`,
      format: 'carousel',
      aspectRatio: '4:5',
      objective: 'vender' as ContentObjective,
      headline: `O Método Definitivo para ${activeBrand.niche}`,
      caption: `Descubra como a ${activeBrand.name} pode transformar seus resultados hoje mesmo!\n\n${activeBrand.defaultCta}\n\n#${activeBrand.slug} #conteudocomia`,
      cta: activeBrand.defaultCta,
      hashtags: [`#${activeBrand.slug}`, '#conteudocomia', '#socialmedia'],
      status: 'draft',
      slides: [
        {
          id: `slide_${Date.now()}_1`,
          slideNumber: 1,
          type: 'cover',
          headline: `Como dominar ${activeBrand.niche} em 2026`,
          subheadline: `O guia definitivo com a qualidade oficial da ${activeBrand.name}`,
          imageUrl: activeBrand.logoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080',
          layout: 'hero_center',
        },
        {
          id: `slide_${Date.now()}_2`,
          slideNumber: 2,
          type: 'retention',
          headline: 'O principal desafio da maioria',
          bodyText: 'Falta de processo claro e inconsistência visual impedem o crescimento orgânico.',
          layout: 'split_card',
        },
        {
          id: `slide_${Date.now()}_3`,
          slideNumber: 3,
          type: 'body_1',
          headline: '3 Passos para Aplicar Agora',
          bodyText: '1. Diagnóstico completo\n2. Padronização de Brand Kit\n3. Publicações semanais estratégicas',
          layout: 'checklist',
        },
        {
          id: `slide_${Date.now()}_4`,
          slideNumber: 4,
          type: 'summary_cta',
          headline: 'Pronto para elevar seu padrão?',
          ctaText: activeBrand.defaultCta,
          layout: 'cta_action',
        },
      ],
    });

    setEditingContentId(newContent.id);
  };

  const filteredContents = activeBrandContents.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Motor de Carrossel & Editor Visual
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  Estilo BestContent
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Templates com tokens de marca automáticos, exportação em PNG 4:5 e agendamento instantâneo
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateEmptyCarousel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Carrossel com IA (-15 cr)</span>
        </button>
      </div>

      {/* Filter and stats row */}
      <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Status:</span>
          {['all', 'draft', 'approved', 'scheduled', 'published'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium uppercase transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-800 text-pink-400 font-bold border border-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Mostrando {filteredContents.length} carrosséis de <strong className="text-white">{activeBrand.name}</strong>
        </span>
      </div>

      {/* Grid of Carousels */}
      {filteredContents.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <Layers className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">Nenhum carrossel encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Gere pautas na aba <strong>IA Editorial</strong> e converta em carrossel, ou clique no botão acima para criar um agora.
          </p>
          <button
            onClick={handleCreateEmptyCarousel}
            className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-500/20"
          >
            Criar Primeiro Carrossel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((item) => {
            const firstSlide = item.slides[0] || {};
            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/50 transition-all flex flex-col justify-between shadow-xl group cursor-pointer"
                onClick={() => setEditingContentId(item.id)}
              >
                <div>
                  {/* Slide Preview Miniature */}
                  <div 
                    className="w-full aspect-[4/5] rounded-2xl p-5 mb-4 relative overflow-hidden flex flex-col justify-between border shadow-inner group-hover:scale-[1.01] transition-transform duration-200"
                    style={{
                      backgroundColor: firstSlide.customBgColor || activeBrand.colors.background,
                      borderColor: activeBrand.colors.primary,
                      backgroundImage: firstSlide.imageUrl ? `linear-gradient(rgba(11, 15, 25, 0.75), rgba(11, 15, 25, 0.85)), url(${firstSlide.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold" style={{ color: activeBrand.colors.accent }}>
                        {activeBrand.handle}
                      </span>
                      <span 
                        className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                        style={{ backgroundColor: activeBrand.colors.primary, color: '#ffffff' }}
                      >
                        {item.slides.length} SLIDES
                      </span>
                    </div>

                    <div>
                      <h4 
                        className="text-base font-black leading-tight mb-2 line-clamp-3"
                        style={{ color: firstSlide.customTextColor || activeBrand.colors.text }}
                      >
                        {firstSlide.headline || item.headline}
                      </h4>
                      {firstSlide.subheadline && (
                        <p 
                          className="text-[10px] font-semibold opacity-90 line-clamp-2"
                          style={{ color: activeBrand.colors.accent }}
                        >
                          {firstSlide.subheadline}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/70 pt-2 border-t border-white/10">
                      <span>{item.format.toUpperCase()} 4:5</span>
                      <span className="font-semibold text-pink-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Editar no Studio →
                      </span>
                    </div>
                  </div>

                  {/* Title and metadata */}
                  <h3 className="text-sm font-bold text-white mb-1 truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {item.caption}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Versão {item.version || 1} • {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStructuredContent(item.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
