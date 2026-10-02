import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { useInstagram } from '../context/InstagramContext';
import { 
  Building2, 
  X, 
  Palette, 
  Check, 
  Globe, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import type { ContentObjective, EditorialPillar } from '../types/brand';
import { understandInstagramProfileWithAi, fetchInstagramProfileData } from '../services/instagramAiIngestion';

export const BrandOnboardingModal: React.FC = () => {
  const { isBrandModalOpen, setIsBrandModalOpen, createBrand } = useBrand();
  const { config, addToast } = useInstagram();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Form State
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('@');
  const [niche, setNiche] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('Inspirador, Dinâmico e Confiável');
  const [defaultCta, setDefaultCta] = useState('Clique no link da bio para conferir!');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [forbiddenWords, setForbiddenWords] = useState('grátis para sempre, milagre, golpe');

  // Color tokens
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState('#EC4899');
  const [bgColor, setBgColor] = useState('#0B0F19');
  const [textColor, setTextColor] = useState('#F8FAFC');
  const [accentColor, setAccentColor] = useState('#06B6D4');

  // Pillars generated
  const [pillars, setPillars] = useState<EditorialPillar[]>([]);

  // AI Profile Ingestion State
  const [isAnalyzingIg, setIsAnalyzingIg] = useState(false);
  const [igAnalysisSuccess, setIgAnalysisSuccess] = useState(false);

  if (!isBrandModalOpen) return null;

  const handleScanInstagram = async (targetHandle?: string) => {
    const handleToScan = targetHandle || handle;
    if (!handleToScan || handleToScan === '@') {
      addToast('Digite o @ do perfil do Instagram para analisar.', 'warning');
      return;
    }

    setIsAnalyzingIg(true);
    setIgAnalysisSuccess(false);

    try {
      let profileData = {};
      // Se for a conta conectada ou se tiver token da Meta
      if (config.accessToken && config.instagramAccountId) {
        profileData = await fetchInstagramProfileData(config.instagramAccountId, config.accessToken);
      }

      const cleanHandle = handleToScan.replace('@', '');
      const understood = await understandInstagramProfileWithAi({
        handle: handleToScan,
        name: (profileData as any).name || cleanHandle,
        biography: (profileData as any).biography,
        profilePictureUrl: (profileData as any).profilePictureUrl,
        website: (profileData as any).website,
        recentCaptions: (profileData as any).recentCaptions,
      });

      setName(understood.name);
      setHandle(understood.handle);
      setNiche(understood.niche);
      setDescription(understood.description);
      setTargetAudience(understood.targetAudience);
      setToneOfVoice(understood.toneOfVoice);
      setDefaultCta(understood.defaultCta);
      setWebsiteUrl(understood.websiteUrl);
      setLogoUrl(understood.logoUrl);
      setForbiddenWords(understood.forbiddenWords.join(', '));
      setPrimaryColor(understood.colors.primary);
      setSecondaryColor(understood.colors.secondary);
      setBgColor(understood.colors.background);
      setTextColor(understood.colors.text);
      setAccentColor(understood.colors.accent);
      setPillars(understood.pillars);

      setIgAnalysisSuccess(true);
      addToast(`🎉 Perfil ${understood.handle} analisado e compreendido com sucesso!`, 'success');
    } catch (err: any) {
      addToast(`Erro ao analisar perfil: ${err.message}`, 'error');
    } finally {
      setIsAnalyzingIg(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const brandSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const forbiddenArray = forbiddenWords
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    const finalPillars: EditorialPillar[] = pillars.length > 0 ? pillars : [
      {
        id: `pillar_${Date.now()}_1`,
        name: 'Autoridade & Conhecimento',
        objective: 'autoridade' as ContentObjective,
        description: `Conteúdos que provam a competência da ${name} no segmento.`,
        suggestedFormats: ['carousel', 'feed'],
      },
      {
        id: `pillar_${Date.now()}_2`,
        name: 'Oferta Principal & Conversão',
        objective: 'vender' as ContentObjective,
        description: 'Apresentação de produtos, diferenciais e chamadas para ação diretas.',
        suggestedFormats: ['carousel', 'reel'],
      },
      {
        id: `pillar_${Date.now()}_3`,
        name: 'Dicas Práticas & Educação',
        objective: 'educar' as ContentObjective,
        description: 'Passo a passo ensinando o público a resolver dores frequentes.',
        suggestedFormats: ['carousel', 'story'],
      },
    ];

    createBrand({
      name: name.trim(),
      slug: brandSlug,
      handle: handle.trim(),
      niche: niche.trim() || 'Serviços e Produtos Digitais',
      description: description.trim() || `Marca oficial ${name}`,
      targetAudience: targetAudience.trim() || 'Público geral interessado no segmento',
      toneOfVoice: toneOfVoice.trim(),
      toneExamplesGood: [
        `Aqui na ${name} entregamos excelência e resultados consistentes.`,
        'Descubra como transformar suas metas em realidade com nosso método.'
      ],
      toneExamplesBad: [
        'Compre urgente antes que acabe tudo!',
        'A solução mágica que resolve tudo da noite pro dia.'
      ],
      forbiddenWords: forbiddenArray,
      defaultCta: defaultCta.trim(),
      websiteUrl: websiteUrl.trim(),
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        background: bgColor,
        text: textColor,
        accent: accentColor,
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
      },
      logoUrl: logoUrl || '',
      pillars: finalPillars,
      brandMemoryJson: JSON.stringify({
        summary: description,
        niche: niche,
        importedFromInstagram: igAnalysisSuccess,
      }),
    });

    setIsBrandModalOpen(false);
    setStep(1);
    setName('');
    setHandle('@');
    setIgAnalysisSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Brand Onboarding — Nova Marca
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  Etapa {step} de 3
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cadastre ou importe do Instagram para gerar conteúdo consistente
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBrandModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* STEP 1: Basic Brand Identity & AI Ingestion */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Instagram AI Auto-Ingestion Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-slate-900 border border-pink-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">
                      Importar e Analisar Perfil do Instagram com IA
                    </span>
                  </div>
                  <span className="text-[10px] text-pink-400 font-mono">Auto Brand Kit</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A IA lê a bio, tom das últimas postagens e cores da marca para preencher tudo automaticamente.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {config.username && (
                    <button
                      type="button"
                      onClick={() => handleScanInstagram(`@${config.username}`)}
                      disabled={isAnalyzingIg}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>Usar @{config.username} Conectado</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleScanInstagram()}
                    disabled={isAnalyzingIg}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Search className={`w-3.5 h-3.5 ${isAnalyzingIg ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzingIg ? 'Analisando Perfil...' : 'Escanear & Entender com IA'}</span>
                  </button>
                </div>

                {igAnalysisSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Perfil analisado com sucesso! Brand Kit, nicho, tom e cores extraídos.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome da Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: NSMusic, Mindfit, Caçamba Flow"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Perfil / Handle Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@suamarca"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nicho de Atuação *
                </label>
                <input
                  type="text"
                  required
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Ex: Produção Musical com IA / Saúde Mental / Construção Civil"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição do Negócio & Proposta de Valor
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o que sua marca faz, para quem e qual o grande diferencial..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Público-Alvo
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex: Noivos, Empreendedores, Engenheiros"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Website Oficial
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://suamarca.com.br"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Tone of Voice & Copy Rules */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tom de Voz da Marca
                </label>
                <input
                  type="text"
                  value={toneOfVoice}
                  onChange={(e) => setToneOfVoice(e.target.value)}
                  placeholder="Ex: Inspirador, Técnico, Descontraído, Autoritário"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chamada para Ação Padrão (CTA)
                </label>
                <input
                  type="text"
                  value={defaultCta}
                  onChange={(e) => setDefaultCta(e.target.value)}
                  placeholder="Ex: Toque no link da bio e garanta o seu!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5 text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Palavras & Assuntos Proibidos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={forbiddenWords}
                  onChange={(e) => setForbiddenWords(e.target.value)}
                  placeholder="grátis, milagre, golpe, amador"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-rose-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  A IA nunca utilizará estes termos na redação de copys ou roteiros.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Brand Kit Color Tokens */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-pink-400" />
                    Paleta de Cores do Brand Kit
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Essas cores serão aplicadas automaticamente nos carrosséis e posts gerados pela IA.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">Primária</span>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 mx-auto rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300 uppercase block mt-1">{primaryColor}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">Secundária</span>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 mx-auto rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300 uppercase block mt-1">{secondaryColor}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">Fundo</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 mx-auto rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300 uppercase block mt-1">{bgColor}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">Texto</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 mx-auto rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300 uppercase block mt-1">{textColor}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">Destaque</span>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 mx-auto rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300 uppercase block mt-1">{accentColor}</span>
                </div>
              </div>

              {/* Live Preview Card */}
              <div 
                className="p-5 rounded-2xl border shadow-lg transition-all"
                style={{ backgroundColor: bgColor, borderColor: primaryColor }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                    {name || 'Nome da Marca'} • Preview dos Tokens
                  </span>
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                  >
                    Slide 01/05
                  </span>
                </div>
                <h3 className="text-base font-extrabold mb-1" style={{ color: textColor }}>
                  Seus conteúdos sociais no padrão de estúdio
                </h3>
                <p className="text-xs opacity-80 mb-3" style={{ color: textColor }}>
                  Cores, tipografia e tom de voz unificados em toda a produção visual.
                </p>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold"
                  style={{ backgroundColor: secondaryColor, color: '#ffffff' }}
                >
                  {defaultCta}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !name.trim()) return;
                  setStep((s) => (s + 1) as any);
                }}
                disabled={step === 1 && !name.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Finalizar & Ativar Marca</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
