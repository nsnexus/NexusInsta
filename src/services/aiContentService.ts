import type { ClientSongItem } from '../types/instagram';

export const getStoredOpenAiKey = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('nexus_autopilot_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.openaiApiKey) return parsed.openaiApiKey;
      }
    } catch {}
  }
  return (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
};

export interface GeneratedContentResult {
  visualConcept: string;
  imageOverlayText: string;
  caption: string;
  firstComment: string;
  hashtags: string[];
  imageUrl: string;
  imagePrompt: string;
  theme: string;
}

export const INSTITUTIONAL_THEMES = [
  {
    theme: 'Música para Casamento e Votos Matrimoniais',
    promptContext: 'Fale sobre como uma música personalizada com a história do casal transforma a entrada da noiva ou a dança dos noivos em um momento inesquecível e exclusivo.',
  },
  {
    theme: 'Homenagem Emocionante para Mãe ou Pai',
    promptContext: 'Conte como transformar lembranças de infância, conselhos e gratidão em uma canção especial que faz os pais chorarem de emoção ao ouvir.',
  },
  {
    theme: 'Pedido de Casamento ou Namoro Inesquecível',
    promptContext: 'Mostre como surpreender a pessoa amada fazendo a trilha sonora do pedido de casamento ou início de namoro com a letra contando os detalhes de como se conheceram.',
  },
  {
    theme: 'Música para Filhos e Chá Revelação',
    promptContext: 'Destaque o amor mais puro: uma canção de ninar ou celebração eternizando a chegada de um bebê ou revelação do nome da criança.',
  },
  {
    theme: 'Aniversário Especial e Conquistas de Vida',
    promptContext: 'Foque em celebrar aniversários marcantes (15 anos, 30 anos, 50 anos) com uma homenagem musical cantada em estilo profissional.',
  },
  {
    theme: 'Homenagem para Amigos ou Pessoas Especiais',
    promptContext: 'Aborde o valor da amizade verdadeira e parcerias de vida que merecem uma trilha sonora própria gravada em estúdio.',
  },
  {
    theme: 'Curiosidades dos Bastidores: Como Criamos Músicas Personalizadas',
    promptContext: 'Explique de forma descontraída como a NS Music pega a história simples do cliente, refina a letra, compõe a harmonia e entrega em poucas horas.',
  },
  {
    theme: 'Qualidade de Estúdio & Diversidade de Estilos (Sertanejo, Pagode, Pop, MPB, Gospel)',
    promptContext: 'Destaque que o cliente escolhe qualquer estilo musical: do modão sertanejo ao pagode animado, rap ou MPB acústico com padrão de rádio.',
  }
];

