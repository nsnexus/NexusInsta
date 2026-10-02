import type { 
  Brand, 
  Organization, 
  CreditTransaction, 
  ContentIdea, 
  StructuredContent 
} from '../types/brand';

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org_nsnexus_default',
  name: 'NSNEXUS - Produção Real',
  ownerId: 'user_admin_01',
  plan: 'pro',
  status: 'active',
  creditBalance: 420,
};

// Apenas contas reais conectadas ao Instagram
export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand_nsmusic',
    organizationId: 'org_nsnexus_default',
    name: 'NSMusic',
    slug: 'nsmusic',
    handle: '@_nsmusic',
    niche: 'Produção Musical & Músicas Personalizadas com IA',
    description: 'Transforme suas ideias em músicas completas com IA. 🤖🎶 ⚡ Crie faixas originais em segundos, apenas digitando.',
    targetAudience: 'Noivos, casais, famílias homenageando entes queridos, beatmakers e criadores de conteúdo.',
    toneOfVoice: 'Emocionante, Dinâmico, Criativo, Jovem e Autoritário no universo musical.',
    toneExamplesGood: [
      'Transformamos sua história de amor em uma canção única e inesquecível gravada em estúdio.',
      'A batida que você imaginou, produzida com inteligência artificial e finalizada com qualidade de estúdio.'
    ],
    toneExamplesBad: [
      'Compre agora nosso produto musical barato com desconto.',
      'Somos a melhor empresa do mundo sem comparação.'
    ],
    forbiddenWords: ['amador', 'sem qualidade', 'grátis para sempre', 'gambiarras'],
    defaultCta: 'Toque no link da bio e crie a sua música personalizada hoje!',
    websiteUrl: 'https://nsmusic.ia.br',
    colors: {
      primary: '#EC4899',      // Pink / Magenta Oficial
      secondary: '#3B82F6',    // Azul Elétrico do Logo
      background: '#0B0F19',   // Deep Space
      text: '#F8FAFC',         // Crisp White
      accent: '#06B6D4',       // Ciano
    },
    typography: {
      headingFont: 'Outfit, sans-serif',
      bodyFont: 'Inter, sans-serif',
    },
    logoUrl: '/nsmusic-logo.png',
    pillars: [
      {
        id: 'pillar_ns_01',
        name: 'Histórias Reais & Homenagens',
        objective: 'vender',
        description: 'Músicas para casamentos, aniversários, dia dos pais e momentos inesquecíveis.',
        suggestedFormats: ['carousel', 'reel'],
      },
      {
        id: 'pillar_ns_02',
        name: 'Bastidores de Produção & Beats',
        objective: 'autoridade',
        description: 'Dicas de mixagem, sintetizadores, synths analógicos e processo de criação musical.',
        suggestedFormats: ['carousel', 'feed'],
      },
      {
        id: 'pillar_ns_03',
        name: 'Tecnologia & IA Musical',
        objective: 'educar',
        description: 'Como a inteligência artificial ajuda músicos a compor e quebrar bloqueios criativos.',
        suggestedFormats: ['carousel', 'story'],
      },
      {
        id: 'pillar_ns_04',
        name: 'Lançamentos & Novidades',
        objective: 'engajamento',
        description: 'Novidades sonoras, festivais, novos gêneros e lançamentos exclusivos da @_nsmusic.',
        suggestedFormats: ['reel', 'feed'],
      },
    ],
    brandMemoryJson: JSON.stringify({
      instagramAccount: '_nsmusic',
      followers: 817,
      heroProduct: 'Canção Personalizada Sob Medida',
      website: 'https://nsmusic.ia.br',
    }),
    createdAt: '2026-10-01T10:00:00.000Z',
  },
];

export const INITIAL_CREDIT_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'tx_init_01',
    organizationId: 'org_nsnexus_default',
    delta: 500,
    reason: 'Recarga Inicial de Créditos',
    referenceType: 'recharge',
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'tx_init_02',
    organizationId: 'org_nsnexus_default',
    brandId: 'brand_nsmusic',
    delta: -15,
    reason: 'Geração de Carrossel BestContent: "Sua história pode virar música"',
    referenceType: 'ai_carousel',
    createdAt: '2026-10-01T14:32:00.000Z',
  },
  {
    id: 'tx_init_03',
    organizationId: 'org_nsnexus_default',
    brandId: 'brand_nsmusic',
    delta: -5,
    reason: 'Geração de Imagem com IA: Capa Estúdio Musical',
    referenceType: 'ai_image',
    createdAt: '2026-10-01T14:35:00.000Z',
  },
];

