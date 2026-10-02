import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { useInstagram } from '../context/InstagramContext';
import { 
  Download, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Trash2, 
  Image as ImageIcon, 
  Type, 
  ArrowLeft,
  Flame,
  CheckCircle2
} from 'lucide-react';
import type { CarouselSlide } from '../types/brand';

interface CarouselVisualEditorProps {
  contentId: string;
  onBack: () => void;
}

export const CarouselVisualEditor: React.FC<CarouselVisualEditorProps> = ({ contentId, onBack }) => {
  const { 
    structuredContents, 
    updateStructuredContent, 
    updateSlide, 
    duplicateSlide, 
    removeSlide, 
    activeBrand
  } = useBrand();

  const { schedulePost, addToast, setActiveTab } = useInstagram();

  const content = structuredContents.find((c) => c.id === contentId);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1'>('4:5');
  const [isExporting, setIsExporting] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  if (!content) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>Conteúdo não encontrado.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-white">Voltar</button>
      </div>
    );
  }

  const activeSlide = content.slides[activeSlideIndex] || content.slides[0];
  const totalSlides = content.slides.length;

  // Real canvas drawer to export crisp high-res 1080x1350 or 1080x1080 PNG
  const renderSlideToCanvas = (slide: CarouselSlide, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      const bg = slide.customBgColor || activeBrand.colors.background || '#0B0F19';
      const text = slide.customTextColor || activeBrand.colors.text || '#F8FAFC';
      const primary = activeBrand.colors.primary || '#EC4899';
      const secondary = activeBrand.colors.secondary || '#8B5CF6';
      const accent = slide.customAccentColor || activeBrand.colors.accent || '#06B6D4';

      // Draw background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Subtle gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
      gradient.addColorStop(0, `${primary}22`);
      gradient.addColorStop(1, `${secondary}11`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Header Bar: Brand Handle & Badge
      ctx.fillStyle = text;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(activeBrand.handle, 80, 100);

      // Slide Badge (01 / 05)
      const badgeText = `${String(slide.slideNumber).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.roundRect(targetWidth - 220, 60, 140, 50, 25);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, targetWidth - 150, 94);
      ctx.textAlign = 'left';

      // Progress Line
      const progressWidth = ((slide.slideNumber) / totalSlides) * (targetWidth - 160);
      ctx.fillStyle = `${primary}44`;
      ctx.fillRect(80, 140, targetWidth - 160, 6);
      ctx.fillStyle = primary;
      ctx.fillRect(80, 140, progressWidth, 6);

      // Function to finish text rendering
      const drawTexts = () => {
        // Headline
        ctx.fillStyle = text;
        ctx.font = '900 64px sans-serif';
        const words = slide.headline.split(' ');
        let line = '';
        let y = targetHeight * 0.38;
        const maxWidth = targetWidth - 160;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 80, y);
            line = words[n] + ' ';
            y += 80;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 80, y);

        // Subheadline
        if (slide.subheadline) {
          y += 50;
          ctx.fillStyle = accent;
          ctx.font = '600 38px sans-serif';
          ctx.fillText(slide.subheadline.slice(0, 120), 80, y);
        }

        // Body Text
        if (slide.bodyText) {
          y += 70;
          ctx.fillStyle = text;
          ctx.font = 'normal 34px sans-serif';
          const bodyLines = slide.bodyText.split('\n');
          for (const bLine of bodyLines) {
            ctx.fillText(bLine.slice(0, 80), 80, y);
            y += 55;
          }
        }

        // CTA Button
        if (slide.ctaText || slide.type === 'summary_cta') {
          const ctaBtnText = slide.ctaText || activeBrand.defaultCta;
          const btnY = targetHeight - 180;
          ctx.fillStyle = primary;
          ctx.beginPath();
          ctx.roundRect(80, btnY, targetWidth - 160, 90, 45);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(ctaBtnText, targetWidth / 2, btnY + 58);
          ctx.textAlign = 'left';
        }

        resolve(canvas.toDataURL('image/png'));
      };

      // If background image exists, load and draw with overlay
      if (slide.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          ctx.restore();
          drawTexts();
        };
        img.onerror = () => {
          drawTexts();
        };
        img.src = slide.imageUrl;
      } else {
        drawTexts();
      }
    });
  };

  // Download Current Slide as PNG
  const handleDownloadSingle = async () => {
    setIsExporting(true);
    try {
      const w = 1080;
      const h = aspectRatio === '4:5' ? 1350 : 1080;
      const dataUrl = await renderSlideToCanvas(activeSlide, w, h);
      const link = document.createElement('a');
      link.download = `${activeBrand.slug}_slide_${activeSlide.slideNumber}.png`;
      link.href = dataUrl;
      link.click();
      addToast(`Slide ${activeSlide.slideNumber} baixado com sucesso!`, 'success');
    } finally {
      setIsExporting(false);
    }
  };

  // Download All Slides
  const handleDownloadAll = async () => {
    setIsExporting(true);
    try {
      const w = 1080;
      const h = aspectRatio === '4:5' ? 1350 : 1080;
      for (const s of content.slides) {
        const dataUrl = await renderSlideToCanvas(s, w, h);
        const link = document.createElement('a');
        link.download = `${activeBrand.slug}_slide_${s.slideNumber}.png`;
        link.href = dataUrl;
        link.click();
        // small timeout to not choke browser downloads
        await new Promise((r) => setTimeout(r, 400));
      }
      addToast(`Todos os ${totalSlides} slides baixados em alta resolução!`, 'success');
    } finally {
      setIsExporting(false);
    }
  };

  // Schedule Post Directly in the Platform Queue
  const handleSendToSchedule = async () => {
    setIsExporting(true);
    try {
      const w = 1080;
      const h = aspectRatio === '4:5' ? 1350 : 1080;
      const coverDataUrl = await renderSlideToCanvas(content.slides[0], w, h);

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      scheduledDate.setHours(18, 0, 0, 0);

      schedulePost({
        mediaUrl: coverDataUrl || content.slides[0].imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080',
        caption: content.caption,
        firstComment: `👉 ${activeBrand.defaultCta}`,
        type: 'feed',
        aspectRatio: aspectRatio,
        scheduledAt: scheduledDate.toISOString(),
        generatedByAi: true,
      });

      setScheduledSuccess(true);
      addToast(`Carrossel agendado na fila da Meta Graph API para amanhã às 18:00!`, 'success');
      setTimeout(() => setScheduledSuccess(false), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                BestContent Studio
              </span>
              <span className="text-xs text-slate-400 font-medium">Marca: {activeBrand.name}</span>
            </div>
            <h1 className="text-xl font-black text-white truncate max-w-xl">
              {content.headline}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setAspectRatio('4:5')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                aspectRatio === '4:5'
                  ? 'bg-slate-800 text-pink-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4:5 (1080×1350)
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                aspectRatio === '1:1'
                  ? 'bg-slate-800 text-pink-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1 (1080×1080)
            </button>
          </div>

          <button
            onClick={handleDownloadSingle}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Slide Atual</span>
          </button>

          <button
            onClick={handleDownloadAll}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-pink-400" />
            <span>Baixar Todos ({totalSlides} PNGs)</span>
          </button>

          <button
            onClick={handleSendToSchedule}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/25 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Agendar na Fila</span>
          </button>
        </div>
      </div>

      {scheduledSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Carrossel adicionado com sucesso à fila de agendamento da Meta API!</span>
          </div>
          <button
            onClick={() => setActiveTab('queue')}
            className="underline font-bold hover:text-emerald-300"
          >
            Ver na Fila →
          </button>
        </div>
      )}

      {/* Slide Thumbnails Navigation Bar */}
      <div className="mb-6 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          {content.slides.map((s, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`relative px-3 py-2 rounded-xl text-left border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 border-pink-500 text-white shadow-md shadow-pink-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {s.slideNumber}
                  </span>
                  <span className="text-xs font-bold truncate max-w-[100px]">
                    {s.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => duplicateSlide(content.id, activeSlide.id)}
            title="Duplicar slide"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {totalSlides > 1 && (
            <button
              onClick={() => {
                removeSlide(content.id, activeSlide.id);
                if (activeSlideIndex >= totalSlides - 1) {
                  setActiveSlideIndex(Math.max(0, totalSlides - 2));
                }
              }}
              title="Excluir slide"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Area: Canvas Live Preview (Left) + Property Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 Cols): Real-time Slide Viewport */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          <div 
            className={`w-full max-w-[380px] rounded-3xl p-6 relative overflow-hidden shadow-2xl border transition-all duration-300 flex flex-col justify-between ${
              aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'
            }`}
            style={{
              backgroundColor: activeSlide.customBgColor || activeBrand.colors.background,
              borderColor: activeBrand.colors.primary,
              backgroundImage: activeSlide.imageUrl ? `linear-gradient(rgba(11, 15, 25, 0.82), rgba(11, 15, 25, 0.88)), url(${activeSlide.imageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top Bar on slide */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow"
                    style={{ backgroundColor: activeBrand.colors.primary }}
                  >
                    {activeBrand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span 
                    className="text-xs font-bold tracking-tight"
                    style={{ color: activeSlide.customAccentColor || activeBrand.colors.accent }}
                  >
                    {activeBrand.handle}
                  </span>
                </div>

                <div 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: activeBrand.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  {String(activeSlide.slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mb-6">
                <div 
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(activeSlide.slideNumber / totalSlides) * 100}%`,
                    backgroundColor: activeBrand.colors.primary,
                  }}
                />
              </div>

              {/* Slide Headline */}
              <h2 
                className="text-xl sm:text-2xl font-black leading-tight mb-3"
                style={{ color: activeSlide.customTextColor || activeBrand.colors.text }}
              >
                {activeSlide.headline}
              </h2>

              {/* Subheadline */}
              {activeSlide.subheadline && (
                <p 
                  className="text-xs sm:text-sm font-semibold opacity-90 mb-4"
                  style={{ color: activeSlide.customAccentColor || activeBrand.colors.accent }}
                >
                  {activeSlide.subheadline}
                </p>
              )}

              {/* Body Text / Checklist */}
              {activeSlide.bodyText && (
                <div 
                  className="text-xs opacity-85 leading-relaxed space-y-1.5 whitespace-pre-line"
                  style={{ color: activeSlide.customTextColor || activeBrand.colors.text }}
                >
                  {activeSlide.bodyText}
                </div>
              )}
            </div>

            {/* Bottom CTA on Slide */}
            <div className="mt-4 pt-4">
              {(activeSlide.ctaText || activeSlide.type === 'summary_cta') && (
                <button
                  type="button"
                  className="w-full py-3 rounded-2xl text-xs font-black shadow-lg shadow-pink-500/25 transition-transform"
                  style={{
                    backgroundColor: activeBrand.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  {activeSlide.ctaText || activeBrand.defaultCta}
                </button>
              )}
            </div>
          </div>

          {/* Slide Navigator Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
              disabled={activeSlideIndex === 0}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Slide {activeSlideIndex + 1} de {totalSlides}
            </span>
            <button
              onClick={() => setActiveSlideIndex((i) => Math.min(totalSlides - 1, i + 1))}
              disabled={activeSlideIndex === totalSlides - 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Slide Properties Editor */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Text Properties */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-pink-400" />
              Conteúdo do Slide {activeSlide.slideNumber} ({activeSlide.type.toUpperCase()})
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Headline Principal (Título de Impacto)
              </label>
              <input
                type="text"
                value={activeSlide.headline}
                onChange={(e) => updateSlide(content.id, activeSlide.id, { headline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Subtítulo / Linha de Apoio
              </label>
              <input
                type="text"
                value={activeSlide.subheadline || ''}
                onChange={(e) => updateSlide(content.id, activeSlide.id, { subheadline: e.target.value })}
                placeholder="Ex: Como aplicar este método passo a passo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Corpo do Texto / Checklist
              </label>
              <textarea
                rows={4}
                value={activeSlide.bodyText || ''}
                onChange={(e) => updateSlide(content.id, activeSlide.id, { bodyText: e.target.value })}
                placeholder="Insira os tópicos ou explicação do slide..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            {(activeSlide.type === 'summary_cta' || activeSlide.ctaText) && (
              <div>
                <label className="block text-xs font-semibold text-pink-400 mb-1">
                  Texto do Botão / Chamada para Ação
                </label>
                <input
                  type="text"
                  value={activeSlide.ctaText || activeBrand.defaultCta}
                  onChange={(e) => updateSlide(content.id, activeSlide.id, { ctaText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-pink-500/40 text-white text-xs font-bold focus:outline-none focus:border-pink-500"
                />
              </div>
            )}
          </div>

          {/* Card: Media & Image Selection */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              Mídia de Fundo do Slide
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                URL da Imagem
              </label>
              <input
                type="url"
                value={activeSlide.imageUrl || ''}
                onChange={(e) => updateSlide(content.id, activeSlide.id, { imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Banco Rápido:</span>
              {[
                { title: 'Estúdio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1080' },
                { title: 'Tecnologia', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080' },
                { title: 'Foco', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1080' },
                { title: 'Construção', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=1080' },
              ].map((img) => (
                <button
                  key={img.title}
                  type="button"
                  onClick={() => updateSlide(content.id, activeSlide.id, { imageUrl: img.url })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white"
                >
                  {img.title}
                </button>
              ))}
            </div>
          </div>

          {/* Card: Caption & Copy for Meta API */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Legenda Oficial para Publicação
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {content.caption.length} caracteres
              </span>
            </h3>

            <textarea
              rows={4}
              value={content.caption}
              onChange={(e) => updateStructuredContent(content.id, { caption: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-pink-500"
            />

            {/* A/B Variations Hook */}
            {content.abVariations?.hooks && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Variações A/B de Gancho (IA):
                </span>
                <div className="space-y-1">
                  {content.abVariations.hooks.map((hook, hIdx) => (
                    <button
                      key={hIdx}
                      type="button"
                      onClick={() => updateSlide(content.id, content.slides[0].id, { headline: hook })}
                      className="w-full text-left text-[11px] p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800/80"
                    >
                      " {hook} "
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