export const AiContentService = {
  /**
   * Gera conteúdo para música de cliente
   */
  async generateClientSongContent(
    song: ClientSongItem,
    customInstructions = '',
    aiModel = 'gpt-6-astra',
    imageModel = 'gpt-image-2.5-sunburst',
    apiKey = ''
  ): Promise<GeneratedContentResult> {
    const activeKey = apiKey.trim() || getStoredOpenAiKey();

    const systemPrompt = `Você é o estrategista chefe de conteúdo e copywriter oficial do Instagram @_nsmusic (portal nsmusic.nsnexus.com.br).
A NS Music cria músicas personalizadas emocionantes e profissionais baseadas nas histórias reais das pessoas.

Seu objetivo é criar um post que emocione, gere identificação imediata e faça novos clientes quererem encomendar sua música no portal.

INFORMAÇÕES DA MÚSICA DO CLIENTE:
- Cliente: ${song.customerName}
- Homenageado(a): ${song.honoreeName}
- Ocasião: ${song.occasion}
- Estilo Musical: ${song.musicStyle}
${song.story ? `- Detalhes da História: ${song.story.slice(0, 300)}` : ''}
${song.lyrics ? `- Trecho da Letra: ${song.lyrics.slice(0, 200)}` : ''}

REGRAS OBRIGATÓRIAS:
1. O conceito visual e a arte devem corresponder com precisão ao estilo musical (${song.musicStyle}) e clima da ocasião. Exemplo: se for sertanejo romântico, estética acolhedora com tons quentes; se for pagode, clima vibrante e alegre; se for aniversário infantil, cores suaves e afetivas.
2. Não revele dados privados (como sobrenomes completos, telefones ou endereços).
3. A legenda deve conter emojis elegantes, contação de história envolvente e terminar com uma chamada clara (CTA) para criar sua própria música personalizada com link na bio (@_nsmusic ou nsmusic.nsnexus.com.br).
4. Retorne ESTRITAMENTE um JSON válido com o seguinte formato:
{
  "visualConcept": "descrição do conceito estético para este estilo musical",
  "imageOverlayText": "frase curta e marcante para a capa da música",
  "caption": "legenda completa formatada para Instagram",
  "firstComment": "comentário fixado de engajamento",
  "hashtags": ["nsmusic", "musicapersonalizada", "homenagem", "..."],
  "imagePrompt": "prompt ultra detalhado em inglês para gerar arte cinematográfica 9:16 vertical ou 1:1"
}`;

    const userMessage = `Crie a publicação completa para a música de ${song.customerName} para ${song.honoreeName}. ${customInstructions ? `Instrução extra: ${customInstructions}` : ''}`;

    // 1. ChatGPT (GPT-6 Astra / GPT-6.1 Sol / GPT-5.4 / GPT-4o)
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel || 'gpt-6-astra',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      }),
    });

    if (!chatRes.ok) {
      const err = await chatRes.text();
      throw new Error(`Erro na API GPT (${aiModel}): ${err}`);
    }

    const chatData = await chatRes.json();
    const parsed = JSON.parse(chatData.choices[0].message.content);

    // 2. Geração da Imagem (gpt-image-2.5-sunburst ou dall-e-3)
    const imageUrl = await this.generateImage(parsed.imagePrompt, imageModel, activeKey);

    return {
      visualConcept: parsed.visualConcept || `Arte no estilo ${song.musicStyle}`,
      imageOverlayText: parsed.imageOverlayText || `${song.honoreeName} - Canção Especial`,
      caption: parsed.caption,
      firstComment: parsed.firstComment || 'Ouça com o coração! ❤️ Encomende a sua canção no link da nossa bio @_nsmusic',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['nsmusic', 'musicapersonalizada'],
      imageUrl,
      imagePrompt: parsed.imagePrompt,
      theme: `${song.musicStyle} • ${song.occasion} para ${song.honoreeName}`,
    };
  },

  /**
   * Gera conteúdo Institucional da NS Music com rotação de temas
   */
  async generateInstitutionalContent(
    themeIndex?: number,
    customInstructions = '',
    aiModel = 'gpt-6-astra',
    imageModel = 'gpt-image-2.5-sunburst',
    apiKey = ''
  ): Promise<GeneratedContentResult> {
    const activeKey = apiKey.trim() || getStoredOpenAiKey();

    // Seleciona tema por rotação do dia se não for especificado
    const index = typeof themeIndex === 'number'
      ? themeIndex % INSTITUTIONAL_THEMES.length
      : Math.floor(Math.random() * INSTITUTIONAL_THEMES.length);

    const selectedTheme = INSTITUTIONAL_THEMES[index];

    const systemPrompt = `Você é o estrategista chefe de conteúdo e copywriter oficial do Instagram @_nsmusic (portal nsmusic.nsnexus.com.br).
A NS Music cria músicas personalizadas emocionantes e profissionais gravadas com qualidade de estúdio para qualquer ocasião.

TEMA DO DIA: "${selectedTheme.theme}"
CONTEXTO: ${selectedTheme.promptContext}

REGRAS OBRIGATÓRIAS:
1. O texto deve prender a atenção no primeiro segundo, despertar forte conexão emocional e mostrar como uma música personalizada é o presente mais inesquecível do mundo.
2. Destaque facilidade, emoção e rapidez de entrega no site nsmusic.nsnexus.com.br.
3. Inclua chamada clara (CTA) convidando para seguir @_nsmusic e tocar no link da bio.
4. Retorne ESTRITAMENTE um JSON no formato:
{
  "visualConcept": "descrição do conceito visual moderno",
  "imageOverlayText": "frase impactante para a arte",
  "caption": "legenda formatada com emojis e parágrafos fluidos",
  "firstComment": "primeiro comentário de engajamento",
  "hashtags": ["nsmusic", "musicapersonalizada", "presentecriativo", "..."],
  "imagePrompt": "prompt em inglês para gerar arte de estúdio, iluminação cinematográfica, alta resolução"
}`;

    const userMessage = `Gere uma publicação inédita para o tema: ${selectedTheme.theme}. ${customInstructions ? `Instrução extra: ${customInstructions}` : ''}`;

    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel || 'gpt-6-astra',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      }),
    });

    if (!chatRes.ok) {
      const err = await chatRes.text();
      throw new Error(`Erro na API GPT (${aiModel}): ${err}`);
    }

    const chatData = await chatRes.json();
    const parsed = JSON.parse(chatData.choices[0].message.content);

    const imageUrl = await this.generateImage(parsed.imagePrompt, imageModel, activeKey);

    return {
      visualConcept: parsed.visualConcept || selectedTheme.theme,
      imageOverlayText: parsed.imageOverlayText || selectedTheme.theme,
      caption: parsed.caption,
      firstComment: parsed.firstComment || 'Qual momento da sua vida merece uma música hoje? Conta pra gente nos comentários! 🎵',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['nsmusic', 'musicapersonalizada', 'musicaautoral'],
      imageUrl,
      imagePrompt: parsed.imagePrompt,
      theme: selectedTheme.theme,
    };
  },

  /**
   * Gera imagem com gpt-image-2.5-sunburst ou dall-e-3
   */
  async generateImage(prompt: string, model = 'gpt-image-2.5-sunburst', apiKey: string): Promise<string> {
    const finalPrompt = `${prompt}, professional music studio aesthetic, cinematic lighting, neon magenta and purple highlights, ultra high detail, 4k resolution`;

    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-image-2.5-sunburst',
          prompt: finalPrompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      if (!res.ok) {
        // Fallback para dall-e-3 caso o modelo solicitado dê erro
        console.warn(`[AiContentService] Modelo ${model} falhou, tentando dall-e-3...`);
        const fallbackRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: finalPrompt,
            n: 1,
            size: '1024x1024',
          }),
        });

        if (!fallbackRes.ok) {
          const err = await fallbackRes.text();
          throw new Error(`Erro ao gerar imagem: ${err}`);
        }

        const data = await fallbackRes.json();
        return data.data[0].url;
      }

      const data = await res.json();
      const first = data.data?.[0];

      // gpt-image-2.5 pode retornar b64_json ou url
      if (first?.url) return first.url;
      if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;

      return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80';
    } catch (err: any) {
      console.error('[AiContentService] generateImage error:', err);
      return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80';
    }
  },
};
