import { useState } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Home, 
  Search, 
  PlusSquare, 
  Clapperboard, 
  Sparkles, 
  Camera
} from 'lucide-react';
import type { AspectRatio, PostType } from '../types/instagram';

interface InstagramPhonePreviewProps {
  mediaUrl: string;
  caption: string;
  firstComment?: string;
  aspectRatio: AspectRatio;
  type: PostType;
  scheduledTimeFormatted?: string;
}

export const InstagramPhonePreview = ({
  mediaUrl,
  caption,
  firstComment,
  aspectRatio,
  type,
  scheduledTimeFormatted,
}: InstagramPhonePreviewProps) => {
  const { config } = useInstagram();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const renderFormattedCaption = (text: string) => {
    if (!text) return <span className="text-slate-500 italic">Sua legenda aparecerá aqui...</span>;

    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-sky-400 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-sky-400 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '4:5':
        return 'aspect-[4/5]';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-[4/5]';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        <span>Pré-visualização Mobile Real</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
          {type === 'reel' ? 'Reel 9:16' : `Feed ${aspectRatio}`}
        </span>
      </div>

      {/* Realistic Phone Frame */}
      <div className="relative w-[340px] sm:w-[360px] bg-black rounded-[48px] p-3.5 shadow-2xl shadow-pink-500/10 border-[6px] border-slate-800 ring-1 ring-slate-700/50">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-950 mr-2 ring-1 ring-slate-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 animate-pulse"></div>
        </div>

        {/* Screen Content Container */}
        <div className="w-full bg-black rounded-[36px] overflow-hidden flex flex-col text-white pt-8 pb-3 min-h-[640px] max-h-[720px] overflow-y-auto no-scrollbar select-none">
          
          {/* Instagram In-App Header */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/5 sticky top-0 bg-black/90 backdrop-blur-md z-20">
            <span className="font-bold text-lg tracking-tight font-serif italic text-white flex items-center gap-1.5">
              Instagram
            </span>
            <div className="flex items-center gap-4 text-white">
              <Camera className="w-5 h-5 cursor-pointer hover:opacity-75" />
              <Heart className="w-5 h-5 cursor-pointer hover:opacity-75" />
              <Send className="w-5 h-5 cursor-pointer hover:opacity-75" />
            </div>
          </div>

          {/* Post Author Bar */}
          <div className="px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-[2px] rounded-full bg-instagram-gradient">
                <img
                  src={config.avatarUrl}
                  alt={config.username}
                  className="w-8 h-8 rounded-full object-cover border-2 border-black"
                />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-white">
                    {config.username}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                  <span className="text-[10px] text-pink-400 font-semibold">Seguir</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {scheduledTimeFormatted ? `Programado: ${scheduledTimeFormatted}` : 'São Paulo, Brasil'}
                </p>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>

          {/* Media Container */}
          <div className={`w-full ${getAspectRatioClass()} bg-slate-900 relative overflow-hidden flex items-center justify-center group`}>
            {mediaUrl ? (
              <img
                src={mediaUrl}
                alt="Prévia do post"
                className="w-full h-full object-cover transition-transform duration-300"
              />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <PlusSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-pink-500" />
                <p className="text-xs">Selecione uma imagem para visualizar</p>
              </div>
            )}

            {type === 'reel' && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-[11px] font-semibold text-white">
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Reels</span>
              </div>
            )}
          </div>

          {/* Post Interaction Buttons */}
          <div className="px-3 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsLiked(!isLiked)} 
                className="hover:scale-110 active:scale-95 transition-transform"
                title="Curtir"
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </button>
              <button className="hover:scale-110 transition-transform" title="Comentar">
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
              <button className="hover:scale-110 transition-transform" title="Compartilhar">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <button 
              onClick={() => setIsSaved(!isSaved)} 
              className="hover:scale-110 active:scale-95 transition-transform"
              title="Salvar"
            >
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>

          {/* Likes count */}
          <div className="px-3 pb-1.5">
            <p className="text-xs font-semibold text-white">
              {isLiked ? '143 curtidas' : '142 curtidas'}
            </p>
          </div>

          {/* Caption */}
          <div className="px-3 text-xs leading-relaxed text-slate-200">
            <span className="font-semibold text-white mr-1.5">{config.username}</span>
            <span className={showFullCaption ? 'whitespace-pre-line' : 'line-clamp-2 whitespace-pre-line'}>
              {renderFormattedCaption(caption)}
            </span>
            {caption && caption.length > 80 && (
              <button
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-[11px] text-slate-400 ml-1 font-medium hover:text-white"
              >
                {showFullCaption ? 'menos' : '...mais'}
              </button>
            )}
          </div>

          {/* First comment preview if exists */}
          {firstComment && (
            <div className="mt-2 mx-3 p-2 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1 font-semibold text-pink-400 mb-0.5">
                <span>Primeiro comentário programado:</span>
              </div>
              <p className="line-clamp-2">{firstComment}</p>
            </div>
          )}

          {/* Time & Comments Counter */}
          <div className="px-3 pt-2 pb-4 text-[10px] text-slate-400">
            <p className="text-slate-500 mb-1 cursor-pointer hover:text-slate-400">
              Ver todos os 28 comentários
            </p>
            <p className="uppercase tracking-wider">
              {scheduledTimeFormatted ? `Programado p/ ${scheduledTimeFormatted}` : 'HÁ 2 MINUTOS'}
            </p>
          </div>

          {/* Phone Bottom Tab Bar */}
          <div className="mt-auto pt-3 pb-1 px-6 border-t border-white/5 flex items-center justify-between text-white">
            <Home className="w-5 h-5 text-white" />
            <Search className="w-5 h-5 text-slate-400" />
            <PlusSquare className="w-5 h-5 text-slate-400" />
            <Clapperboard className="w-5 h-5 text-slate-400" />
            <img
              src={config.avatarUrl}
              alt="Perfil"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
