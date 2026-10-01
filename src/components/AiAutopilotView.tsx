import { useState } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { AI_MUSIC_TEMPLATES } from '../data/mockData';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Clock, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Sliders, 
  Copy, 
  Check, 
  Code2, 
  Music, 
  Headphones, 
  Flame, 
  Calendar 
} from 'lucide-react';

export const AiAutopilotView = () => {
  const { config, schedulePost, publishImmediately, addToast } = useInstagram();
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPost, setGeneratedPost] = useState<typeof AI_MUSIC_TEMPLATES[0] | null>(null);
  const [activeDays, setActiveDays] = useState<string[]>(['seg', 'qua', 'sex']);
  const [postHour, setPostHour] = useState('18:00');
  const [isAutopilotActive, setIsAutopilotActive] = useState(true);
  const [copiedWorker, setCopiedWorker] = useState(false);

  const daysOfWeek = [
    { id: 'seg', label: 'Seg' },
    { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' },
    { id: 'sex', label: 'Sex' },
    { id: 'sab', label: 'Sáb' },
    { id: 'dom', label: 'Dom' },
  ];

  const toggleDay = (day: string) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Simulate AI generation process with dynamic steps
  const handleGeneratePost = async (template?: typeof AI_MUSIC_TEMPLATES[0]) => {
    setIsGenerating(true);
    setGeneratedPost(null);

    const base = template || AI_MUSIC_TEMPLATES[selectedTemplateIndex];

    setGenerationStep('🧠 ChatGPT analisando nicho musical da @_nsmusic...');
    await new Promise((r) => setTimeout(r, 1100));

    setGenerationStep('✍️ Escrevendo legenda persuasiva, hashtags e call-to-action...');
    await new Promise((r) => setTimeout(r, 1200));

    setGenerationStep('🎨 DALL-E 3 gerando arte visual em alta definição (formato 4:5)...');
    await new Promise((r) => setTimeout(r, 1400));

    setGenerationStep('✨ Finalizando e aplicando otimização para o feed do Instagram...');
    await new Promise((r) => setTimeout(r, 800));

    let finalPost = base;
    if (customPrompt.trim()) {
      finalPost = {
        title: 'Criação Personalizada IA',
        theme: customPrompt,
        caption: `🎵 ${customPrompt}\n\nA música conecta o que as palavras não conseguem expressar. Na @_nsmusic, transformamos ideias em frequências inesquecíveis.\n\nQual é a sua track favorita deste momento? Deixe nos comentários! 👇\n\n#nsmusic #musica #novidades #studiotime #djlife #eletronicmusic`,
        imageUrl: base.imageUrl,
        firstComment: '🎧 Salve este post para ouvir as novidades na bio!'
      };
    }

    setGeneratedPost(finalPost);
    setIsGenerating(false);
    addToast('Post com IA gerado com sucesso!', 'success');
  };

  // Schedule the generated post
  const handleScheduleGenerated = () => {
    if (!generatedPost) return;
    const scheduledTime = new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(); // em 2 horas

    schedulePost({
      mediaUrl: generatedPost.imageUrl,
      caption: generatedPost.caption,
      firstComment: generatedPost.firstComment,
      type: 'feed',
      aspectRatio: '4:5',
      scheduledAt: scheduledTime,
      generatedByAi: true,
    });
  };

  // Publish immediately
  const handlePublishNow = async () => {
    if (!generatedPost) return;
    const newPostId = 'post_ai_' + Date.now();

    schedulePost({
      mediaUrl: generatedPost.imageUrl,
      caption: generatedPost.caption,
      firstComment: generatedPost.firstComment,
      type: 'feed',
      aspectRatio: '4:5',
      scheduledAt: new Date().toISOString(),
      generatedByAi: true,
    });

    await publishImmediately(newPostId);
  };

  const workerCode = `// cloudflare-worker-autopilot-nsmusic.js
export default {
  async scheduled(event, env, ctx) {
    console.log("Acordando rotina autônoma de IA para @_nsmusic...");
    
    // 1. ChatGPT gera a legenda e ideia da imagem
    const gpt = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": \`Bearer \${env.OPENAI_KEY}\`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Crie um post para a conta @_nsmusic (produção musical e beats). Retorne JSON: { 'caption': '...', 'image_prompt': '...' }" }],
        response_format: { type: "json_object" }
      })
    });
    const { caption, image_prompt } = (await gpt.json()).choices[0].message.content;

    // 2. DALL-E 3 gera a imagem
    const dalle = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": \`Bearer \${env.OPENAI_KEY}\`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "dall-e-3", prompt: image_prompt + ", high quality music studio, 4k", size: "1024x1024" })
    });
    const imageUrl = (await dalle.json()).data[0].url;

    // 3. Publica na Meta Graph API da @_nsmusic
    const igId = "${config.instagramAccountId}";
    const token = "${config.accessToken.slice(0, 15)}...";
    
    const container = await fetch(\`https://graph.facebook.com/v21.0/\${igId}/media?image_url=\${encodeURIComponent(imageUrl)}&caption=\${encodeURIComponent(caption)}&access_token=\${token}\`, { method: "POST" });
    const { id: creationId } = await container.json();
    
    await fetch(\`https://graph.facebook.com/v21.0/\${igId}/media_publish?creation_id=\${creationId}&access_token=\${token}\`, { method: "POST" });
    console.log("Post com IA publicado com sucesso!");
  }
};`;

  const copyWorkerCode = () => {
    navigator.clipboard.writeText(workerCode);
    setCopiedWorker(true);
    setTimeout(() => setCopiedWorker(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Piloto Automático de Conteúdo com IA
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-pink-400" />
              ChatGPT + DALL-E 3
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Geração autônoma de posts musicais com inteligência artificial para o perfil <strong className="text-white">@{config.username}</strong>.
          </p>
        </div>

        {/* Master Status Switch */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold pl-2">Piloto Automático:</span>
          <button
            type="button"
            onClick={() => setIsAutopilotActive(!isAutopilotActive)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isAutopilotActive
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutopilotActive ? 'bg-white animate-pulse' : 'bg-slate-500'}`}></span>
            {isAutopilotActive ? 'Ativo na Nuvem' : 'Pausado'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Generator Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Gerador em 1 Clique */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Gerador Instantâneo com IA</h2>
                  <p className="text-xs text-slate-400">Escolha um tema ou digite sua ideia para gerar arte e texto</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                100% IA
              </span>
            </div>

            {/* Quick Themes for @_nsmusic */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                Temas Estratégicos para @_nsmusic:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AI_MUSIC_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateIndex(idx);
                      setCustomPrompt('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTemplateIndex === idx && !customPrompt
                        ? 'border-pink-500 bg-pink-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-200">{tmpl.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{tmpl.theme}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-pink-400" />
                  Ou digite um assunto personalizado:
                </span>
                <span className="text-[11px] text-slate-500">Opcional</span>
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ex: Top 5 sintetizadores virtuais para música eletrônica em 2026..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={() => handleGeneratePost()}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                isGenerating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-instagram-gradient text-white hover:opacity-95 shadow-pink-500/25 active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                  <span>{generationStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Post Completo com IA Agora</span>
                </>
              )}
            </button>

            {/* Live Generation Progress Card */}
            {isGenerating && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-pink-400 font-semibold">{generationStep}</span>
                  <span className="text-[10px] text-slate-500">Aguarde ~3s</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse w-3/4"></div>
                </div>
              </div>
            )}

            {/* Result Preview Box */}
            {generatedPost && (
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-pink-500/30 space-y-4 shadow-xl shadow-pink-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Resultado Gerado pela IA:
                  </span>
                  <span className="text-[10px] text-slate-400">Pronto para o feed</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <img
                    src={generatedPost.imageUrl}
                    alt="Arte gerada"
                    className="w-full sm:w-28 aspect-[4/5] rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
                      {generatedPost.caption}
                    </p>
                    {generatedPost.firstComment && (
                      <p className="text-[11px] text-pink-400 font-medium">
                        💬 1º comentário: {generatedPost.firstComment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Post Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handlePublishNow}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar Agora no @_nsmusic</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleScheduleGenerated}
                    className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-pink-400" />
                    <span>Salvar na Fila Agendada</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Card: Regras de Agendamento da Nuvem */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Configuração da Rotina Automática</h3>
                <p className="text-xs text-slate-400">Dias e horários em que a IA deve gerar e postar</p>
              </div>
            </div>

            {/* Days selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Dias de Disparo Semanal:</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isSelected = activeDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`w-11 h-10 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20 scale-105'
                          : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hour selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  Horário do Disparo:
                </label>
                <input
                  type="time"
                  value={postHour}
                  onChange={(e) => setPostHour(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-pink-400" />
                  Formato Padrão:
                </label>
                <div className="text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                  Retrato (4:5) • Otimizado Feed
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: 24/7 Cloudflare Worker Blueprint (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Como Funciona 24h na Nuvem */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Como a IA posta com o PC desligado?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O agendamento na nuvem utiliza um <strong>Cloudflare Worker</strong> gratuito com <strong>Cron Trigger</strong>.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <span className="font-bold text-pink-400 text-sm">1</span>
                <div>
                  <p className="font-semibold text-white">Cron acorda no Cloudflare</p>
                  <p className="text-slate-400 text-[11px]">No horário definido (ex: 18:00), o servidor roda em segundo plano.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <span className="font-bold text-pink-400 text-sm">2</span>
                <div>
                  <p className="font-semibold text-white">ChatGPT + DALL-E 3 produzem a mídia</p>
                  <p className="text-slate-400 text-[11px]">Gera a imagem e a legenda com as hashtags da @_nsmusic.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <span className="font-bold text-emerald-400 text-sm">3</span>
                <div>
                  <p className="font-semibold text-white">Meta Graph API publica</p>
                  <p className="text-slate-400 text-[11px]">O post entra no ar sem precisar de intervenção humana.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Código Pronto para o Cloudflare Worker */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-pink-400" />
                Script 24/7 (Cloudflare Worker)
              </h4>
              <button
                type="button"
                onClick={copyWorkerCode}
                className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 transition-colors"
              >
                {copiedWorker ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWorker ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-pink-300 max-h-64 overflow-y-auto no-scrollbar">
              {workerCode}
            </pre>

            <p className="text-[11px] text-slate-500">
              Pronto para colar no seu painel do Cloudflare Workers em <em>Triggers ➔ Cron Triggers</em>.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
