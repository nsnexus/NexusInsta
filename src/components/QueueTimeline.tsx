import { useState, useEffect } from 'react';
import { useInstagram } from '../context/InstagramContext';
import type { InstagramPost } from '../types/instagram';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Heart, 
  MessageCircle, 
  Sparkles,
  Plus
} from 'lucide-react';

export const QueueTimeline = () => {
  const { posts, publishImmediately, deletePost, reschedulePost, setActiveTab } = useInstagram();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'publishing' | 'published'>('all');
  const [now, setNow] = useState<number>(Date.now());
  const [rescheduleModalPost, setRescheduleModalPost] = useState<InstagramPost | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<string>('');
  const [newScheduleTime, setNewScheduleTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getCountdownString = (isoDate: string) => {
    const diffMs = new Date(isoDate).getTime() - now;
    if (diffMs <= 0) return 'Disparando agora...';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Dispara em ${diffDays}d ${diffHours % 24}h`;
    }
    if (diffHours > 0) {
      return `Dispara em ${diffHours}h ${diffMinutes % 60}m`;
    }
    const diffSeconds = Math.floor((diffMs / 1000) % 60);
    return `Dispara em ${diffMinutes}m ${diffSeconds}s`;
  };

  const handleOpenReschedule = (post: InstagramPost) => {
    const dateObj = new Date(post.scheduledAt);
    setRescheduleModalPost(post);
    setNewScheduleDate(dateObj.toISOString().split('T')[0]);
    setNewScheduleTime(dateObj.toTimeString().slice(0, 5));
  };

  const handleConfirmReschedule = () => {
    if (rescheduleModalPost && newScheduleDate && newScheduleTime) {
      const combined = new Date(`${newScheduleDate}T${newScheduleTime}:00`).toISOString();
      reschedulePost(rescheduleModalPost.id, combined);
      setRescheduleModalPost(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Fila de Automação & Agendamentos
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Motor de disparo em tempo real: os posts são processados e enviados à Meta Graph API automaticamente no segundo programado.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({posts.length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'scheduled' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agendados ({posts.filter((p) => p.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'published' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Publicados ({posts.filter((p) => p.status === 'published').length})
          </button>
        </div>
      </div>

      {/* Posts List / Grid */}
      {filteredPosts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/20">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhum post encontrado nesta categoria</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sua esteira de agendamento está limpa. Crie um novo post com foto, hashtags e horário programado para acionar o disparo automático.
          </p>
          <button
            onClick={() => setActiveTab('create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-instagram-gradient text-white shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Criar Minha Primeira Automação
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isScheduled = post.status === 'scheduled';
            const isPublishing = post.status === 'publishing';
            const isPublished = post.status === 'published';
            const targetDate = new Date(post.scheduledAt);

            return (
              <div
                key={post.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800/80 transition-all group"
              >
                {/* Card Top: Media & Status Badges */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  <img
                    src={post.mediaUrl}
                    alt="Mídia"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  {/* Format Badge (Top Left) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10 uppercase">
                      {post.type === 'reel' ? 'Reel 9:16' : `Feed ${post.aspectRatio}`}
                    </span>
                  </div>

                  {/* Status Badge (Top Right) */}
                  <div className="absolute top-3 right-3">
                    {isScheduled && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-pink-500/20 backdrop-blur-md text-pink-300 border border-pink-500/40">
                        <Clock className="w-3 h-3 text-pink-400" />
                        <span>Agendado</span>
                      </span>
                    )}

                    {isPublishing && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/40 animate-pulse">
                        <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                        <span>Publicando na Meta...</span>
                      </span>
                    )}

                    {isPublished && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Publicado</span>
                      </span>
                    )}
                  </div>

                  {/* Dynamic Countdown Ribbon */}
                  {isScheduled && (
                    <div className="absolute bottom-2 left-3 right-3 py-1 px-2.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-pink-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {getCountdownString(post.scheduledAt)}
                      </span>
                      <span className="text-slate-400">
                        {targetDate.toLocaleDateString('pt-BR')} às {targetDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {isPublished && post.publishedAt && (
                    <div className="absolute bottom-2 left-3 right-3 py-1 px-2.5 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
                      <span>Publicado com sucesso</span>
                      <span>{new Date(post.publishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Card Body: Caption & Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
                      {post.caption}
                    </p>

                    {post.firstComment && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                        <span className="text-pink-400 font-semibold">1º Comentário: </span>
                        <span className="line-clamp-1">{post.firstComment}</span>
                      </div>
                    )}
                  </div>

                  {/* Engagement / Meta IDs if published */}
                  {isPublished && (
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          {post.likes || 1}
                        </span>
                        <span className="flex items-center gap-1 text-slate-300 font-semibold">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {post.comments || 0}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ID: {post.igPostId?.slice(-6) || 'pub_ok'}
                      </span>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {isScheduled ? (
                      <>
                        <button
                          onClick={() => publishImmediately(post.id)}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 flex items-center justify-center gap-1.5 transition-colors"
                          title="Ignora o tempo de espera e dispara na Meta API agora"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publicar Já
                        </button>

                        <button
                          onClick={() => handleOpenReschedule(post)}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                          title="Alterar data/hora"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deletePost(post.id)}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 transition-colors"
                          title="Remover post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Container Meta: {post.creationId || 'Executado'}
                        </span>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="py-1 px-2 rounded-lg text-xs text-slate-500 hover:text-rose-400 transition-colors"
                          title="Excluir do histórico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-400" />
              Reagendar Publicação
            </h3>
            <p className="text-xs text-slate-400">
              Escolha uma nova data e hora para o disparo automático deste post.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Nova Data:</label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Novo Horário:</label>
                <input
                  type="time"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRescheduleModalPost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20"
              >
                Salvar Novo Horário
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
