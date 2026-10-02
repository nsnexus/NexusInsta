import { useState } from 'react';
import type { FormEvent } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { useBrand } from '../context/BrandContext';
import { 
  Key, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Code2, 
  Server,
  Bot,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { fetchInstagramProfileData, understandInstagramProfileWithAi } from '../services/instagramAiIngestion';

export const MetaConfigView = () => {
  const { config, updateConfig, testMetaConnection, autopilotConfig, updateAutopilotConfig, addToast, setActiveTab } = useInstagram();
  const { activeBrand, updateBrand } = useBrand();
  const [isSyncingBrand, setIsSyncingBrand] = useState(false);
  const [brandSyncSuccess, setBrandSyncSuccess] = useState(false);
  
  const [appId, setAppId] = useState(config.appId);
  const [appSecret, setAppSecret] = useState(config.appSecret);
  const [accessToken, setAccessToken] = useState(config.accessToken);
  const [instagramAccountId, setInstagramAccountId] = useState(config.instagramAccountId);
  const [username, setUsername] = useState(config.username);
  const [isLiveMode, setIsLiveMode] = useState(config.isLiveMode);
  const [openaiKey, setOpenaiKey] = useState(autopilotConfig.openaiApiKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateConfig({
      appId,
      appSecret,
      accessToken,
      instagramAccountId,
      username,
      isLiveMode,
    });
    if (openaiKey !== autopilotConfig.openaiApiKey) {
      updateAutopilotConfig({ openaiApiKey: openaiKey.trim() });
    }
    addToast('Configurações da Meta e chave da OpenAI salvas!', 'success');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await testMetaConnection();
    setIsTesting(false);
  };

  const handleSyncBrandKitWithAi = async () => {
    setIsSyncingBrand(true);
    setBrandSyncSuccess(false);
    try {
      addToast('Conectando ao perfil do Instagram e lendo publicações...', 'info');
      let profileData = {};
      if (accessToken && instagramAccountId) {
        profileData = await fetchInstagramProfileData(instagramAccountId, accessToken);
      }

      const understood = await understandInstagramProfileWithAi({
        handle: username.startsWith('@') ? username : `@${username}`,
        name: (profileData as any).name || activeBrand.name,
        biography: (profileData as any).biography || '',
        profilePictureUrl: (profileData as any).profilePictureUrl || config.avatarUrl,
        website: (profileData as any).website,
        recentCaptions: (profileData as any).recentCaptions,
      });

      updateBrand(activeBrand.id, {
        name: understood.name,
        handle: understood.handle,
        niche: understood.niche,
        description: understood.description,
        targetAudience: understood.targetAudience,
        toneOfVoice: understood.toneOfVoice,
        defaultCta: understood.defaultCta,
        colors: understood.colors,
        pillars: understood.pillars,
        brandMemoryJson: understood.brandMemoryJson,
      });

      setBrandSyncSuccess(true);
      addToast(`🎉 Brand Kit da ${understood.name} calibrado automaticamente pela IA com base no Instagram!`, 'success');
    } catch (err: any) {
      addToast(`Falha ao sincronizar: ${err.message}`, 'error');
    } finally {
      setIsSyncingBrand(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const step1Curl = `curl -X POST "https://graph.facebook.com/v21.0/${instagramAccountId || '{ig-user-id}'}/media" \\
  -d "image_url=https://seu-storage.com/foto.jpg" \\
  -d "caption=Postando via Meta Graph API! 🚀" \\
  -d "access_token=${accessToken.slice(0, 15)}..."`;

  const step2Curl = `curl -X POST "https://graph.facebook.com/v21.0/${instagramAccountId || '{ig-user-id}'}/media_publish" \\
  -d "creation_id=18029384729104821" \\
  -d "access_token=${accessToken.slice(0, 15)}..."`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Configuração da Meta Graph API & Guia de Integração
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
            v21.0 Oficial
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie as chaves de acesso do seu App no Meta for Developers e entenda como a automação funciona nos bastidores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Credential Inputs (6 cols) */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-pink-400" />
              Credenciais do Meta for Developers
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Modo:</span>
              <button
                type="button"
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  isLiveMode 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isLiveMode ? 'Produção Live' : 'Sandbox (Simulado)'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Instagram Business Account ID:
              </label>
              <input
                type="text"
                value={instagramAccountId}
                onChange={(e) => setInstagramAccountId(e.target.value)}
                placeholder="17841405928374821"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
              />
              <p className="text-[10px] text-slate-500">
                Obtido via endpoint `/me/accounts?fields=instagram_business_account`
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nome de Usuário (@handle do Instagram):
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="suaempresa.oficial"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Long-Lived Page Access Token (Meta Graph API):
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAQ...v21_LONG_LIVED_TOKEN"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
              />
              <p className="text-[10px] text-slate-500">
                Token com permissões `instagram_content_publish` e `pages_read_engagement`
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Meta App ID:</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1098425192837492"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Meta App Secret:</label>
                <input
                  type="password"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* OpenAI / ChatGPT Key */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-pink-400" />
                  Chave de API OpenAI (ChatGPT & DALL-E 3):
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-pink-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Pegar chave na OpenAI</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
              />
              <p className="text-[10px] text-slate-500">
                Usada pelo Piloto Automático para gerar legendas inéditas e criar imagens personalizadas no DALL-E 3.
              </p>
            </div>

            {/* AI Profile Reader & Comprehension Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-slate-900 border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                  Leitura & Compreensão de Perfil com IA
                </span>
                <span className="text-[10px] text-pink-400 font-mono">Brand Kit Sync</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ao clicar, a IA analisa a biografia e as últimas publicações do perfil conectado para calibrar o nicho, tom de voz, paleta de cores e pilares editoriais da marca.
              </p>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleSyncBrandKitWithAi}
                  disabled={isSyncingBrand}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSyncingBrand ? 'animate-spin' : ''}`} />
                  <span>{isSyncingBrand ? 'Lendo e Interpretando Perfil...' : 'Ler & Compreender Perfil com IA'}</span>
                </button>

                {brandSyncSuccess && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('brand-kit')}
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ver Brand Kit →</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20 transition-all"
              >
                Salvar Credenciais
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
              >
                {isTesting ? (
                  <span>Testando...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Testar Conexão</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick link to developers.facebook.com */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Portal oficial de criação do aplicativo:</span>
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noreferrer"
              className="text-pink-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Meta for Developers</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right: How It Works Visual Flow & cURL Documentation (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Visual Architecture Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-pink-400" />
              Fluxo da Arquitetura em 3 Etapas
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              O Instagram proíbe o envio binário direto no payload. Veja a esteira obrigatória:
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-white">Upload da Mídia para Nuvem Pública (HTTPS)</p>
                  <p className="text-slate-400">
                    A imagem/vídeo deve estar hospedada em um link público (AWS S3, Cloudinary, Supabase).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-white">POST /{'{ig-user-id}'}/media (Criação do Container)</p>
                  <p className="text-slate-400">
                    A Meta faz o download do arquivo dos seus servidores e retorna um <code className="text-pink-300">creation_id</code>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-white">POST /{'{ig-user-id}'}/media_publish (Publicação Oficial)</p>
                  <p className="text-slate-400">
                    O container é indexado e o post entra instantaneamente no feed ou reels do perfil.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyable cURL Snippets */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-pink-400" />
              Exemplo de Requisições HTTP (cURL)
            </h3>

            {/* Snippet 1: Container */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Passo 1: Criar Container</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(step1Curl, 'curl1')}
                  className="flex items-center gap-1 text-pink-400 hover:text-pink-300"
                >
                  {copiedSnippet === 'curl1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === 'curl1' ? 'Copiado!' : 'Copiar cURL'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-pink-300 overflow-x-auto">
                {step1Curl}
              </pre>
            </div>

            {/* Snippet 2: Publish */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Passo 2: Publicar Container</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(step2Curl, 'curl2')}
                  className="flex items-center gap-1 text-pink-400 hover:text-pink-300"
                >
                  {copiedSnippet === 'curl2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === 'curl2' ? 'Copiado!' : 'Copiar cURL'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-pink-300 overflow-x-auto">
                {step2Curl}
              </pre>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
