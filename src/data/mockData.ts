import type { InstagramPost, MetaApiConfig, HashtagGroup } from '../types/instagram';

export const INITIAL_META_CONFIG: MetaApiConfig = {
  appId: '1098425192837492',
  appSecret: '8f7a9c4b2e1d03589a712f84b6c93e10',
  accessToken: 'EAAQ...v21_EAABwzLpZC6c7ZAQZDZD_LONG_LIVED_PAGE_TOKEN',
  pageId: '104829104820194',
  instagramAccountId: '17841405928374821',
  username: 'agenciadigital.br',
  accountName: 'Agência Digital Brasil | Marketing 360',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  isConnected: true,
  isLiveMode: false,
  dailyQuotaUsed: 8,
};

export const INITIAL_POSTS: InstagramPost[] = [
  {
    id: 'post_1',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    caption: '🚀 O design do futuro já começou! Novas soluções visuais e automação inteligente para sua marca se destacar no feed em 2026.\n\nQual dessas tendências você já está aplicando no seu negócio?\n\n#design #criatividade #inovacao #marketingdigital #tecnologia #socialmedia',
    firstComment: '👉 Salve esse post para consultar nossa lista de referências depois!',
    type: 'feed',
    aspectRatio: '4:5',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    status: 'scheduled',
  },
  {
    id: 'post_2',
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    caption: '💻 Bastidores de uma sessão produtiva: desenvolvendo a nova esteira de automações para nossos clientes parceiros. A consistência é o maior hack de crescimento orgânico.\n\n#empreendedorismo #produtividade #setup #devlife #startup #negociosdigitais',
    type: 'feed',
    aspectRatio: '1:1',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    status: 'scheduled',
  },
  {
    id: 'post_3',
    mediaUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    caption: '💡 3 estratégias validadas para converter seguidores em clientes fiéis através do direct:\n\n1. Responda em menos de 15 minutos\n2. Crie pontes personalizadas com áudio\n3. Tenha um CTA claro em todos os stories\n\nComente "AUTOMAR" para receber nosso playbook no direct! 📩',
    type: 'reel',
    aspectRatio: '9:16',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: 'scheduled',
  },
  {
    id: 'post_pub_1',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    caption: '📊 Relatório mensal fechado com chave de ouro: +142% de alcance orgânico após ajustarmos o horário de postagem via automação da Meta Graph API!\n\n#metricas #crescimento #socialmedia #instagrammarketing',
    type: 'feed',
    aspectRatio: '4:5',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    status: 'published',
    creationId: '18029384729104821',
    igPostId: '17992019482019482',
    likes: 342,
    comments: 48,
    reach: 4890,
  },
  {
    id: 'post_pub_2',
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Reunião de alinhamento com o time criativo. Grandes ideias nascem de conexões autênticas e liberdade para testar o novo. ✨\n\n#equipe #culturacorporativa #agencia #designers',
    type: 'feed',
    aspectRatio: '1:1',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    status: 'published',
    creationId: '18029384729104899',
    igPostId: '17992019482019777',
    likes: 512,
    comments: 63,
    reach: 6720,
  }
];

export const HASHTAG_GROUPS: HashtagGroup[] = [
  {
    category: 'Marketing & Vendas',
    tags: ['#marketingdigital', '#socialmediamanager', '#gestaoderedessociais', '#conteudodevalor', '#trafegoorganico', '#engajamento'],
  },
  {
    category: 'Tecnologia & Inovação',
    tags: ['#tecnologia', '#inovacao', '#automacao', '#inteligenciaartificial', '#programacao', '#devlife', '#saas'],
  },
  {
    category: 'Design & Criatividade',
    tags: ['#designgrafico', '#criatividade', '#identidadevisual', '#uxdesign', '#uidesign', '#branding'],
  },
  {
    category: 'Negócios & Empreendedorismo',
    tags: ['#empreendedorismo', '#negociosdigitais', '#sucesso', '#startups', '#lideranca', '#mindset'],
  },
];

export const SAMPLE_IMAGES = [
  {
    title: 'Minimalista & Tech',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Workspace Produtivo',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Equipe Criativa',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Gráficos & Estratégia',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Retrato & Autoridade',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Criatividade Abstrata',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
  }
];
