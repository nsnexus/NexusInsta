import { useState } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { 
  Terminal, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ChevronDown
} from 'lucide-react';

export const ApiLogsView = () => {
  const { logs, clearLogs } = useInstagram();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Console de Logs HTTP & Webhooks da Meta
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Stream
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor em tempo real de todas as chamadas aos endpoints da Meta Graph API v21.0 disparadas pela esteira de automação.
          </p>
        </div>

        <button
          onClick={clearLogs}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar Console</span>
        </button>
      </div>

      {/* Terminal Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-pink-400" />
              graph.facebook.com:443
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            {logs.length} eventos registrados
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto font-mono text-xs no-scrollbar">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Terminal className="w-8 h-8 mx-auto opacity-30 text-pink-500" />
              <p>Nenhuma requisição registrada ainda.</p>
              <p className="text-[11px]">Agende ou publique um post para ver os payloads da Meta em tempo real.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isOk = log.status === '200 OK';
              const isPending = log.status === 'PENDING';

              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-colors overflow-hidden"
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-3 flex items-center justify-between cursor-pointer gap-3 select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                      
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          log.method === 'POST' ? 'bg-pink-500/20 text-pink-400' : 'bg-sky-500/20 text-sky-400'
                        }`}
                      >
                        {log.method}
                      </span>

                      <span className="text-slate-200 font-semibold truncate">
                        {log.endpoint}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isOk
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isOk && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        <span>{log.status}</span>
                      </span>

                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-2 text-[11px] text-slate-400">
                    <span>{log.message}</span>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-3">
                      {log.payload && (
                        <div>
                          <p className="text-[10px] uppercase text-pink-400 font-bold mb-1">
                            Payload Enviado (Request Body / Query):
                          </p>
                          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.response && (
                        <div>
                          <p className="text-[10px] uppercase text-emerald-400 font-bold mb-1">
                            Resposta da Meta (Graph API Response):
                          </p>
                          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
