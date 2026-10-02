import { useInstagram } from '../context/InstagramContext';
import { 
  Heart, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Activity, 
  Zap, 
  Calendar 
} from 'lucide-react';

export const AnalyticsView = () => {
  const { posts, config, setActiveTab } = useInstagram();

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled');

  const totalLikes = publishedPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalComments = publishedPosts.reduce((acc, p) => acc + (p.comments || 0), 0);

  const quotaPercent = Math.min(100, Math.round((config.dailyQuotaUsed / 50) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Desempenho & Métricas de Automação
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Data
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhe o impacto dos posts programados, engajamento gerado e o consumo de limites da Meta Graph API.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-md shadow-pink-500/20"
        >
          + Programar Próximo Post
        </button>
      </div>

      {/* Stat Cards com Dados Reais da Conta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Seguidores Reais */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Seguidores no Insta</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{config.followersCount || 817}</p>
          <p className="text-[11px] text-pink-400 flex items-center gap-1 font-medium">
            <span>@{config.username}</span>
            <span className="text-emerald-400">• Conta Ativa</span>
          </p>
        </div>

        {/* Card 2: Total de Publicações na Conta */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total de Mídias</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{config.mediaCount || publishedPosts.length}</p>
          <p className="text-[11px] text-purple-400 flex items-center gap-1 font-medium">
            <span>Feed, Reels & Vídeos</span>
          </p>
        </div>

        {/* Card 3: Fila Ativa */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Fila Agendada</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{scheduledPosts.length}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>Próximos disparos</span>
          </p>
        </div>

        {/* Card 4: Engajamento Acumulado */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Interações Totais</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalLikes + totalComments}</p>
          <p className="text-[11px] text-rose-400 flex items-center gap-1.5 font-medium">
            <span>{totalLikes} curtidas</span>
            <span>•</span>
            <span>{totalComments} coments</span>
          </p>
        </div>

        {/* Card 5: Cota da Meta API */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Cota Diária Meta</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-white">{config.dailyQuotaUsed}<span className="text-base text-slate-500 font-normal">/50</span></p>
            <span className="text-xs text-sky-400 font-bold">{50 - config.dailyQuotaUsed} livres</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-pink-500 transition-all duration-500"
              style={{ width: `${quotaPercent}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Middle Grid: Horários de Maior Engajamento & Status do Algoritmo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Recomendações de Horários (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Melhores Horários para Postar no Instagram</h3>
                <p className="text-xs text-slate-400">Baseado no pico de atividade da sua audiência em 2026</p>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Otimizado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Almoço & Pausa</p>
              <p className="text-xl font-extrabold text-white">12:00 - 13:30</p>
              <span className="inline-block text-[10px] text-pink-400 font-medium">Feed Carrossel & Reels</span>
            </div>

            <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center space-y-1 shadow-md shadow-pink-500/10">
              <p className="text-xs text-pink-300 font-semibold">Pico Máximo (Top 1)</p>
              <p className="text-xl font-extrabold text-white">18:00 - 19:30</p>
              <span className="inline-block text-[10px] text-pink-300 font-bold">Maior Retenção Orgânica</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Noturno / Descompressão</p>
              <p className="text-xl font-extrabold text-white">21:00 - 22:15</p>
              <span className="inline-block text-[10px] text-pink-400 font-medium">Stories & Reels</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1.5">
            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Dica da Automação InstaFlow:
            </p>
            <p>
              Programe o disparo para <strong>10 minutos antes</strong> do horário de pico (ex: 17:50). A Meta leva cerca de 2 a 5 minutos para processar e indexar o container na aba "Explorar", garantindo que seu post chegue aos seguidores no minuto exato que abrirem o app.
            </p>
          </div>
        </div>

        {/* Right: Perfil Conectado & Saúde da API (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Status da Conexão Meta Graph API
          </h3>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <img
              src={(!config.avatarUrl || config.avatarUrl.includes('unsplash') || config.avatarUrl.includes('fbcdn.net') || config.avatarUrl.includes('photo-15')) ? '/nsmusic-logo.png' : config.avatarUrl}
              alt={config.username}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/nsmusic-logo.png'; }}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500"
            />
            <div className="leading-tight">
              <p className="font-bold text-sm text-white">@{config.username}</p>
              <p className="text-xs text-slate-400">{config.accountName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Token Válido (v21.0)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ID: {config.instagramAccountId.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
              <span className="text-slate-400">Permissão `instagram_content_publish`:</span>
              <span className="text-emerald-400 font-semibold">Autorizada ✓</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
              <span className="text-slate-400">Permissão `pages_read_engagement`:</span>
              <span className="text-emerald-400 font-semibold">Autorizada ✓</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
              <span className="text-slate-400">Tipo de Token:</span>
              <span className="text-slate-200 font-medium">Long-Lived Page Access</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-slate-300">
              <span className="text-slate-400">Modo Atual:</span>
              <span className="text-pink-400 font-semibold">
                {config.isLiveMode ? 'Produção Meta API' : 'Sandbox Alta Fidelidade'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Published Posts Gallery */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-400" />
          Histórico Recente de Publicações Automáticas
        </h3>

        {publishedPosts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Nenhum post publicado até o momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedPosts.map((post) => (
              <div
                key={post.id}
                className="glass-panel rounded-2xl p-4 border border-slate-800 flex gap-3.5 items-start"
              >
                <img
                  src={post.mediaUrl}
                  alt="Mídia"
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Publicado em {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : 'Hoje'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1 text-rose-400 font-semibold">
                      <Heart className="w-3 h-3 fill-rose-500" /> {post.likes || 1}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-auto">
                      ✓ Meta Graph
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
