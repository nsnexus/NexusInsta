import { useState } from 'react';
import type { ContentAutomationLog, AutomationLogStatus } from '../types/instagram';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Music, 
  Building2, 
  Filter
} from 'lucide-react';

interface ContentCalendarViewProps {
  logs: ContentAutomationLog[];
  onSelectPost: (post: ContentAutomationLog) => void;
}

export const ContentCalendarView = ({ logs, onSelectPost }: ContentCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<'ALL' | AutomationLogStatus>('ALL');

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Dias do mês
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filtra logs
  const filteredLogs = logs.filter((log) => {
    if (statusFilter === 'ALL') return true;
    return log.status === statusFilter;
  });

  // Agrupa posts por dia (1 a 31)
  const postsByDay = filteredLogs.reduce((acc, log) => {
    const d = new Date(log.scheduledFor);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!acc[dayNum]) acc[dayNum] = [];
      acc[dayNum].push(log);
    }
    return acc;
  }, {} as Record<number, ContentAutomationLog[]>);

  // Contadores
  const countPublished = logs.filter((l) => l.status === 'PUBLICADO').length;
  const countPending = logs.filter((l) => l.status === 'AGUARDANDO_APROVACAO').length;
  const countScheduled = logs.filter((l) => l.status === 'AGENDADO').length;
  const countFailed = logs.filter((l) => l.status === 'FALHA').length;

  const daysLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl">
        
        {/* Navigation Month */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>{monthNames[month]} {year}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Grade de publicações programadas e histórico diário
            </p>
          </div>
        </div>

        {/* Month Arrows & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos os Status ({logs.length})</option>
              <option value="PUBLICADO">🟢 Publicados ({countPublished})</option>
              <option value="AGUARDANDO_APROVACAO">🟡 Aguardando Aprovação ({countPending})</option>
              <option value="AGENDADO">🔵 Programados ({countScheduled})</option>
              <option value="FALHA">🔴 Falhas ({countFailed})</option>
            </select>
          </div>

        </div>

      </div>

      {/* Quick Status Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div 
          onClick={() => setStatusFilter('PUBLICADO')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'PUBLICADO'
              ? 'bg-emerald-500/10 border-emerald-500 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Publicadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
            {countPublished}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('AGUARDANDO_APROVACAO')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'AGUARDANDO_APROVACAO'
              ? 'bg-amber-500/10 border-amber-500 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Aguardando Aprovação</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
            {countPending}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('AGENDADO')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'AGENDADO'
              ? 'bg-blue-500/10 border-blue-500 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Programadas</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-extrabold text-blue-400 mt-1 block">
            {countScheduled}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('FALHA')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'FALHA'
              ? 'bg-rose-500/10 border-rose-500 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Falhas</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-extrabold text-rose-400 mt-1 block">
            {countFailed}
          </span>
        </div>

      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 sm:p-6 shadow-xl">
        
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {daysLabels.map((lbl, idx) => (
            <div
              key={lbl}
              className={`text-xs font-bold uppercase tracking-wider py-1 ${
                idx === 0 || idx === 6 ? 'text-pink-400' : 'text-slate-400'
              }`}
            >
              {lbl}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-2">
          
          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[110px] rounded-2xl bg-slate-950/30 border border-slate-800/40 p-2 opacity-30"
            />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            const dayPosts = postsByDay[dayNum] || [];

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] rounded-2xl p-2.5 flex flex-col justify-between transition-all border ${
                  isToday
                    ? 'bg-slate-950 border-pink-500/60 shadow-lg shadow-pink-500/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-pink-500 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {dayPosts.length}
                    </span>
                  )}
                </div>

                {/* Day Posts List */}
                <div className="space-y-1.5 mt-2 flex-1 overflow-y-auto no-scrollbar max-h-[85px]">
                  {dayPosts.map((post) => {
                    const timeStr = new Date(post.scheduledFor).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    let statusDot = 'bg-emerald-400';
                    let statusBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
                    if (post.status === 'AGUARDANDO_APROVACAO') {
                      statusDot = 'bg-amber-400 animate-pulse';
                      statusBg = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
                    } else if (post.status === 'AGENDADO') {
                      statusDot = 'bg-blue-400';
                      statusBg = 'bg-blue-500/10 border-blue-500/30 text-blue-300';
                    } else if (post.status === 'FALHA') {
                      statusDot = 'bg-rose-400';
                      statusBg = 'bg-rose-500/10 border-rose-500/30 text-rose-300';
                    }

                    return (
                      <div
                        key={post.id}
                        onClick={() => onSelectPost(post)}
                        className={`p-1.5 rounded-xl border text-[10px] font-semibold cursor-pointer hover:scale-[1.02] transition-transform flex items-center gap-1.5 truncate ${statusBg}`}
                        title={`${post.automationName || 'Post'}: ${post.caption.slice(0, 80)}... (Clique para ver detalhes)`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
                        <span className="shrink-0 text-slate-400 font-mono">{timeStr}</span>
                        {post.contentType === 'MUSICA_CLIENTE' ? (
                          <Music className="w-3 h-3 text-pink-400 shrink-0" />
                        ) : (
                          <Building2 className="w-3 h-3 text-purple-400 shrink-0" />
                        )}
                        <span className="truncate">
                          {post.honoreeName ? `${post.honoreeName}` : post.themeConcept || 'Post'}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};
