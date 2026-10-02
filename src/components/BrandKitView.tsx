import React, { useState, useEffect } from 'react';
import { useBrand } from '../context/BrandContext';
import { useInstagram } from '../context/InstagramContext';
import { 
  Building2, 
  Palette, 
  Type, 
  MessageSquare, 
  ShieldAlert, 
  Save, 
  Plus, 
  Trash2, 
  Globe, 
  Brain, 
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import type { ContentObjective } from '../types/brand';
import { understandInstagramProfileWithAi, fetchInstagramProfileData } from '../services/instagramAiIngestion';

export const BrandKitView: React.FC = () => {
  const { activeBrand, updateBrand } = useBrand();
  const { config, addToast, setActiveTab } = useInstagram();

  const [formData, setFormData] = useState(activeBrand);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setFormData(activeBrand);
  }, [activeBrand]);

  const handleAnalyzeInstagram = async () => {
    setIsSyncing(true);
    try {
      addToast(`Conectando e analisando perfil ${activeBrand.handle}...`, 'info');
      let profileData = {};
      if (config.accessToken && config.instagramAccountId) {
        profileData = await fetchInstagramProfileData(config.instagramAccountId, config.accessToken);
      }

      const understood = await understandInstagramProfileWithAi({
        handle: activeBrand.handle,
        name: (profileData as any).name || activeBrand.name,
        biography: (profileData as any).biography,
        profilePictureUrl: (profileData as any).profilePictureUrl || activeBrand.logoUrl,
        website: (profileData as any).website || activeBrand.websiteUrl,
        recentCaptions: (profileData as any).recentCaptions,
      });

      const updated = {
        ...formData,
        name: understood.name,
        niche: understood.niche,
        description: understood.description,
        targetAudience: understood.targetAudience,
        toneOfVoice: understood.toneOfVoice,
        defaultCta: understood.defaultCta,
        colors: understood.colors,
        pillars: understood.pillars,
        brandMemoryJson: understood.brandMemoryJson,
      };

      setFormData(updated);
      updateBrand(activeBrand.id, updated);
      addToast(`🎉 Brand Kit da ${understood.name} calibrado automaticamente pela IA via Instagram!`, 'success');
      setIsSavedAlert(true);
      setTimeout(() => setIsSavedAlert(false), 3000);
    } catch (e: any) {
      addToast(`Erro ao analisar perfil: ${e.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrand(activeBrand.id, formData);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleAddPillar = () => {
    const newPillar = {
      id: `pillar_${Date.now()}`,
      name: 'Novo Pilar Editorial',
      objective: 'educar' as ContentObjective,
      description: 'Descrição do tema e abordagem',
      suggestedFormats: ['carousel' as const, 'feed' as const],
    };
    setFormData({
      ...formData,
      pillars: [...formData.pillars, newPillar],
    });
  };

  const handleRemovePillar = (id: string) => {
    setFormData({
      ...formData,
      pillars: formData.pillars.filter((p) => p.id !== id),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold overflow-hidden ring-2 ring-pink-500/40"
              style={{ backgroundColor: activeBrand.colors.primary }}
            >
              <img 
                src={config.avatarUrl || activeBrand.logoUrl} 
                alt={activeBrand.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Diretrizes do Perfil — {activeBrand.handle}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {config.isConnected ? 'Perfil Oficial Conectado' : 'Instagram'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Dados reais: biografia, tom de voz das publicações e pilares da conta @{config.username} ({config.followersCount || 811} seguidores)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAnalyzeInstagram}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="A IA analisa a bio, legendas e fotos do Instagram para preencher ou calibrar as diretrizes"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Lendo Instagram...' : 'Escanear Perfil com IA'}</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gerenciar Conexão Meta</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {isSavedAlert && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Brand Kit atualizado com sucesso! As próximas gerações de conteúdo usarão estes parâmetros.</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Form inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Informações Gerais */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-pink-400" />
              Posicionamento & Negócio
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome da Marca</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Perfil / Handle</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nicho de Mercado</label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Descrição & Diferenciais</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Público-Alvo</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Website Oficial</label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Tom de Voz & Diretrizes */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Tom de Voz & Diretrizes de Copy
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tom de Voz Principal</label>
                <input
                  type="text"
                  value={formData.toneOfVoice}
                  onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
                  placeholder="Ex: Emocionante, Jovem, Técnico, Autoritário"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Chamada para Ação Padrão (CTA)</label>
                <input
                  type="text"
                  value={formData.defaultCta}
                  onChange={(e) => setFormData({ ...formData, defaultCta: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Palavras & Assuntos Proibidos
                </label>
                <input
                  type="text"
                  value={formData.forbiddenWords.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      forbiddenWords: e.target.value.split(',').map((w) => w.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-rose-500/30 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  Exemplo de Copy Aprovada (Bom Exemplo para IA)
                </label>
                <textarea
                  rows={2}
                  value={formData.toneExamplesGood[0] || ''}
                  onChange={(e) => {
                    const copy = [...formData.toneExamplesGood];
                    copy[0] = e.target.value;
                    setFormData({ ...formData, toneExamplesGood: copy });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Pilares Editoriais */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Pilares Editoriais Estratégicos
              </h2>
              <button
                type="button"
                onClick={handleAddPillar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Pilar</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.pillars.map((pillar, idx) => (
                <div key={pillar.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={pillar.name}
                        onChange={(e) => {
                          const updated = [...formData.pillars];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, pillars: updated });
                        }}
                        className="font-bold text-xs text-white bg-transparent border-b border-slate-700 focus:border-pink-500 pb-0.5 focus:outline-none"
                      />
                      <select
                        value={pillar.objective}
                        onChange={(e) => {
                          const updated = [...formData.pillars];
                          updated[idx].objective = e.target.value as ContentObjective;
                          setFormData({ ...formData, pillars: updated });
                        }}
                        className="text-[10px] font-bold uppercase rounded-lg px-2 py-1 bg-slate-800 text-pink-400 border border-slate-700"
                      >
                        <option value="vender">Vender</option>
                        <option value="educar">Educar</option>
                        <option value="autoridade">Autoridade</option>
                        <option value="engajamento">Engajamento</option>
                        <option value="trafego">Tráfego</option>
                        <option value="crescimento">Crescimento</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      value={pillar.description}
                      onChange={(e) => {
                        const updated = [...formData.pillars];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, pillars: updated });
                      }}
                      placeholder="Descrição da abordagem editorial"
                      className="w-full text-xs text-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePillar(pillar.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Visual Tokens & Live Preview */}
        <div className="space-y-6">
          
          {/* Card: Design Tokens / Cores */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              Design Tokens (Cores Oficiais)
            </h2>

            <div className="space-y-3">
              {[
                { label: 'Cor Primária', key: 'primary', val: formData.colors.primary },
                { label: 'Cor Secundária', key: 'secondary', val: formData.colors.secondary },
                { label: 'Fundo dos Posts', key: 'background', val: formData.colors.background },
                { label: 'Cor dos Textos', key: 'text', val: formData.colors.text },
                { label: 'Cor de Destaque / Badge', key: 'accent', val: formData.colors.accent },
              ].map((c) => (
                <div key={c.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-300 font-medium">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">{c.val}</span>
                    <input
                      type="color"
                      value={c.val}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: { ...formData.colors, [c.key]: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Typography */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-400" />
                Tipografia do Brand Kit
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Títulos / Headlines:</span>
                  <p className="text-xs font-bold text-white">Outfit / Sans Bold</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Corpo / Legendas:</span>
                  <p className="text-xs text-slate-300">Inter / Clean Regular</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Preview em Tempo Real</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Tokens Vivos
              </span>
            </h2>

            <div 
              className="p-6 rounded-2xl border shadow-2xl relative overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: formData.colors.background,
                borderColor: formData.colors.primary,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: formData.colors.primary }}
                  >
                    {formData.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: formData.colors.accent }}>
                    {formData.handle}
                  </span>
                </div>

                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${formData.colors.primary}33`,
                    color: formData.colors.primary,
                    border: `1px solid ${formData.colors.primary}66`,
                  }}
                >
                  01 / 05
                </span>
              </div>

              <h3 
                className="text-base font-black leading-tight mb-2"
                style={{ color: formData.colors.text }}
              >
                Como a {formData.name} transforma resultados com autoridade e IA
              </h3>

              <p 
                className="text-xs opacity-80 leading-relaxed mb-5"
                style={{ color: formData.colors.text }}
              >
                Design padronizado, cores fiéis à identidade da marca e roteiro otimizado para retenção social.
              </p>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-xs font-black shadow-lg transition-transform"
                style={{
                  backgroundColor: formData.colors.primary,
                  color: '#ffffff',
                }}
              >
                {formData.defaultCta}
              </button>
            </div>
          </div>

          {/* Brand Memory */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-400" />
              Brand Memory & Context Vector
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              Contexto persistido em JSON que alimenta os agentes de IA sem alucinações.
            </p>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto">
              {JSON.stringify(
                {
                  brandId: activeBrand.id,
                  name: activeBrand.name,
                  niche: activeBrand.niche,
                  pillarsCount: activeBrand.pillars.length,
                  memory: JSON.parse(activeBrand.brandMemoryJson || '{}'),
                },
                null,
                2
              )}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
