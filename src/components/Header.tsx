import { useInstagram } from '../context/InstagramContext';
import { useBrand } from '../context/BrandContext';
import { 
  Calendar, 
  BarChart3, 
  Settings2, 
  Terminal, 
  CheckCircle, 
  Sparkles,
  Bot,
  MessageSquare,
  Lock,
  Layers,
  Coins,
  Music2,
  Clock
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { BrandSelector } from './BrandSelector';

export const Header = () => {
  const { activeTab, setActiveTab, config, logout } = useInstagram();
  const { creditBalance, setIsLedgerModalOpen } = useBrand();

  const navItems = [
    { id: 'carousel-studio' as const, label: 'Studio Carrossel', icon: Layers, badge: 'BestContent' },
    { id: 'editorial-planner' as const, label: 'IA Editorial & Pautas', icon: Calendar },
    { id: 'brand-kit' as const, label: 'Brand Kit', icon: Sparkles },
    { id: 'queue' as const, label: 'Fila de Agendamento', icon: Clock },
    { id: 'content-automation' as const, label: 'Músicas & Criador', icon: Music2 },
    { id: 'autopilot' as const, label: 'Piloto IA', icon: Bot },
    { id: 'messages' as const, label: 'Direct IA', icon: MessageSquare },
    { id: 'analytics' as const, label: 'Desempenho', icon: BarChart3 },
    { id: 'config' as const, label: 'Meta API', icon: Settings2 },
    { id: 'logs' as const, label: 'Logs', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo Brand & Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('carousel-studio')}>
              <div className="w-10 h-10 rounded-2xl bg-instagram-gradient flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
                <InstagramIcon className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white stroke-[3]" />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  NSNEXUS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  SaaS v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Multi-Brand Platform</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </p>
            </div>

            {/* Brand Switcher */}
            <div className="ml-1">
              <BrandSelector />
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden 2xl:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Area: Credit Balance, Meta Account & Lock */}
          <div className="flex items-center gap-2.5">
            {/* Credit Ledger Pill */}
            <button
              onClick={() => setIsLedgerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Abrir Ledger de Créditos e Custos de IA"
            >
              <Coins className="w-3.5 h-3.5" />
              <span className="font-mono">{creditBalance}</span>
              <span className="text-[10px] text-amber-500 font-normal hidden sm:inline">cr</span>
            </button>

            {/* Connected Account Avatar */}
            <div 
              onClick={() => setActiveTab('config')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              title="Conta Meta Conectada"
            >
              <img
                src={config.avatarUrl}
                alt={config.username}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500/40"
              />
              <div className="text-left text-xs">
                <div className="flex items-center gap-1 font-semibold text-slate-200">
                  <span>@{config.username}</span>
                </div>
                <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Meta v21
                </div>
              </div>
            </div>

            {/* Lock / Logout session */}
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition-all cursor-pointer"
              title="Bloquear Painel (Segurança)"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Responsive Secondary Navigation Bar (For screens below 2xl) */}
        <div className="flex 2xl:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                    : 'text-slate-400 bg-slate-900 border border-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
