import { useState } from 'react';
import type { ContentAutomationLog } from '../types/instagram';
import { 
  Search, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Music, 
  Building2, 
  Send,
  Eye,
  Trash2,
  Filter
} from 'lucide-react';

interface ContentHistoryViewProps {
  logs: ContentAutomationLog[];
  onSelectPost: (post: ContentAutomationLog) => void;
  onRetryPost: (post: ContentAutomationLog) => Promise<void>;
  onApprovePost: (post: ContentAutomationLog) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
}

export const ContentHistoryView = ({
  logs,
  onSelectPost,
  onRetryPost,
  onApprovePost,
  onDeleteLog,
}: ContentHistoryViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    if (contentTypeFilter !== 'ALL' && log.contentType !== contentTypeFilter) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      log.caption?.toLowerCase().includes(term) ||
      log.customerName?.toLowerCase().includes(term) ||
      log.honoreeName?.toLowerCase().includes(term) ||
      log.musicStyle?.toLowerCase().includes(term) ||
      log.orderNumber?.toLowerCase().includes(term) ||
      log.themeConcept?.toLowerCase().includes(term) ||
      log.automationName?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: ContentAutomationLog['status']) => {
    switch (status) {
      case 'PUBLICADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Publicado
          </span>
        );
      case 'AGUARDANDO_APROVACAO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Aprovação
          </span>
        );
      case 'AGENDADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            Agendado
          </span>
        );
      case 'FALHA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            Falha
          </span>
        );
      case 'PUBLICANDO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCw className="w-3 h-3 animate-spin" />
            Enviando
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, homenageado, música, tema ou legenda..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PUBLICADO">Publicados</option>
            <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
            <option value="AGENDADO">Agendados</option>
            <option value="FALHA">Falhas</option>
          </select>

          <select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="MUSICA_CLIENTE">Músicas de Clientes</option>
            <option value="INSTITUCIONAL">Institucional</option>
          </select>

        </div>

      </div>

      {/* History Table / Card List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Nenhum registro encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Nenhuma publicação corresponde aos filtros selecionados. As postagens automáticas e manuais aparecerão aqui assim que forem geradas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4 sm:px-6">Mídia & Data</th>
                  <th className="py-4 px-4">Conteúdo / Regra</th>
                  <th className="py-4 px-4">Origem / Música</th>
                  <th className="py-4 px-4">Legenda</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLogs.map((log) => {
                  const dateStr = new Date(log.scheduledFor).toLocaleDateString('pt-BR');
                  const timeStr = new Date(log.scheduledFor).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Mídia & Data */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => onSelectPost(log)}
                            className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 cursor-pointer hover:border-pink-500/60 transition-colors relative"
                          >
                            <img
                              src={log.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80'}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                            {log.mediaFormat === 'REELS' && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-white bg-pink-500/80 px-1 rounded">
                                  Reel
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{dateStr}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{timeStr}</span>
                          </div>
                        </div>
                      </td>

                      {/* Conteúdo / Regra */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                          {log.contentType === 'MUSICA_CLIENTE' ? (
                            <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[180px]">
                            {log.themeConcept || log.automationName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                          {log.automationName || 'Disparo Manual'}
                        </span>
                      </td>

                      {/* Origem / Música */}
                      <td className="py-4 px-4">
                        {log.customerName ? (
                          <div>
                            <span className="font-semibold text-white block truncate max-w-[160px]">
                              {log.customerName}
                            </span>
                            <span className="text-[11px] text-pink-400 block truncate max-w-[160px]">
                              {log.honoreeName} • {log.musicStyle}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Tema Institucional</span>
                        )}
                      </td>

                      {/* Legenda Resumida */}
                      <td className="py-4 px-4 max-w-[240px]">
                        <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">
                          {log.caption}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          <button
                            onClick={() => onSelectPost(log)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Ver Detalhes do Post"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {log.status === 'AGUARDANDO_APROVACAO' && (
                            <button
                              onClick={() => onApprovePost(log)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-sm"
                              title="Aprovar e Publicar"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Aprovar</span>
                            </button>
                          )}

                          {log.status === 'FALHA' && (
                            <button
                              onClick={() => onRetryPost(log)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-1 shadow-sm"
                              title="Tentar Novamente"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                              <span>Repetir</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('Deseja excluir este registro de histórico?')) {
                                onDeleteLog(log.id);
                              }
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
