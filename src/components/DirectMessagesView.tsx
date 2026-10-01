import { useState } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { 
  MessageSquare, 
  Bot, 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  Pencil,
  Smartphone,
  Zap,
  Check,
  ShieldCheck,
  Radio,
  X
} from 'lucide-react';
import type { DirectAutoReplyRule, DirectMessageItem } from '../types/instagram';

export const DirectMessagesView = () => {
  const { config, addToast, autoReplyRules, updateAutoReplyRules } = useInstagram();

  // State
  const [isAutoreplyActive, setIsAutoreplyActive] = useState(true);
  const [rules, setRules] = useState<DirectAutoReplyRule[]>(autoReplyRules);
  
  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleCategory, setRuleCategory] = useState('');
  const [ruleKeywords, setRuleKeywords] = useState('');
  const [ruleReplyText, setRuleReplyText] = useState('');

  // Chat simulator
  const [simulatorInput, setSimulatorInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [simulatedMessages, setSimulatedMessages] = useState<DirectMessageItem[]>([
    {
      id: 'sim_1',
      senderName: 'Marcos Vinicius',
      senderHandle: '@marcos_vini',
      messageText: 'Olá! Quanto custa pra fazer uma música personalizada de casamento?',
      timestamp: '14:20',
      isIncoming: true,
    },
    {
      id: 'sim_2',
      senderName: 'NSMusic Bot',
      senderHandle: '@_nsmusic',
      messageText: 'Olá! Que bom ter você por aqui! 🎵 Nossas produções e músicas personalizadas contam com pacotes exclusivos. Você pode conferir todos os detalhes e solicitar a sua diretamente no nosso portal oficial: https://nsmusic.nsnexus.com.br ou nos conte qual é o seu projeto!',
      timestamp: '14:20',
      isIncoming: false,
      repliedAutomatically: true,
    }
  ]);

  // Open modal to create
  const handleOpenCreateModal = () => {
    setEditingRuleId(null);
    setRuleCategory('Vendas & Informações');
    setRuleKeywords('');
    setRuleReplyText('');
    setIsModalOpen(true);
  };

  // Open modal to edit existing rule
  const handleOpenEditModal = (rule: DirectAutoReplyRule) => {
    setEditingRuleId(rule.id);
    setRuleCategory(rule.category);
    setRuleKeywords(rule.keywords.join(', '));
    setRuleReplyText(rule.replyText);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRuleId(null);
    setRuleCategory('');
    setRuleKeywords('');
    setRuleReplyText('');
  };

  // Save rule (Create or Edit)
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKeywords.trim() || !ruleReplyText.trim()) {
      addToast('Preencha as palavras-chave e a resposta.', 'warning');
      return;
    }

    const keywordList = ruleKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    let updated: DirectAutoReplyRule[];

    if (editingRuleId) {
      // Edit existing
      updated = rules.map((r) =>
        r.id === editingRuleId
          ? {
              ...r,
              category: ruleCategory.trim() || 'Geral',
              keywords: keywordList,
              replyText: ruleReplyText.trim(),
            }
          : r
      );
      addToast('Regra de resposta atualizada com sucesso!', 'success');
    } else {
      // Create new
      const newRule: DirectAutoReplyRule = {
        id: 'rule_' + Date.now(),
        category: ruleCategory.trim() || 'Geral',
        keywords: keywordList,
        replyText: ruleReplyText.trim(),
        isActive: true,
      };
      updated = [...rules, newRule];
      addToast('Nova regra de Direct criada com sucesso!', 'success');
    }

    setRules(updated);
    updateAutoReplyRules(updated);
    handleCloseModal();
  };

  // Toggle active status
  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r));
    setRules(updated);
    updateAutoReplyRules(updated);
    addToast('Status da regra atualizado.', 'info');
  };

  // Delete rule
  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    updateAutoReplyRules(updated);
    addToast('Regra removida.', 'warning');
  };

  // Test simulation
  const handleSendSimulation = async (textToSend?: string) => {
    const message = textToSend || simulatorInput;
    if (!message.trim()) return;

    const userMsg: DirectMessageItem = {
      id: 'user_' + Date.now(),
      senderName: 'Seguidor Teste',
      senderHandle: '@seguidor_demo',
      messageText: message,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isIncoming: true,
    };

    setSimulatedMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setSimulatorInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyFound = '';
      const lower = message.toLowerCase();

      if (isAutoreplyActive) {
        for (const rule of rules) {
          if (!rule.isActive) continue;
          const match = rule.keywords.some((k) => lower.includes(k));
          if (match) {
            replyFound = rule.replyText;
            break;
          }
        }

        if (!replyFound) {
          replyFound = `Olá! Obrigado por entrar em contato com a @_nsmusic! 🎧 Recebemos sua mensagem sobre "${message}". Nosso produtor musical entrará em contato em breve ou acesse nsmusic.nsnexus.com.br!`;
        }
      }

      if (replyFound) {
        setSimulatedMessages((prev) => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            senderName: 'NSMusic Bot (IA)',
            senderHandle: '@_nsmusic',
            messageText: replyFound,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isIncoming: false,
            repliedAutomatically: true,
          }
        ]);
      }
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Automação de Direct & Mensagens
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Chatbot Inteligente
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Respostas instantâneas e automáticas para seguidores que enviarem Direct para <strong className="text-white">@{config.username}</strong>.
          </p>
        </div>

        {/* Global Auto-responder status */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold pl-2">Auto-Resposta:</span>
          <button
            type="button"
            onClick={() => {
              const next = !isAutoreplyActive;
              setIsAutoreplyActive(next);
              addToast(
                next ? 'Auto-respostas ativadas!' : 'Auto-respostas pausadas.',
                next ? 'success' : 'warning'
              );
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isAutoreplyActive
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoreplyActive ? 'bg-white animate-pulse' : 'bg-slate-500'}`}></span>
            {isAutoreplyActive ? 'Ligado 24/7' : 'Desativado'}
          </button>
        </div>
      </div>

      {/* Meta API Permissions Info Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Status das Permissões Meta Graph API
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Feed & Reels Ativos
                </span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sua conta <strong className="text-slate-200">@{config.username}</strong> está 100% validada para postagens. Para receber conversas em tempo real direto pela API do Instagram, a Meta exige a liberação de ferramentas conectadas no app do celular:
              </p>
            </div>
          </div>
        </div>

        {/* 2-Step Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                No App do Instagram (Celular):
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Abra seu perfil ➔ Configurações ➔ <em>Mensagens e respostas ao story</em> ➔ <em>Controles de mensagens</em> ➔ Marque <strong>"Permitir acesso às mensagens"</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Permissão de Mensagens no Meta Token:
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                No Meta Graph API Explorer, basta marcar o escopo <code className="text-pink-400 font-mono">instagram_manage_messages</code> para entrega contínua dos directs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Rules Manager (7 cols) + Simulator (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Rules Manager (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  Regras de Resposta Automática
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clique em <strong>Editar</strong> para alterar o texto ou crie uma nova regra
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Regra</span>
              </button>
            </div>

            {/* List of rules */}
            <div className="space-y-3.5">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    rule.isActive
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-pink-500/15 text-pink-400 border border-pink-500/30">
                          {rule.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-wrap">
                          <span className="text-slate-500">Gatilhos:</span>
                          {rule.keywords.map((kw, i) => (
                            <code key={i} className="text-slate-200 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 font-mono text-[10px]">
                              {kw}
                            </code>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        "{rule.replyText}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="Editar esta resposta"
                      >
                        <Pencil className="w-3.5 h-3.5 text-pink-400" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          rule.isActive ? 'bg-pink-500' : 'bg-slate-800'
                        }`}
                        title={rule.isActive ? 'Desativar regra' : 'Ativar regra'}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                            rule.isActive ? 'left-4.5' : 'left-0.75'
                          }`}
                        />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        title="Excluir regra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right: Live Interactive Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-instagram-gradient flex items-center justify-center text-white">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Simulador de Direct em Tempo Real</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Respondendo como @{config.username}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Teste Ativo
              </span>
            </div>

            {/* Quick Test Prompts */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSendSimulation('Qual o valor da música personalizada?')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-pink-500/40 transition-colors cursor-pointer"
              >
                💸 Testar Preço
              </button>
              <button
                type="button"
                onClick={() => handleSendSimulation('Vocês fazem parceria com DJ?')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-pink-500/40 transition-colors cursor-pointer"
              >
                🤝 Testar Parceria
              </button>
              <button
                type="button"
                onClick={() => handleSendSimulation('Como funciona a plataforma de IA?')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-pink-500/40 transition-colors cursor-pointer"
              >
                🤖 Testar Dúvida IA
              </button>
            </div>

            {/* Chat Box */}
            <div className="h-80 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col no-scrollbar">
              {simulatedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.isIncoming ? 'self-start items-start' : 'self-end items-end'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 px-1 mb-0.5">
                    {msg.senderName} • {msg.timestamp}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.isIncoming
                        ? 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-sm'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-tr-sm shadow-md shadow-pink-500/20'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.messageText}</p>
                    {msg.repliedAutomatically && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-pink-200 font-semibold mt-1 opacity-90">
                        <Check className="w-2.5 h-2.5" /> Resposta Automática
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="self-end p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-pink-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                  <span className="text-[11px] text-slate-400">NSMusic Bot gerando resposta...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={simulatorInput}
                onChange={(e) => setSimulatorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendSimulation();
                }}
                placeholder="Simular mensagem recebida de um fã..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => handleSendSimulation()}
                className="px-3.5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* POPUP MODAL CENTERED: ADICIONAR OU EDITAR REGRA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                {editingRuleId ? 'Editar Resposta Automática' : 'Criar Nova Automação de Direct'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Categoria da Regra:</label>
                  <input
                    type="text"
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    placeholder="Ex: Vendas, Orçamentos, Parcerias"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Gatilhos (separados por vírgula):</label>
                  <input
                    type="text"
                    value={ruleKeywords}
                    onChange={(e) => setRuleKeywords(e.target.value)}
                    placeholder="Ex: valor, preco, comprar, tabela"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mensagem que o Bot deve responder no Direct:</label>
                <textarea
                  rows={4}
                  value={ruleReplyText}
                  onChange={(e) => setRuleReplyText(e.target.value)}
                  placeholder="Digite aqui o texto que será enviado automaticamente no Instagram..."
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-instagram-gradient text-white shadow-lg shadow-pink-500/25 hover:opacity-95 cursor-pointer"
                >
                  {editingRuleId ? 'Salvar Alterações' : 'Criar Regra'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
