import { useState } from 'react';
import type { 
  ContentAutomationRule, 
  AutomationContentType, 
  AutomationMediaFormat, 
  AutomationExecutionMode, 
  AutomationPlatform 
} from '../types/instagram';
import { 
  X, 
  Sparkles, 
  Clock, 
  Calendar, 
  Music, 
  Building2, 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  Bot,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface AutomationRuleModalProps {
  rule?: ContentAutomationRule | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleData: Partial<ContentAutomationRule> & { name: string }) => Promise<void>;
}

export const AutomationRuleModal = ({ rule, isOpen, onClose, onSave }: AutomationRuleModalProps) => {
  const [name, setName] = useState(rule?.name || '');
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [mode, setMode] = useState<AutomationExecutionMode>(rule?.mode || 'AUTOMATICO');
  const [contentType, setContentType] = useState<AutomationContentType>(rule?.contentType || 'MUSICA_CLIENTE');
  const [mediaFormat, setMediaFormat] = useState<AutomationMediaFormat>(rule?.mediaFormat || 'REELS');
  const [platforms, setPlatforms] = useState<AutomationPlatform[]>(rule?.platforms || ['INSTAGRAM']);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(rule?.daysOfWeek || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']);
  const [scheduledTime, setScheduledTime] = useState(rule?.scheduledTime || '10:00');
  const [audioClipDuration, setAudioClipDuration] = useState(rule?.audioClipDuration || 45);
  const [aiModel, setAiModel] = useState(rule?.aiModel || 'gpt-6-astra');
  const [imageModel, setImageModel] = useState(rule?.imageModel || 'gpt-image-2.5-sunburst');
  const [customPrompt, setCustomPrompt] = useState(rule?.customPrompt || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const daysList = [
    { id: 'seg', label: 'Seg' },
    { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' },
    { id: 'sex', label: 'Sex' },
    { id: 'sab', label: 'Sáb' },
    { id: 'dom', label: 'Dom' },
  ];

  const toggleDay = (day: string) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const togglePlatform = (p: AutomationPlatform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((item) => item !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        id: rule?.id,
        name: name.trim(),
        isActive,
        mode,
        contentType,
        mediaFormat,
        platforms,
        daysOfWeek,
        scheduledTime,
        audioClipDuration,
        aiModel,
        imageModel,
        customPrompt: customPrompt.trim(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-pink-500/10 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {rule ? 'Editar Regra de Automação' : 'Nova Regra de Automação'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure os parâmetros de disparo, IA e destino das publicações automáticas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          
          {/* Nome & Ativo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Nome da Automação</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Músicas de Clientes Diárias (10:00)"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isActive ? 'Ativa' : 'Pausada'}
              </button>
            </div>
          </div>

          {/* Tipo de Conteúdo & Modo de Execução */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Tipo de Conteúdo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setContentType('MUSICA_CLIENTE');
                    setMediaFormat('REELS');
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                    contentType === 'MUSICA_CLIENTE'
                      ? 'bg-pink-500/10 border-pink-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Music className="w-5 h-5 text-pink-400" />
                  <span className="text-xs font-bold">Música de Cliente</span>
                  <span className="text-[10px] text-slate-500">Banco NS Music</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContentType('INSTITUCIONAL');
                    setMediaFormat('FEED');
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                    contentType === 'INSTITUCIONAL'
                      ? 'bg-pink-500/10 border-pink-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold">Institucional</span>
                  <span className="text-[10px] text-slate-500">Marca NS Music</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Modo de Publicação</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('AUTOMATICO')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                    mode === 'AUTOMATICO'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold">100% Automático</span>
                  <span className="text-[10px] text-slate-500">Gera e publica só</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('APROVACAO')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                    mode === 'APROVACAO'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">Modo Aprovação</span>
                  <span className="text-[10px] text-slate-500">Aguarda seu clique</span>
                </button>
              </div>
            </div>

          </div>

          {/* Formato da Mídia & Duração de Trecho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Formato da Mídia</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMediaFormat('REELS')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    mediaFormat === 'REELS'
                      ? 'bg-rose-500/20 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>Reels (1080x1920)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaFormat('FEED')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    mediaFormat === 'FEED'
                      ? 'bg-rose-500/20 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  <span>Feed (Imagem)</span>
                </button>
              </div>
            </div>

            {mediaFormat === 'REELS' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Duração do Trecho Musical</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setAudioClipDuration(sec)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        audioClipDuration === sec
                          ? 'bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {sec} segundos
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Horário & Dias da Semana */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                <span>Horário Diário</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>Dias de Publicação</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysList.map((d) => {
                  const isSelected = daysOfWeek.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDay(d.id)}
                      className={`flex-1 min-w-[42px] py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-sm'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Redes Sociais */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Destino (Redes Sociais)</label>
            <div className="flex flex-wrap gap-2.5">
              {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as AutomationPlatform[]).map((p) => {
                const isSelected = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-pink-500 text-white border-pink-400 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                    <span>{p === 'INSTAGRAM' ? 'Instagram (@_nsmusic)' : p === 'FACEBOOK' ? 'Facebook Oficial' : 'TikTok (Em Breve)'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modelos de IA: GPT-6 Astra & Imagem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modelo GPT (Criação de Copy & Roteiro)</span>
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-pink-500"
              >
                <option value="gpt-6-astra">⭐ GPT-6 Astra (Máxima Criatividade & Emoção)</option>
                <option value="gpt-6.1-sol">GPT-6.1 Sol (Ultra Rápido & Fluido)</option>
                <option value="gpt-5.4-pro">GPT-5.4 Pro (Raciocínio Profundo)</option>
                <option value="gpt-4o">GPT-4o (Clássico)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Modelo de Geração de Imagem</span>
              </label>
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-pink-500"
              >
                <option value="gpt-image-2.5-sunburst">⭐ GPT-Image 2.5 Sunburst (Ultra Alta Definição)</option>
                <option value="dall-e-3">DALL-E 3 (OpenAI Padrão)</option>
              </select>
            </div>

          </div>

          {/* Prompt Customizado */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Prompt Adicional / Instrução Específica para a IA
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              placeholder="Ex: Foque em transmitir o carinho familiar e adicione sempre o link da bio nsmusic.nsnexus.com.br..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Regra'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
