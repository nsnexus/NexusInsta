import { InstagramProvider, useInstagram } from './context/InstagramContext';
import { BrandProvider } from './context/BrandContext';
import { Header } from './components/Header';
import { CarouselEngineView } from './components/CarouselEngineView';
import { EditorialPlannerView } from './components/EditorialPlannerView';
import { BrandKitView } from './components/BrandKitView';
import { ContentAutomationView } from './components/ContentAutomationView';
import { QueueTimeline } from './components/QueueTimeline';
import { PostCreator } from './components/PostCreator';
import { AiAutopilotView } from './components/AiAutopilotView';
import { DirectMessagesView } from './components/DirectMessagesView';
import { AnalyticsView } from './components/AnalyticsView';
import { MetaConfigView } from './components/MetaConfigView';
import { ApiLogsView } from './components/ApiLogsView';
import { LoginScreen } from './components/LoginScreen';
import { ToastContainer } from './components/ToastContainer';
import { BrandOnboardingModal } from './components/BrandOnboardingModal';
import { CreditLedgerModal } from './components/CreditLedgerModal';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { InstagramIcon } from './components/InstagramIcon';

function DashboardContent() {
  const { activeTab, setActiveTab, isAuthenticated } = useInstagram();

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
      {/* Top Navigation Bar with Multi-Brand & Credit Ledger */}
      <Header />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'carousel-studio' && <CarouselEngineView />}
        {activeTab === 'editorial-planner' && (
          <EditorialPlannerView onOpenCarouselEditor={() => setActiveTab('carousel-studio')} />
        )}
        {activeTab === 'brand-kit' && <BrandKitView />}
        {activeTab === 'content-automation' && <ContentAutomationView />}
        {activeTab === 'queue' && <QueueTimeline />}
        {activeTab === 'create' && <PostCreator />}
        {activeTab === 'autopilot' && <AiAutopilotView />}
        {activeTab === 'messages' && <DirectMessagesView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'config' && <MetaConfigView />}
        {activeTab === 'logs' && <ApiLogsView />}
      </main>

      {/* System Modals */}
      <BrandOnboardingModal />
      <CreditLedgerModal />
      <ToastContainer />

      {/* Modern Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-instagram-gradient flex items-center justify-center text-white">
              <InstagramIcon className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-400">NSNEXUS Content AI Platform</span>
            <span>•</span>
            <span className="text-pink-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              SaaS Multi-Tenant Architecture
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Idempotência & Ledger Auditável Ativos</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">Meta Graph API v21.0 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrandProvider>
      <InstagramProvider>
        <DashboardContent />
      </InstagramProvider>
    </BrandProvider>
  );
}
