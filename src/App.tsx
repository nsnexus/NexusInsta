import { InstagramProvider, useInstagram } from './context/InstagramContext';
import { Header } from './components/Header';
import { QueueTimeline } from './components/QueueTimeline';
import { PostCreator } from './components/PostCreator';
import { AiAutopilotView } from './components/AiAutopilotView';
import { DirectMessagesView } from './components/DirectMessagesView';
import { AnalyticsView } from './components/AnalyticsView';
import { MetaConfigView } from './components/MetaConfigView';
import { ApiLogsView } from './components/ApiLogsView';
import { LoginScreen } from './components/LoginScreen';
import { ToastContainer } from './components/ToastContainer';
import { ShieldCheck } from 'lucide-react';
import { InstagramIcon } from './components/InstagramIcon';

function DashboardContent() {
  const { activeTab, isAuthenticated } = useInstagram();

  // Se nao estiver autenticado, exibe tela de login protegida
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'queue' && <QueueTimeline />}
        {activeTab === 'create' && <PostCreator />}
        {activeTab === 'autopilot' && <AiAutopilotView />}
        {activeTab === 'messages' && <DirectMessagesView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'config' && <MetaConfigView />}
        {activeTab === 'logs' && <ApiLogsView />}
      </main>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Modern Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-instagram-gradient flex items-center justify-center text-white">
              <InstagramIcon className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-400">NexusInsta Automation Platform</span>
            <span>•</span>
            <span>Meta Graph API v21.0 Certified</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel Protegido por Senha Master</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">Limite de 50 posts / 24 horas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <InstagramProvider>
      <DashboardContent />
    </InstagramProvider>
  );
}
