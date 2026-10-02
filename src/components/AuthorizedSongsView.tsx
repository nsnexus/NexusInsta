import { useState } from 'react';
import type { ClientSongItem } from '../types/instagram';
import { 
  Music, 
  Search, 
  Play, 
  Pause, 
  Sparkles, 
  ShieldCheck, 
  RotateCw,
  CheckCircle2
} from 'lucide-react';

interface AuthorizedSongsViewProps {
  songs: ClientSongItem[];
  isLoading: boolean;
  onToggleAuthorization: (songId: string, authorized: boolean) => Promise<void>;
  onTriggerSongAutomation: (song: ClientSongItem) => void;
  onRefresh: () => void;
}

export const AuthorizedSongsView = ({
  songs,
  isLoading,
  onToggleAuthorization,
  onTriggerSongAutomation,
  onRefresh,
}: AuthorizedSongsViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'AUTHORIZED' | 'UNPUBLISHED'>('ALL');
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handlePlayAudio = (url: string) => {
    if (playingAudioUrl === url && audioElement) {
      audioElement.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioElement) audioElement.pause();
      const newAudio = new Audio(url);
      setAudioElement(newAudio);
      setPlayingAudioUrl(url);
      newAudio.onended = () => setPlayingAudioUrl(null);
      newAudio.play();
    }
  };

  const handleToggle = async (song: ClientSongItem) => {
    setTogglingId(song.id);
    try {
      await onToggleAuthorization(song.id, !song.authorizedForMarketing);
    } finally {
      setTogglingId(null);
    }
  };

  const filteredSongs = songs.filter((s) => {
    if (filterType === 'AUTHORIZED' && !s.authorizedForMarketing) return false;
    if (filterType === 'UNPUBLISHED' && (s.publishedOnSocial || !s.authorizedForMarketing)) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(term) ||
      s.honoreeName.toLowerCase().includes(term) ||
      s.musicStyle.toLowerCase().includes(term) ||
      s.occasion.toLowerCase().includes(term) ||
      s.orderNumber.toLowerCase().includes(term)
    );
  });

  const countAuthorized = songs.filter((s) => s.authorizedForMarketing).length;
  const countEligible = songs.filter((s) => s.authorizedForMarketing && !s.publishedOnSocial).length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>Músicas dos Clientes da NS Music</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                {countEligible} Prontas p/ Automação
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie a autorização de divulgação das canções produzidas no portal
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Banco</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, homenageado, estilo ou número do pedido..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'ALL'
                ? 'bg-pink-500 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Todas ({songs.length})
          </button>
          <button
            onClick={() => setFilterType('AUTHORIZED')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'AUTHORIZED'
                ? 'bg-pink-500 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Autorizadas ({countAuthorized})
          </button>
          <button
            onClick={() => setFilterType('UNPUBLISHED')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'UNPUBLISHED'
                ? 'bg-pink-500 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Prontas ({countEligible})
          </button>
        </div>

      </div>

      {/* Songs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 sm:px-6">Áudio & Pedido</th>
                <th className="py-4 px-4">Cliente & Homenageado</th>
                <th className="py-4 px-4">Estilo & Ocasião</th>
                <th className="py-4 px-4 text-center">Autorização Marketing</th>
                <th className="py-4 px-4 text-center">Redes Sociais</th>
                <th className="py-4 px-4 sm:px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredSongs.map((song) => {
                const isPlaying = playingAudioUrl === song.audioUrl;
                const isToggling = togglingId === song.id;

                return (
                  <tr
                    key={song.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Áudio & Pedido */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlayAudio(song.audioUrl)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isPlaying
                              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25 animate-pulse'
                              : 'bg-slate-950 text-pink-400 border border-slate-800 hover:border-pink-500/40'
                          }`}
                          title={isPlaying ? 'Pausar Áudio' : 'Ouvir Música'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div>
                          <span className="font-mono text-xs text-white block">{song.orderNumber}</span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(song.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cliente & Homenageado */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-white block">{song.customerName}</span>
                      <span className="text-[11px] text-pink-400">
                        Para: <strong className="text-slate-300">{song.honoreeName}</strong>
                      </span>
                    </td>

                    {/* Estilo & Ocasião */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-200 block">{song.musicStyle}</span>
                      <span className="text-[11px] text-slate-400">{song.occasion}</span>
                    </td>

                    {/* Autorização Marketing Toggle */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(song)}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          song.authorizedForMarketing
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {song.authorizedForMarketing ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Autorizado</span>
                          </>
                        ) : (
                          <span>Não Autorizado</span>
                        )}
                      </button>
                    </td>

                    {/* Redes Sociais Status */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {song.publishedOnSocial ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Já Publicada</span>
                        </span>
                      ) : song.authorizedForMarketing ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Elegível p/ Robô</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Aguardando Autorização</span>
                      )}
                    </td>

                    {/* Ação */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => onTriggerSongAutomation(song)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pink-500/10 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/30 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        title="Gerar Reel agora com esta música"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gerar Post</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
