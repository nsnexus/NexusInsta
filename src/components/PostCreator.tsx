import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { InstagramPhonePreview } from './InstagramPhonePreview';
import { SAMPLE_IMAGES, HASHTAG_GROUPS } from '../data/mockData';
import type { AspectRatio, PostType } from '../types/instagram';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  Hash, 
  MessageSquarePlus, 
  Check, 
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export const PostCreator = () => {
  const { schedulePost, config } = useInstagram();

  // Form State
  const [mediaUrl, setMediaUrl] = useState<string>(SAMPLE_IMAGES[0].url);
  const [caption, setCaption] = useState<string>(
    '🚀 Transforme a presença digital da sua marca com automação inteligente no Instagram!\n\nConteúdos consistentes e no horário de maior engajamento trazem até 3x mais conversões.\n\n#marketingdigital #socialmedia #automacao #inovacao'
  );
  const [firstComment, setFirstComment] = useState<string>('👉 Clique no link da bio para conferir a demonstração!');
  const [enableFirstComment, setEnableFirstComment] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [postType, setPostType] = useState<PostType>('feed');

  const getDefaultDateTime = () => {
    const d = new Date(Date.now() + 1000 * 60 * 60);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().slice(0, 5);
    return { dateStr, timeStr };
  };

  const defaultDT = getDefaultDateTime();
  const [scheduleDate, setScheduleDate] = useState<string>(defaultDT.dateStr);
  const [scheduleTime, setScheduleTime] = useState<string>(defaultDT.timeStr);
  const [isImmediate, setIsImmediate] = useState<boolean>(false);

  const charCount = caption.length;
  const hashtagMatches = caption.match(/#[a-zA-Z0-9_À-ÿ]+/g);
  const hashtagCount = hashtagMatches ? hashtagMatches.length : 0;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setCaption((prev) => prev + ' ' + emoji);
  };

  const handleAddHashtagGroup = (tags: string[]) => {
    const newTagsString = tags.join(' ');
    setCaption((prev) => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n\n') + newTagsString);
  };

  const setQuickTime = (hoursOffset: number, fixedHour?: number) => {
    const target = new Date();
    if (fixedHour !== undefined) {
      target.setHours(fixedHour, 0, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
    } else {
      target.setTime(target.getTime() + hoursOffset * 60 * 60 * 1000);
    }

    setScheduleDate(target.toISOString().split('T')[0]);
    setScheduleTime(target.toTimeString().slice(0, 5));
    setIsImmediate(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) return;

    let targetIso: string;
    if (isImmediate) {
      targetIso = new Date().toISOString();
    } else {
      const combined = new Date(`${scheduleDate}T${scheduleTime}:00`);
      targetIso = combined.toISOString();
    }

    schedulePost({
      mediaUrl,
      caption,
      firstComment: enableFirstComment ? firstComment : undefined,
      type: postType,
      aspectRatio,
      scheduledAt: targetIso,
    });
  };

  const formattedScheduledPreview = isImmediate
    ? 'Imediato'
    : `${scheduleDate.split('-').reverse().join('/')} às ${scheduleTime}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Heading */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Estúdio de Criação & Agendamento
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
              Meta Graph API
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Crie, formate e programe publicações automáticas com pré-visualização real no feed do Instagram.
          </p>
        </div>

        {/* Quota Indicator */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs">
            {50 - config.dailyQuotaUsed}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Posts restantes hoje</p>
            <p className="text-[11px] text-slate-400">Limite de 50 posts/24h da Meta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Mídia & Imagens */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  1. Mídia da Publicação (Foto / Vídeo)
                </label>
                <span className="text-xs text-slate-400">Requer URL HTTPS pública para a Meta</span>
              </div>

              {/* Upload Drop Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-pink-500 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all text-center group">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-pink-400 transition-colors mb-2" />
                  <span className="text-xs font-semibold text-slate-200">Carregar do Computador</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG ou MP4 (até 8MB)</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Direct URL Input */}
                <div className="flex flex-col justify-center p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-pink-400" />
                    Ou informe a URL direta:
                  </span>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://meu-storage.com/foto.jpg"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              {/* Sample Preset Gallery */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Galeria de Mídias de Demonstração (Clique para testar):
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SAMPLE_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMediaUrl(img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        mediaUrl === img.url
                          ? 'border-pink-500 scale-95 shadow-md shadow-pink-500/30'
                          : 'border-transparent hover:border-slate-600 opacity-75 hover:opacity-100'
                      }`}
                      title={img.title}
                    >
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                      {mediaUrl === img.url && (
                        <div className="absolute inset-0 bg-pink-500/25 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Formato & Proporção */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-400" />
                2. Formato & Proporção de Tela
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('4:5');
                    setPostType('feed');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    aspectRatio === '4:5' && postType === 'feed'
                      ? 'border-pink-500 bg-pink-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold">Retrato (4:5)</span>
                  <span className="text-[10px] text-pink-400 font-medium">Recomendado Feed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('1:1');
                    setPostType('feed');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    aspectRatio === '1:1' && postType === 'feed'
                      ? 'border-pink-500 bg-pink-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold">Quadrado (1:1)</span>
                  <span className="text-[10px] text-slate-500">Clássico</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('9:16');
                    setPostType('reel');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    aspectRatio === '9:16' && postType === 'reel'
                      ? 'border-pink-500 bg-pink-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold">Reels (9:16)</span>
                  <span className="text-[10px] text-slate-500">Vídeo Vertical</span>
                </button>
              </div>
            </div>

            {/* 3. Legenda & Hashtags */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-pink-400" />
                  3. Legenda do Post
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`${charCount > 2200 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {charCount}/2.200 caracteres
                  </span>
                  <span className={`${hashtagCount > 30 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {hashtagCount}/30 hashtags
                  </span>
                </div>
              </div>

              <textarea
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva sua legenda envolvente aqui... Inclua quebras de linha e hashtags."
                className="w-full text-sm px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors leading-relaxed"
              />

              {/* Emoji Quick Picker */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                <span className="text-xs text-slate-500 mr-1 shrink-0">Emojis:</span>
                {['🔥', '🚀', '💡', '✨', '📈', '🎯', '👏', '💬', '📍', '📸', '🙌', '💎'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm hover:scale-110 active:scale-95 transition-all shrink-0"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Hashtag Packs */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <span className="text-xs font-semibold text-slate-400 block">
                  Inserir Pacote de Hashtags Estratégicas (1 clique):
                </span>
                <div className="flex flex-wrap gap-2">
                  {HASHTAG_GROUPS.map((group, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddHashtagGroup(group.tags)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/80 text-slate-300 transition-colors"
                    >
                      + {group.category}
                    </button>
                  ))}
                </div>
              </div>

              {/* First Comment Option */}
              <div className="pt-3 border-t border-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableFirstComment}
                      onChange={(e) => setEnableFirstComment(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-500 bg-slate-900 border-slate-700 focus:ring-pink-500 focus:ring-offset-0"
                    />
                    <MessageSquarePlus className="w-4 h-4 text-pink-400" />
                    <span>Publicar Primeiro Comentário Automático</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Excelente para hashtags ou link na bio</span>
                </div>

                {enableFirstComment && (
                  <input
                    type="text"
                    value={firstComment}
                    onChange={(e) => setFirstComment(e.target.value)}
                    placeholder="Ex: Deixe um comentário ou acesse nosso site na bio!"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                )}
              </div>
            </div>

            {/* 4. Agendamento de Data e Hora */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-pink-400" />
                  4. Horário de Disparo da Automação
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImmediate(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      !isImmediate ? 'bg-pink-500 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Agendar Futuro
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImmediate(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isImmediate ? 'bg-pink-500 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Publicar Agora
                  </button>
                </div>
              </div>

              {!isImmediate ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Data:</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Horário:</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  {/* Quick Time Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">Atalhos de horário:</span>
                    <button
                      type="button"
                      onClick={() => setQuickTime(0.5)}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      Em 30 min
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime(2)}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      Em 2 horas
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime(0, 18)}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      Pico 18:00
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime(0, 21)}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      Pico 21:00
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-pink-400" />
                  <span>
                    A publicação entrará imediatamente na esteira da Meta Graph API (criação do container e disparo em ~4 segundos).
                  </span>
                </div>
              )}
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={!mediaUrl || !caption}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
                !mediaUrl || !caption
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-instagram-gradient text-white hover:opacity-95 shadow-pink-500/20 active:scale-[0.99] cursor-pointer'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {isImmediate ? 'Disparar Publicação Agora' : 'Confirmar e Agendar Automação'}
              </span>
            </button>

          </form>
        </div>

        {/* Right Column: Live Mobile Preview (5 Cols Sticky) */}
        <div className="lg:col-span-5 sticky top-24">
          <InstagramPhonePreview
            mediaUrl={mediaUrl}
            caption={caption}
            firstComment={enableFirstComment ? firstComment : undefined}
            aspectRatio={aspectRatio}
            type={postType}
            scheduledTimeFormatted={formattedScheduledPreview}
          />
        </div>

      </div>

    </div>
  );
};
