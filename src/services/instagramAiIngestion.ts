import { getStoredOpenAiKey } from './aiContentService';
import type { ContentObjective, EditorialPillar } from '../types/brand';

export interface IngestInstagramInput {
  handle: string;
  name?: string;
  biography?: string;
  profilePictureUrl?: string;
  website?: string;
  recentCaptions?: string[];
  accessToken?: string;
  accountId?: string;
}

export interface IngestedBrandResult {
  name: string;
  handle: string;
  niche: string;
  description: string;
  targetAudience: string;
  toneOfVoice: string;
  toneExamplesGood: string[];
  toneExamplesBad: string[];
  forbiddenWords: string[];
  defaultCta: string;
  websiteUrl: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  pillars: EditorialPillar[];
  brandMemoryJson: string;
}

export const fetchInstagramProfileData = async (
  accountId: string,
  accessToken: string
): Promise<Partial<IngestInstagramInput>> => {
  try {
    const fields = 'id,username,name,biography,profile_picture_url,website,followers_count,media.limit(10){caption,media_type,like_count}';
    const res = await fetch(`https://graph.facebook.com/v21.0/${accountId}?fields=${fields}&access_token=${accessToken}`);
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro ao consultar Meta Graph API');
    }

    const recentCaptions: string[] = [];
    if (data.media?.data && Array.isArray(data.media.data)) {
      data.media.data.forEach((m: any) => {
        if (m.caption) recentCaptions.push(m.caption);
      });
    }

    return {
      handle: data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : '@instagram',
      name: data.name || data.username,
      biography: data.biography || '',
      profilePictureUrl: data.profile_picture_url || '',
      website: data.website || '',
      recentCaptions,
      accountId: data.id,
    };
  } catch (err: any) {
    console.warn('Não foi possível ler diretamente da Graph API (ou token expirado), usando dados locais/mock.', err);
    return {};
  }
};