export const INITIAL_CONTENT_IDEAS: ContentIdea[] = [
  {
    id: 'idea_ns_01',
    brandId: 'brand_nsmusic',
    title: 'Sua História de Amor Pode Virar Música',
    hook: 'Você já imaginou presentear quem você ama com uma música feita exclusivamente sobre a história de vocês?',
    objective: 'vender',
    format: 'carousel',
    scheduledAt: '2026-10-03T18:00:00.000Z',
    status: 'draft',
    campaign: 'Casamentos & Homenagens',
    pillarId: 'pillar_ns_01',
    structuredContentId: 'content_ns_carousel_01',
  },
  {
    id: 'idea_ns_02',
    brandId: 'brand_nsmusic',
    title: 'O Segredo dos Graves que Batem no Peito',
    hook: 'Por que o som do seu carro treme enquanto o fone parece sem força? O segredo do sub-bass revelado.',
    objective: 'autoridade',
    format: 'carousel',
    scheduledAt: '2026-10-05T19:30:00.000Z',
    status: 'idea',
    campaign: 'Série Dicas de Estúdio',
    pillarId: 'pillar_ns_02',
  },
  {
    id: 'idea_ns_03',
    brandId: 'brand_nsmusic',
    title: 'A IA vai substituir os compositores?',
    hook: 'A inteligência artificial não veio roubar seu trabalho, veio acabar com seu bloqueio criativo.',
    objective: 'educar',
    format: 'reel',
    scheduledAt: '2026-10-07T12:00:00.000Z',
    status: 'idea',
    pillarId: 'pillar_ns_03',
  },
];

export const INITIAL_STRUCTURED_CONTENTS: StructuredContent[] = [
  {
    id: 'content_ns_carousel_01',
    brandId: 'brand_nsmusic',
    ideaId: 'idea_ns_01',
    title: 'Sua História de Amor Pode Virar Música',
    format: 'carousel',
    aspectRatio: '4:5',
    objective: 'vender',
    headline: 'Sua história de amor merece virar música exclusiva',
    caption: '🎵 Já pensou em dar de presente uma música composta exclusivamente para a sua história de amor?\n\nNa @_nsmusic, você nos conta os melhores momentos, como se conheceram e os sentimentos mais profundos. Nossos produtores e compositores transformam tudo em uma canção emocionante com qualidade de estúdio profissional.\n\n✨ Perfeito para:\n- Casamentos e entradas de noivos\n- Homenagens de aniversário\n- Declarações inesquecíveis\n\n👉 Toque no link da bio e comece a compor a sua agora mesmo!\n\n#nsmusic #musicapersonalizada #presentecriativo #casamento #homenagem',
    cta: 'Crie sua música personalizada hoje pelo link da bio',
    hashtags: ['#nsmusic', '#musicapersonalizada', '#homenagem', '#presentecriativo', '#casamento'],
    abVariations: {
      hooks: [
        'Sua história de amor merece virar música exclusiva',
        'O presente mais emocionante que alguém já recebeu na vida',
        'Por que dar flores se você pode dar uma música eterna?'
      ],
      ctas: [
        'Toque no link da bio para criar a sua canção',
        'Envie sua história pelo direct e receba uma prévia',
        'Reserve sua data no estúdio da @_nsmusic'
      ]
    },
    version: 1,
    status: 'draft',
    createdAt: '2026-10-01T14:32:00.000Z',
    updatedAt: '2026-10-01T14:40:00.000Z',
    slides: [
      {
        id: 'slide_ns_1',
        slideNumber: 1,
        type: 'cover',
        headline: 'Sua história pode virar uma música inesquecível',
        subheadline: 'Descubra como eternizar seus momentos mais especiais em uma canção gravada em estúdio',
        visualPrompt: 'Estúdio de música com iluminação neon magenta e fones profissionais',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1080&q=80',
        layout: 'hero_center',
      },
      {
        id: 'slide_ns_2',
        slideNumber: 2,
        type: 'retention',
        headline: 'Flores murcham, chocolates acabam...',
        subheadline: 'Mas uma canção feita sob medida toca a alma e dura para sempre',
        bodyText: 'Quantas vezes você tentou encontrar o presente ideal para surpreender quem ama e caiu nos mesmos clichês de sempre?',
        visualPrompt: 'Microfone vintage com luz suave dourada',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1080&q=80',
        layout: 'split_card',
      },
      {
        id: 'slide_ns_3',
        slideNumber: 3,
        type: 'body_1',
        headline: 'Como funciona em 3 passos simples:',
        bodyText: '1. Você nos conta a história (detalhes marcantes, apelidos carinhosos, momentos únicos)\n2. Nossos compositores criam letra e harmonia sob medida\n3. Você recebe a música completa em alta definição pronta para emocionar',
        visualPrompt: 'Partitura e fones de ouvido em mesa de madeira',
        imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1080&q=80',
        layout: 'checklist',
      },
      {
        id: 'slide_ns_4',
        slideNumber: 4,
        type: 'body_2',
        headline: 'Produção profissional com emoção real',
        bodyText: 'Unimos tecnologia avançada de arranjos musicais com a sensibilidade de compositores que entendem o poder da poesia cantada.',
        visualPrompt: 'Mesa de som e console de mixagem iluminado',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&q=80',
        layout: 'minimal_quote',
      },
      {
        id: 'slide_ns_5',
        slideNumber: 5,
        type: 'summary_cta',
        headline: 'Eternize a sua história hoje mesmo',
        subheadline: 'Clique no link da nossa bio e crie sua música personalizada na NSMusic!',
        ctaText: 'Quero minha música personalizada 🎵',
        visualPrompt: 'Casal feliz dançando ao som de música suave',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&q=80',
        layout: 'cta_action',
      },
    ],
  },
];
