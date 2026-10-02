import { useState, useEffect } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { SupabaseService } from '../services/supabaseService';
import { AiContentService } from '../services/aiContentService';
import { ReelGenerator } from '../services/reelGenerator';
import type { 
  ContentAutomationRule, 
  ContentAutomationLog, 
  ClientSongItem 
} from '../types/instagram';
import { AutomationRuleModal } from './AutomationRuleModal';
import { PostInspectionModal } from './PostInspectionModal';
import { ContentCalendarView } from './ContentCalendarView';
import { ContentHistoryView } from './ContentHistoryView';
import { AuthorizedSongsView } from './AuthorizedSongsView';
import { 
  Bot, 
  Sparkles, 
  Calendar, 
  Clock, 
  History, 
  Music, 
  Plus, 
  Play, 
  ShieldCheck, 
  Zap, 
  RotateCw, 
  Building2, 
  Edit2, 
  Trash2
} from 'lucide-react';

export const ContentAutomationView = () => {
  const { config, addToast } = useInstagram();
  
  // Navigation Sub-tab
  const [subTab, setSubTab] = useState<'rules' | 'calendar' | 'approval' | 'songs' | 'history'>('rules');

  // State
  const [rules, setRules] = useState<ContentAutomationRule[]>([]);
  const [logs, setLogs] = useState<ContentAutomationLog[]>([]);
  const [songs, setSongs] = useState<ClientSongItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ContentAutomationRule | null>(null);
  const [inspectingLog, setInspectingLog] = useState<ContentAutomationLog | null>(null);

  // Execution State
  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null);
  const [executionStatusText, setExecutionStatusText] = useState<string>('');
  const [executionProgress, setExecutionProgress] = useState<number>(0);

  // Carrega dados iniciais do Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedRules, fetchedLogs, fetchedSongs] = await Promise.all([
        SupabaseService.getAutomationRules(),
        SupabaseService.getAutomationLogs(),
        SupabaseService.getClientSongs(false, 100),
      ]);
      setRules(fetchedRules);
      setLogs(fetchedLogs);
      setSongs(fetchedSongs);
    } catch (err: any) {
      console.error('[ContentAutomationView] loadData error:', err);
      addToast('Erro ao sincronizar com o banco de dados da NS Music.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Salvar Regra
  const handleSaveRule = async (ruleData: Partial<ContentAutomationRule> & { name: string }) => {
    const success = await SupabaseService.upsertAutomationRule(ruleData);
    if (success) {
      addToast('Regra de automação salva com sucesso no banco de dados!', 'success');
      const updated = await SupabaseService.getAutomationRules();
      setRules(updated);
    } else {
      addToast('Falha ao salvar regra de automação.', 'error');
    }
  };

  // Alternar Status da Regra
  const handleToggleRuleActive = async (rule: ContentAutomationRule) => {
    const success = await SupabaseService.upsertAutomationRule({
      ...rule,
      isActive: !rule.isActive,
    });
    if (success) {
      setRules(rules.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)));
      addToast(`Regra "${rule.name}" ${!rule.isActive ? 'ativada' : 'pausada'}.`, 'info');
    }
  };

  // Deletar Regra
  const handleDeleteRule = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta regra de automação?')) return;
    const success = await SupabaseService.deleteAutomationRule(id);
    if (success) {
      setRules(rules.filter((r) => r.id !== id));
      addToast('Regra removida com sucesso.', 'info');
    }
  };

  // Toggle de Autorização de Marketing para Música
  const handleToggleSongAuthorization = async (songId: string, authorized: boolean) => {
    const success = await SupabaseService.toggleMusicMarketingAuthorization(songId, authorized);
    if (success) {
      setSongs(songs.map((s) => (s.id === songId ? { ...s, authorizedForMarketing: authorized } : s)));
      addToast(
        authorized
          ? 'Música autorizada para uso nas publicações da NS Music!'
          : 'Autorização de marketing removida.',
        'success'
      );
    }
  };

  // DISPARAR AUTOMAÇÃO MANUALMENTE (Música de Cliente ou Institucional)
  const handleTriggerAutomation = async (rule: ContentAutomationRule) => {
    setExecutingRuleId(rule.id);
    setExecutionProgress(10);
    setExecutionStatusText(`Iniciando automação com ${rule.aiModel.toUpperCase()}...`);

    try {
      if (rule.contentType === 'MUSICA_CLIENTE') {
        // 1. Busca música autorizada no banco
        setExecutionStatusText('Buscando música autorizada no banco da NS Music...');
        setExecutionProgress(20);

        const eligibleSong = await SupabaseService.getRandomEligibleSong();
        if (!eligibleSong) {
          throw new Error('Nenhuma música autorizada disponível no banco. Acesse a aba "Músicas do Banco" e autorize ao menos uma canção.');
        }

        // 2. GPT-6 gera o conceito, roteiro e copy
        setExecutionStatusText(`GPT-6 criando conceito visual para "${eligibleSong.musicStyle}"...`);
        setExecutionProgress(40);

        const aiResult = await AiContentService.generateClientSongContent(
          eligibleSong,
          rule.customPrompt,
          rule.aiModel,
          rule.imageModel
        );

        let finalVideoUrl: string | undefined = undefined;

        // 3. Se for formato REELS, gera vídeo vertical 1080x1920 com áudio do cliente
        if (rule.mediaFormat === 'REELS' && eligibleSong.audioUrl) {
          setExecutionStatusText('Renderizando Reel 1080x1920 com onda sonora e áudio do cliente...');
          setExecutionProgress(60);

          try {
            const reelResult = await ReelGenerator.renderReelVideo({
              imageUrl: aiResult.imageUrl,
              audioUrl: eligibleSong.audioUrl,
              songTitle: `${eligibleSong.honoreeName} - Canção Especial`,
              customerName: eligibleSong.customerName,
              honoreeName: eligibleSong.honoreeName,
              musicStyle: eligibleSong.musicStyle,
              durationSeconds: rule.audioClipDuration || 45,
              onProgress: (p, text) => {
                setExecutionProgress(Math.floor(60 + (p * 0.25)));
                setExecutionStatusText(text);
              },
            });
            finalVideoUrl = reelResult.videoUrl;
          } catch (renderErr) {
            console.warn('[ReelGenerator] Fallback para imagem estática:', renderErr);
          }
        }

        // 4. Salva Log no Supabase
        const isAutomatic = rule.mode === 'AUTOMATICO';
        const initialStatus = isAutomatic ? 'PUBLICANDO' : 'AGUARDANDO_APROVACAO';

        setExecutionStatusText(isAutomatic ? 'Enviando post para a Meta Graph API...' : 'Salvando post na fila de aprovação...');
        setExecutionProgress(85);

        const logEntry = await SupabaseService.upsertAutomationLog({
          automationId: rule.id,
          automationName: rule.name,
          contentType: 'MUSICA_CLIENTE',
          mediaFormat: rule.mediaFormat,
          platforms: rule.platforms,
          status: initialStatus,
          orderId: eligibleSong.id,
          orderNumber: eligibleSong.orderNumber,
          customerName: eligibleSong.customerName,
          honoreeName: eligibleSong.honoreeName,
          musicStyle: eligibleSong.musicStyle,
          occasion: eligibleSong.occasion,
          audioUrl: eligibleSong.audioUrl,
          themeConcept: aiResult.theme,
          imagePrompt: aiResult.imagePrompt,
          imageUrl: aiResult.imageUrl,
          videoUrl: finalVideoUrl,
          caption: aiResult.caption,
          hashtags: aiResult.hashtags,
        });

        // 5. Se for AUTOMÁTICO, publica direto no Instagram
        if (isAutomatic && logEntry) {
          await publishPostToMeta(logEntry);
          await SupabaseService.markSongAsPublished(eligibleSong.id);
        } else {
          addToast('🎉 Post gerado com sucesso pelo GPT-6 e aguardando sua aprovação!', 'success');
        }

      } else {
        // TIPO INSTITUCIONAL
        setExecutionStatusText(`GPT-6 criando conteúdo institucional exclusivo da marca...`);
        setExecutionProgress(40);

        const aiResult = await AiContentService.generateInstitutionalContent(
          undefined,
          rule.customPrompt,
          rule.aiModel,
          rule.imageModel
        );

        const isAutomatic = rule.mode === 'AUTOMATICO';
        const initialStatus = isAutomatic ? 'PUBLICANDO' : 'AGUARDANDO_APROVACAO';

        setExecutionStatusText(isAutomatic ? 'Enviando post para a Meta Graph API...' : 'Salvando post institucional na fila...');
        setExecutionProgress(85);

        const logEntry = await SupabaseService.upsertAutomationLog({
          automationId: rule.id,
          automationName: rule.name,
          contentType: 'INSTITUCIONAL',
          mediaFormat: rule.mediaFormat,
          platforms: rule.platforms,
          status: initialStatus,
          themeConcept: aiResult.theme,
          imagePrompt: aiResult.imagePrompt,
          imageUrl: aiResult.imageUrl,
          caption: aiResult.caption,
          hashtags: aiResult.hashtags,
        });

        if (isAutomatic && logEntry) {
          await publishPostToMeta(logEntry);
        } else {
          addToast('🎉 Conteúdo institucional gerado com sucesso e aguardando aprovação!', 'success');
        }
      }

      // Recarrega logs e músicas atualizados
      const [updatedLogs, updatedSongs] = await Promise.all([
        SupabaseService.getAutomationLogs(),
        SupabaseService.getClientSongs(false, 100),
      ]);
      setLogs(updatedLogs);
      setSongs(updatedSongs);

    } catch (err: any) {
      console.error('[handleTriggerAutomation] error:', err);
      addToast(err?.message || 'Erro ao executar automação.', 'error');
    } finally {
      setExecutingRuleId(null);
      setExecutionStatusText('');
      setExecutionProgress(0);
    }
  };

  // Publica Post na Meta Graph API (Reel ou Feed)
  const publishPostToMeta = async (log: ContentAutomationLog) => {
    try {
      const igId = config.instagramAccountId || '17841442031250300';
      const metaToken = config.accessToken;

      if (!metaToken) {
        throw new Error('Token da Meta API não configurado.');
      }

      // Cria container na Meta
      const containerUrl = `https://graph.facebook.com/v21.0/${igId}/media`;
      const isReel = log.mediaFormat === 'REELS' && log.videoUrl;

      const bodyPayload: any = {
        caption: log.caption,
        access_token: metaToken,
      };

      if (isReel) {
        bodyPayload.media_type = 'REELS';
        bodyPayload.video_url = log.videoUrl;
      } else {
        bodyPayload.image_url = log.imageUrl;
      }

      const containerRes = await fetch(containerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const containerData = await containerRes.json();
      if (!containerData.id) {
        throw new Error(`Erro ao criar container no Instagram: ${JSON.stringify(containerData)}`);
      }

      const creationId = containerData.id;

      // Aguarda 3 segundos para a Meta processar a mídia
      await new Promise((r) => setTimeout(r, 3500));

      // Publica no Feed / Reels
      const publishUrl = `https://graph.facebook.com/v21.0/${igId}/media_publish`;
      const publishRes = await fetch(publishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: metaToken,
        }),
      });

      const publishData = await publishRes.json();
      if (!publishData.id) {
        throw new Error(`Erro na publicação final Meta: ${JSON.stringify(publishData)}`);
      }

      // Atualiza status do log no Supabase para PUBLICADO
      await SupabaseService.upsertAutomationLog({
        ...log,
        status: 'PUBLICADO',
        metaCreationId: creationId,
        metaPostId: publishData.id,
        publishedAt: new Date().toISOString(),
      });

      addToast(`🚀 Post publicado com sucesso no @_nsmusic! (ID: ${publishData.id})`, 'success');

    } catch (err: any) {
      console.error('[publishPostToMeta] error:', err);
      await SupabaseService.upsertAutomationLog({
        ...log,
        status: 'FALHA',
        errorMessage: err.message,
      });
      addToast(`Falha ao publicar post: ${err.message}`, 'error');
    }
  };

  // Disparo manual para uma música específica da lista
  const handleTriggerSpecificSong = (song: ClientSongItem) => {
    const customRule: ContentAutomationRule = {
      id: `manual_${song.id}`,
      name: `Post Avulso: ${song.honoreeName}`,
      isActive: true,
      mode: 'APROVACAO',
      contentType: 'MUSICA_CLIENTE',
      mediaFormat: 'REELS',
      platforms: ['INSTAGRAM'],
      daysOfWeek: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
      scheduledTime: '10:00',
      audioClipDuration: 45,
      aiModel: 'gpt-6-astra',
      imageModel: 'gpt-image-2.5-sunburst',
      customPrompt: '',
    };
    handleTriggerAutomation(customRule);
  };

  // Contador de posts aguardando aprovação
  const pendingApprovalLogs = logs.filter((l) => l.status === 'AGUARDANDO_APROVACAO');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Automação Inteligente NS Music</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              <span>Motor GPT-6 Astra Ativo</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Automação de Conteúdo
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Programação e publicação 100% autônoma de Músicas de Clientes (Reels 1080x1920) e Conteúdo Institucional diário.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingRule(null);
              setIsRuleModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Regra</span>
          </button>
        </div>
      </div>

      {/* Execution Progress Bar (when triggering) */}
      {executingRuleId && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-pink-500/40 shadow-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-pink-400 flex items-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin" />
              {executionStatusText}
            </span>
            <span className="text-slate-400">{executionProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 rounded-full"
              style={{ width: `${executionProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        
        <button
          onClick={() => setSubTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'rules'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Regras de Automação ({rules.length})</span>
        </button>

        <button
          onClick={() => setSubTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'calendar'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendário de Publicações</span>
        </button>

        <button
          onClick={() => setSubTab('approval')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
            subTab === 'approval'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Fila de Aprovação</span>
          {pendingApprovalLogs.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center animate-bounce">
              {pendingApprovalLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('songs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'songs'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Músicas do Banco (NS Music)</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'history'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico & Auditoria</span>
        </button>

      </div>

      {/* TAB CONTENT: RULES */}
      {subTab === 'rules' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule) => {
              const isExecuting = executingRuleId === rule.id;

              return (
                <div
                  key={rule.id}
                  className={`bg-slate-900 border rounded-3xl p-6 transition-all relative flex flex-col justify-between ${
                    rule.isActive
                      ? 'border-slate-800 hover:border-pink-500/40 shadow-xl'
                      : 'border-slate-800/40 opacity-70'
                  }`}
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
                            rule.contentType === 'MUSICA_CLIENTE'
                              ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/20'
                              : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20'
                          }`}
                        >
                          {rule.contentType === 'MUSICA_CLIENTE' ? (
                            <Music className="w-5 h-5" />
                          ) : (
                            <Building2 className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{rule.name}</span>
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-semibold text-pink-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {rule.scheduledTime}
                            </span>
                            <span>•</span>
                            <span>{rule.mediaFormat === 'REELS' ? 'Reels 1080x1920' : 'Feed'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleRuleActive(rule)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          rule.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {rule.isActive ? 'Ativa' : 'Pausada'}
                      </button>
                    </div>

                    {/* Metadata Pills */}
                    <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Modo</span>
                        <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                          {rule.mode === 'AUTOMATICO' ? (
                            <>
                              <Zap className="w-3 h-3 text-emerald-400" />
                              <span>100% Automático</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              <span>Modo Aprovação</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Modelo IA</span>
                        <span className="font-bold text-emerald-400 block mt-0.5 truncate">
                          {rule.aiModel}
                        </span>
                      </div>
                    </div>

                    {/* Dias Ativos */}
                    <div className="flex items-center gap-1 my-3">
                      {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((d) => {
                        const active = rule.daysOfWeek.includes(d);
                        return (
                          <span
                            key={d}
                            className={`flex-1 py-1 rounded-lg text-center text-[10px] font-bold uppercase ${
                              active
                                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                : 'bg-slate-950 text-slate-600 border border-slate-800'
                            }`}
                          >
                            {d}
                          </span>
                        );
                      })}
                    </div>

                    {/* Custom Prompt Preview */}
                    {rule.customPrompt && (
                      <p className="text-slate-400 text-xs italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 line-clamp-2 my-3">
                        "{rule.customPrompt}"
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800 mt-4">
                    <button
                      onClick={() => handleTriggerAutomation(rule)}
                      disabled={isExecuting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-pink-500/20 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isExecuting ? 'Executando...' : 'Executar Agora'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setIsRuleModalOpen(true);
                      }}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                      title="Editar Regra"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                      title="Excluir Regra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CALENDAR */}
      {subTab === 'calendar' && (
        <ContentCalendarView
          logs={logs}
          onSelectPost={(post) => setInspectingLog(post)}
        />
      )}

      {/* TAB CONTENT: APPROVAL QUEUE */}
      {subTab === 'approval' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Fila de Posts Aguardando Aprovação</span>
              </h2>
              <p className="text-xs text-slate-400">
                Revise os vídeos, capas e legendas criadas pela IA antes de disparar no Instagram
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {pendingApprovalLogs.length} Pendentes
            </span>
          </div>

          <ContentHistoryView
            logs={pendingApprovalLogs}
            onSelectPost={(post) => setInspectingLog(post)}
            onApprovePost={async (log) => {
              await publishPostToMeta(log);
              const updated = await SupabaseService.getAutomationLogs();
              setLogs(updated);
            }}
            onRetryPost={async (log) => {
              await publishPostToMeta(log);
            }}
            onDeleteLog={async (id) => {
              await SupabaseService.deleteAutomationLog(id);
              setLogs(logs.filter((l) => l.id !== id));
            }}
          />
        </div>
      )}

      {/* TAB CONTENT: SONGS FROM DATABASE */}
      {subTab === 'songs' && (
        <AuthorizedSongsView
          songs={songs}
          isLoading={isLoading}
          onToggleAuthorization={handleToggleSongAuthorization}
          onTriggerSongAutomation={handleTriggerSpecificSong}
          onRefresh={loadData}
        />
      )}

      {/* TAB CONTENT: HISTORY & AUDIT */}
      {subTab === 'history' && (
        <ContentHistoryView
          logs={logs}
          onSelectPost={(post) => setInspectingLog(post)}
          onApprovePost={async (log) => {
            await publishPostToMeta(log);
            const updated = await SupabaseService.getAutomationLogs();
            setLogs(updated);
          }}
          onRetryPost={async (log) => {
            await publishPostToMeta(log);
            const updated = await SupabaseService.getAutomationLogs();
            setLogs(updated);
          }}
          onDeleteLog={async (id) => {
            await SupabaseService.deleteAutomationLog(id);
            setLogs(logs.filter((l) => l.id !== id));
          }}
        />
      )}

      {/* MODALS */}
      <AutomationRuleModal
        isOpen={isRuleModalOpen}
        rule={editingRule}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
      />

      <PostInspectionModal
        isOpen={Boolean(inspectingLog)}
        log={inspectingLog}
        onClose={() => setInspectingLog(null)}
        onApproveAndPublish={async (log) => {
          await publishPostToMeta(log);
          const updated = await SupabaseService.getAutomationLogs();
          setLogs(updated);
        }}
        onRetry={async (log) => {
          await publishPostToMeta(log);
          const updated = await SupabaseService.getAutomationLogs();
          setLogs(updated);
        }}
        onDelete={async (id) => {
          await SupabaseService.deleteAutomationLog(id);
          setLogs(logs.filter((l) => l.id !== id));
        }}
      />

    </div>
  );
};