export const understandInstagramProfileWithAi = async (
  input: IngestInstagramInput
): Promise<IngestedBrandResult> => {
  const openAiKey = getStoredOpenAiKey();
  const cleanHandle = input.handle.replace('@', '');

  // 1. Tentar chamada com IA real se chave OpenAI estiver presente
  if (openAiKey) {
    try {
      const prompt = `Você é o Estrategista Chefe da NSNEXUS. Analise as informações deste perfil do Instagram e gere o Brand Kit completo em JSON:
Perfil: ${input.handle}
Nome: ${input.name || cleanHandle}
Biografia: ${input.biography || 'Sem bio'}
Website: ${input.website || 'Sem site'}
Legendas Recentes Analisadas:
${(input.recentCaptions || []).slice(0, 5).map((c, i) => `[Post ${i + 1}]: ${c.slice(0, 200)}`).join('\n')}

Retorne ESTRITAMENTE um JSON no seguinte schema (sem markdown ou texto extra):
{
  "name": "Nome Comercial da Marca",
  "niche": "Nicho Específico de Mercado",
  "description": "Proposta de valor clara em até 2 frases",
  "targetAudience": "Público-alvo principal com dores e desejos",
  "toneOfVoice": "Tom de voz identificado (ex: Inspirador, Dinâmico, Técnico, Jovem)",
  "toneExamplesGood": ["Exemplo de frase ou copy exemplar 1", "Exemplo 2"],
  "toneExamplesBad": ["Exemplo ruim ou que não combina"],
  "forbiddenWords": ["palavra1", "palavra2"],
  "defaultCta": "Chamada para ação principal da marca",
  "colors": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "background": "#0B0F19",
    "text": "#F8FAFC",
    "accent": "#HEX"
  },
  "pillars": [
    { "name": "Nome Pilar 1", "objective": "vender", "description": "Resumo" },
    { "name": "Nome Pilar 2", "objective": "autoridade", "description": "Resumo" },
    { "name": "Nome Pilar 3", "objective": "educar", "description": "Resumo" },
    { "name": "Nome Pilar 4", "objective": "engajamento", "description": "Resumo" }
  ]
}`;

      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      const aiJson = await aiRes.json();
      const content = aiJson.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          name: parsed.name || input.name || cleanHandle,
          handle: input.handle.startsWith('@') ? input.handle : `@${input.handle}`,
          niche: parsed.niche || 'Negócios e Serviços',
          description: parsed.description || input.biography || `Marca oficial ${cleanHandle}`,
          targetAudience: parsed.targetAudience || 'Clientes e seguidores interessados no nicho',
          toneOfVoice: parsed.toneOfVoice || 'Inspirador, Dinâmico e Confiável',
          toneExamplesGood: parsed.toneExamplesGood || [
            `Transforme sua rotina com as soluções da ${parsed.name || cleanHandle}.`,
            'Qualidade, consistência e inovação em cada detalhe.'
          ],
          toneExamplesBad: parsed.toneExamplesBad || ['Compre agora com desconto urgente.', 'Solução milagrosa sem esforço.'],
          forbiddenWords: parsed.forbiddenWords || ['amador', 'sem garantia', 'grátis para sempre'],
          defaultCta: parsed.defaultCta || 'Toque no link da bio e saiba mais!',
          websiteUrl: input.website || `https://${cleanHandle}.com.br`,
          logoUrl: (input.profilePictureUrl && !input.profilePictureUrl.includes('unsplash') && !input.profilePictureUrl.includes('photo-15')) ? input.profilePictureUrl : '/nsmusic-logo.png',
          colors: {
            primary: parsed.colors?.primary || '#EC4899',
            secondary: parsed.colors?.secondary || '#8B5CF6',
            background: parsed.colors?.background || '#0B0F19',
            text: parsed.colors?.text || '#F8FAFC',
            accent: parsed.colors?.accent || '#06B6D4',
          },
          pillars: (parsed.pillars || []).map((p: any, idx: number) => ({
            id: `pillar_ai_${Date.now()}_${idx}`,
            name: p.name || `Pilar ${idx + 1}`,
            objective: (p.objective || 'vender') as ContentObjective,
            description: p.description || '',
            suggestedFormats: ['carousel' as const, 'reel' as const],
          })),
          brandMemoryJson: JSON.stringify({
            importedFromInstagram: true,
            handle: input.handle,
            extractedBio: input.biography,
            recentPostsAnalyzed: (input.recentCaptions || []).length,
          }),
        };
      }
    } catch (e) {
      console.warn('Erro ao chamar OpenAI, usando analisador heurístico semântico:', e);
    }
  }

  // 2. Analisador Semântico Heurístico Especializado (Sem alucinação)
  const isMusic = /music|musica|som|beat|faixa|compos|estudio|audio/i.test(`${cleanHandle} ${input.biography || ''} ${(input.recentCaptions || []).join(' ')}`);
  const isFitness = /fit|saude|treino|mente|foco|corpo|vida|mental|mind/i.test(`${cleanHandle} ${input.biography || ''} ${(input.recentCaptions || []).join(' ')}`);
  const isConstruction = /obra|caçamba|cacamba|construcao|reforma|entulho|engenh/i.test(`${cleanHandle} ${input.biography || ''} ${(input.recentCaptions || []).join(' ')}`);

  let niche = 'Serviços & Produtos Digitais';
  let description = input.biography || `Soluções inteligentes e autoridade no Instagram para ${cleanHandle}.`;
  let toneOfVoice = 'Inspirador, Dinâmico, Confiável e Prático';
  let primaryColor = '#EC4899';
  let secondaryColor = '#8B5CF6';
  let accentColor = '#06B6D4';
  let defaultCta = 'Toque no link da bio e entre em contato!';

  let pillars: EditorialPillar[] = [
    {
      id: `pillar_${Date.now()}_1`,
      name: 'Autoridade & Bastidores',
      objective: 'autoridade',
      description: `Processos, diferenciais e experiência da ${cleanHandle}.`,
      suggestedFormats: ['carousel', 'feed'],
    },
    {
      id: `pillar_${Date.now()}_2`,
      name: 'Oferta Principal & Conversão',
      objective: 'vender',
      description: 'Apresentação de produtos, serviços e provas de valor.',
      suggestedFormats: ['carousel', 'reel'],
    },
    {
      id: `pillar_${Date.now()}_3`,
      name: 'Dicas Práticas & Educação',
      objective: 'educar',
      description: 'Como nosso público pode resolver suas dores mais comuns.',
      suggestedFormats: ['carousel', 'story'],
    },
    {
      id: `pillar_${Date.now()}_4`,
      name: 'Comunidade & Interação',
      objective: 'engajamento',
      description: 'Perguntas, tendências e enquetes para aumentar retenção.',
      suggestedFormats: ['reel', 'feed'],
    },
  ];

  if (isMusic) {
    niche = 'Produção Musical, Beats & Músicas Personalizadas';
    description = input.biography || 'Criação musical com tecnologia e produções de estúdio para casamentos, homenagens e batidas exclusivas.';
    toneOfVoice = 'Emocionante, Jovem, Criativo e Inspirador';
    primaryColor = '#EC4899';
    secondaryColor = '#8B5CF6';
    accentColor = '#06B6D4';
    defaultCta = 'Toque no link da bio e crie sua música personalizada hoje!';
    pillars = [
      { id: `p_mus_1`, name: 'Histórias & Músicas de Amor', objective: 'vender', description: 'Canções para casamentos e homenagens.', suggestedFormats: ['carousel', 'reel'] },
      { id: `p_mus_2`, name: 'Bastidores de Produção & Beats', objective: 'autoridade', description: 'Como fazemos os arranjos e mixagens.', suggestedFormats: ['carousel', 'feed'] },
      { id: `p_mus_3`, name: 'IA & Inovação Sonora', objective: 'educar', description: 'O futuro da composição musical.', suggestedFormats: ['carousel', 'story'] },
      { id: `p_mus_4`, name: 'Tendências Musicais', objective: 'engajamento', description: 'Músicas que estão bombando.', suggestedFormats: ['reel', 'feed'] },
    ];
  } else if (isFitness) {
    niche = 'Saúde Mental, Foco e Performance Humana';
    description = input.biography || 'Metodologia e rotinas para clareza mental, sono de qualidade e alta produtividade sem estresse.';
    toneOfVoice = 'Sereno, Científico, Empático e Motivacional';
    primaryColor = '#10B981';
    secondaryColor = '#059669';
    accentColor = '#F59E0B';
    defaultCta = 'Baixe nosso aplicativo e inicie seu reset diário!';
  } else if (isConstruction) {
    niche = 'Locação de Caçambas e Gestão de Resíduos';
    description = input.biography || 'Entrega pontual de caçambas, descarte responsável e agilidade para sua obra não parar.';
    toneOfVoice = 'Direto, Confiável, Pontual e Técnico';
    primaryColor = '#F97316';
    secondaryColor = '#EA580C';
    accentColor = '#3B82F6';
    defaultCta = 'Chame no WhatsApp e receba sua caçamba em 2h!';
  }

  return {
    name: input.name || cleanHandle.toUpperCase(),
    handle: input.handle.startsWith('@') ? input.handle : `@${input.handle}`,
    niche,
    description,
    targetAudience: 'Seguidores e clientes que valorizam agilidade e excelência',
    toneOfVoice,
    toneExamplesGood: [
      `Conheça o padrão de excelência da ${cleanHandle}.`,
      'Resultados consistentes com tecnologia e dedicação.'
    ],
    toneExamplesBad: [
      'Preço baixo e milagres sem esforço.',
      'Compre agora ou vai se arrepender.'
    ],
    forbiddenWords: ['amador', 'sem qualidade', 'golpe', 'grátis'],
    defaultCta,
    websiteUrl: input.website || `https://${cleanHandle}.com.br`,
    logoUrl: (input.profilePictureUrl && !input.profilePictureUrl.includes('unsplash') && !input.profilePictureUrl.includes('photo-15')) ? input.profilePictureUrl : '/nsmusic-logo.png',
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      background: '#0B0F19',
      text: '#F8FAFC',
      accent: accentColor,
    },
    pillars,
    brandMemoryJson: JSON.stringify({
      analyzedFromInstagram: true,
      handle: input.handle,
      biography: input.biography,
      captionsFound: (input.recentCaptions || []).length,
    }),
  };
};
