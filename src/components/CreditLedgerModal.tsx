import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { 
  Coins, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Sparkles,
  FileText,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { AI_CREDIT_COSTS } from '../types/brand';

export const CreditLedgerModal: React.FC = () => {
  const { 
    isLedgerModalOpen, 
    setIsLedgerModalOpen, 
    creditBalance, 
    creditTransactions, 
    addCredits,
    organization
  } = useBrand();

  const [rechargeAmount, setRechargeAmount] = useState<number>(100);

  if (!isLedgerModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Ledger de Créditos de IA
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {organization.plan.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transações auditáveis, reserva antes de jobs e estorno em caso de falha técnica
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLedgerModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Cards: Balance & Recharge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Balance Card */}
            <div className="md:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-amber-500/30 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Saldo Disponível
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {creditBalance}
                  </span>
                  <span className="text-xs text-slate-400">créditos</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>Organização:</span>
                <span className="text-white font-medium">{organization.name}</span>
              </div>
            </div>

            {/* AI Costs Card */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  Tabela de Consumo por Operação
                </span>
                <span className="text-[10px] text-slate-400">Sem custos ocultos</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <FileText className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                  <span className="text-[10px] text-slate-400 block">Copy / Pautas</span>
                  <span className="text-xs font-bold text-white font-mono">{AI_CREDIT_COSTS.ai_text} cr</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <ImageIcon className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                  <span className="text-[10px] text-slate-400 block">Geração Mídia</span>
                  <span className="text-xs font-bold text-white font-mono">{AI_CREDIT_COSTS.ai_image} cr</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-pink-500/20">
                  <Sparkles className="w-4 h-4 mx-auto text-pink-400 mb-1" />
                  <span className="text-[10px] text-slate-400 block">Carrossel IA</span>
                  <span className="text-xs font-bold text-pink-400 font-mono">{AI_CREDIT_COSTS.ai_carousel} cr</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Film className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                  <span className="text-[10px] text-slate-400 block">Roteiro Reel</span>
                  <span className="text-xs font-bold text-white font-mono">{AI_CREDIT_COSTS.ai_reel} cr</span>
                </div>
              </div>

              {/* Instant Recharge helper */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Recarregar pacote:</span>
                  <button 
                    onClick={() => setRechargeAmount(100)} 
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${rechargeAmount === 100 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}
                  >
                    +100
                  </button>
                  <button 
                    onClick={() => setRechargeAmount(500)} 
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${rechargeAmount === 500 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}
                  >
                    +500
                  </button>
                </div>

                <button
                  onClick={() => addCredits(rechargeAmount, `Recarga Manual de Créditos (+${rechargeAmount})`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar {rechargeAmount} Créditos
                </button>
              </div>
            </div>

          </div>

          {/* Transaction History Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Histórico Transacional Auditável (Ledger)
              </h3>
              <span className="text-xs text-slate-400">
                {creditTransactions.length} registros
              </span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/80">
                {creditTransactions.map((tx) => {
                  const isPositive = tx.delta > 0;
                  return (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isPositive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-200">{tx.reason}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono">
                              {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>•</span>
                            <span className="uppercase text-slate-400 tracking-wider">
                              {tx.referenceType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black font-mono ${
                          isPositive ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {isPositive ? `+${tx.delta}` : tx.delta} cr
                        </span>
                        <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-500">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Auditado</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Idempotência em geração cobrada garantida pela Seção 13 da especificação técnica.</span>
          <button
            onClick={() => setIsLedgerModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
