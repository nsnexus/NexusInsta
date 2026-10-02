import { useState } from 'react';
import type { ContentAutomationLog } from '../types/instagram';
import { 
  X, 
  ExternalLink, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RotateCw, 
  Copy, 
  Check, 
  Music, 
  Send,
  Trash2
} from 'lucide-react';

interface PostInspectionModalProps {
  log: ContentAutomationLog | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveAndPublish?: (log: ContentAutomationLog) => Promise<void>;
  onRetry?: (log: ContentAutomationLog) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const PostInspectionModal = ({
  log,
  isOpen,
  onClose,
  onApproveAndPublish,
  onRetry,
  onDelete,
}: PostInspectionModalProps) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !log) return null;

  const handleToggleAudio = () => {
    if (!log.audioUrl) return;

    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = audioElement || new Audio(log.audioUrl);
      if (!audioElement) {
        setAudioElement(audio);
        audio.onended = () => setIsPlayingAudio(false);
      }
      audio.play();
      setIsPlayingAudio(true);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(log.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleApprove = async () => {
    if (!onApproveAndPublish) return;
    setIsProcessing(true);
    try {
      await onApproveAndPublish(log);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPost = async () => {
    if (!onRetry) return;
    setIsProcessing(true);
    try {
      await onRetry(log);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (log.status) {
      case 'PUBLICADO':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Publicado no Instagram
          </span>
        );
      case 'AGUARDANDO_APROVACAO':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Aguardando Sua Aprovação
          </span>
        );
      case 'AGENDADO':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5" />
            Programado na Fila
          </span>
        );
      case 'PUBLICANDO':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            Enviando para Meta API...
          </span>
        );
      case 'FALHA':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Falha na Publicação
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {getStatusBadge()}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {log.mediaFormat === 'REELS' ? 'Reel (Vídeo 9:16)' : 'Feed (Imagem)'}
              </span>
              <span className="text-xs text-slate-400">
                • {new Date(log.scheduledFor).toLocaleString('pt-BR')}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {log.themeConcept || log.automationName || 'Publicação de Conteúdo'}
            </h2>
            <p className="text-xs text-slate-400">
              Regra: <span className="text-pink-400 font-medium">{log.automationName || 'Manual'}</span>
            </p>
          </div>

          <button
            onClick={() => {
              if (audioElement) audioElement.pause();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Mídia (Preview Visual) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[320px] aspect-[9/16] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative shadow-xl group">
              {log.videoUrl ? (
                <video
                  src={log.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={log.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80'}
                  alt="Post Preview"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Tag de Marca */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-pink-400 border border-white/10">
                @_nsmusic
              </div>
            </div>

            {/* Player de Áudio caso seja música de cliente */}
            {log.audioUrl && (
              <button
                type="button"
                onClick={handleToggleAudio}
                className="mt-3 w-full max-w-[320px] flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-pink-400 transition-all cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'Pausar Áudio da Música' : 'Ouvir Música do Cliente'}</span>
              </button>
            )}
          </div>

          {/* Detalhes & Legenda */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Informações da Música do Cliente (se houver) */}
            {log.customerName && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
                  <Music className="w-4 h-4" />
                  <span>Música de Cliente Selecionada</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Cliente:</span>
                    <p className="font-semibold text-white">{log.customerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Homenageado(a):</span>
                    <p className="font-semibold text-white">{log.honoreeName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Estilo Musical:</span>
                    <p className="font-semibold text-white">{log.musicStyle}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Ocasião:</span>
                    <p className="font-semibold text-white">{log.occasion}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Legenda do Post */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Legenda Gerada pela IA</label>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1 text-[11px] font-semibold text-pink-400 hover:text-pink-300"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Copiada!' : 'Copiar Legenda'}</span>
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto no-scrollbar">
                {log.caption}
              </div>
            </div>

            {/* Hashtags */}
            {log.hashtags && log.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {log.hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-400"
                  >
                    #{h.replace('#', '')}
                  </span>
                ))}
              </div>
            )}

            {/* Detalhes de Erro (se houver) */}
            {log.errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-1">
                <span className="font-bold flex items-center gap-1 text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Erro reportado pela Meta API:
                </span>
                <p className="text-[11px] font-mono">{log.errorMessage}</p>
              </div>
            )}

            {/* Meta API Post Link */}
            {log.metaPostId && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-500">ID na Meta:</span>{' '}
                  <span className="font-mono text-slate-300">{log.metaPostId}</span>
                </div>
                <a
                  href={`https://instagram.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:underline"
                >
                  <span>Ver no Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800">
          
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja excluir este registro de histórico?')) {
                    onDelete(log.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {log.status === 'AGUARDANDO_APROVACAO' && onApproveAndPublish && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApprove}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isProcessing ? 'Publicando...' : 'Aprovar e Publicar Agora'}</span>
              </button>
            )}

            {log.status === 'FALHA' && onRetry && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRetryPost}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                <RotateCw className="w-4 h-4" />
                <span>{isProcessing ? 'Tentando...' : 'Tentar Novamente'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (audioElement) audioElement.pause();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
