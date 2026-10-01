import { useInstagram } from '../context/InstagramContext';
import { 
  Calendar, 
  PlusCircle, 
  BarChart3, 
  Settings2, 
  Terminal, 
  CheckCircle, 
  Sparkles
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';

export const Header = () => {
  const { activeTab, setActiveTab, config } = useInstagram();

  const navItems = [
    { id: 'queue' as const, label: 'Fila & Calendário', icon: Calendar },
    { id: 'create' as const, label: 'Criar Post', icon: PlusCircle },
    { id: 'analytics' as const, label: 'Desempenho', icon: BarChart3 },
    { id: 'config' as const, label: 'Meta API', icon: Settings2 },
    { id: 'logs' as const, label: 'Logs HTTP', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('queue')}>
              <div className="w-11 h-11 rounded-2xl bg-instagram-gradient flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
                <InstagramIcon className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white stroke-[3]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  InstaFlow
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    Pro
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Automação Meta Graph API v21.0</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Area: Connected Account Pill & New Post Button */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('config')}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              title="Clique para gerenciar a conta e credenciais Meta"
            >
              <img
                src={config.avatarUrl}
                alt={config.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500/40"
              />
              <div className="text-left text-xs">
                <div className="flex items-center gap-1 font-semibold text-slate-200">
                  <span>@{config.username}</span>
                  <Sparkles className="w-3 h-3 text-pink-400" />
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Cota: {config.dailyQuotaUsed}/50</span>
                  <span className="text-emerald-400 font-medium">• Ativo</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-instagram-gradient text-white shadow-lg shadow-pink-500/20 hover:opacity-95 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Criar Post</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-pink-500 text-white'
                    : 'text-slate-400 bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
