import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-700 max-h-[85vh] overflow-y-auto text-slate-300 text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Política de Privacidade & Termos de Uso</h2>
              <p className="text-[11px] text-slate-400">NexusInsta Automation • Meta Graph API v21.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">1. Informações Gerais</h3>
            <p>
              A plataforma <strong>NexusInsta</strong> respeita a privacidade de seus usuários e clientes. Esta política descreve como coletamos, utilizamos e protegemos as informações fornecidas através do Login do Facebook e da Meta Graph API.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">2. Dados Coletados e Finalidade</h3>
            <p>
              Utilizamos a autenticação oficial da Meta exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Identificar o ID da conta comercial do Instagram conectada (<code className="text-pink-300">instagram_basic</code>).</li>
              <li>Publicar conteúdos agendados pelo próprio usuário no feed ou reels (<code className="text-pink-300">instagram_content_publish</code>).</li>
              <li>Exibir métricas básicas de engajamento do perfil para o usuário (<code className="text-pink-300">pages_read_engagement</code>).</li>
            </ul>
            <p>
              <strong>Não armazenamos senhas</strong> da sua conta da Meta ou do Instagram. O acesso ocorre estritamente por meio de tokens criptografados emitidos pela própria Meta.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">3. Exclusão de Dados</h3>
            <p>
              O usuário pode revogar o acesso do aplicativo a qualquer momento através do painel de Configurações do Facebook ou solicitar a exclusão de todos os dados pelo e-mail: <strong className="text-white">contato@nsnexus.com.br</strong>.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">4. Conformidade com as Diretrizes da Meta</h3>
            <p>
              Esta plataforma opera em total conformidade com os Termos de Serviço da Plataforma Meta e a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white transition-colors"
          >
            Entendido e Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
