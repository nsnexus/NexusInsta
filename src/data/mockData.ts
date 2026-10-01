import type { InstagramPost, MetaApiConfig, HashtagGroup, DirectAutoReplyRule } from '../types/instagram';

export const INITIAL_META_CONFIG: MetaApiConfig = {
  appId: '1267545348850227',
  appSecret: 'b9a769aec77bdcecfd6625265007d402',
  accessToken: 'EAASA02ZABQjMBSoxbuz3uMgZADyYCc4gxipsXc5Of9EuOZB5BMr7MQxZCdldGuj6TgxTrxSoZCM6oQ98kQzeo3C6ZAFTRhO2MQp17wXGZBQFB7SxsmZAdkXoTHJbb08fZCGFGnD4FpAdp52ihvCY2rF0QNgzeGqNPBbJhY77aKG7dH0ZA6uY9MX6x5FeUX0PCY00VZCLknGTKb9e6W4dG4Qfa4CW6xO1FYnWXSEV9lFz9zggehdfR4sblE4TTxDf5MUMXGdgfyZAiIGgpQ0m8mgtDK3ykyJgn2zui9WwNjgx2QZDZD',
  pageId: '104829104820194',
  instagramAccountId: '17841442031250300',
  username: '_nsmusic',
  accountName: 'NSMusic',
  avatarUrl: 'https://scontent.fimp1-2.fna.fbcdn.net/v/t51.82787-15/769007290_18077502713401042_8299344586753147233_n.jpg?_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=7d201b&_nc_eui2=AeFnnmd_FbXj3ONVkZRyPqPsPuHgyLvUXgI-4eDIu9ReAqiw-CizDJhsTf-oEhsjkVOgxHvZCQUGyoMsjW6P6XP_&_nc_ohc=H-f36hETIOAQ7kNvwF8F7aX&_nc_oc=AdqNJliunIwtxF1VMy1GpOrGssRdkvVShYYGHy4erKSRhgcA7tofx74YH3pM_aQld8HBw8bOYFFT_Jrf0687A_bw&_nc_zt=23&_nc_ht=scontent.fimp1-2.fna&edm=AJ-jyNUEAAAA&_nc_gid=luB4QSrCT2g5kfAredlW-g&oh=00_AQNyrw0l69GYKBp4x4Jef6ZdcmF9dNSmoXMwEneF6Q46hA&oe=6AC46FE3',
  isConnected: true,
  isLiveMode: true,
  dailyQuotaUsed: 0,
  followersCount: 811,
  mediaCount: 12,
};

export const INITIAL_AUTOPILOT_CONFIG: import('../types/instagram').AiAutopilotConfig = {
  isEnabled: true,
  nichePrompt: 'Produção Musical, Beats, Curiosidades sobre DJs, Bastidores de Estúdio e Lançamentos Musicais da @_nsmusic',
  toneOfVoice: 'Inspirador, Dinâmico, Jovem e Autoritário no mundo da Música',
  postTime: '18:00',
  activeDays: ['seg', 'qua', 'sex'],
  defaultAspectRatio: '4:5',
  autoPublishDirectly: false, // Por segurança, gera agendado para revisão ou disparo imediato
};

export const DEFAULT_AUTO_REPLY_RULES: DirectAutoReplyRule[] = [
  {
    id: 'rule_preco',
    category: 'Vendas & Planos',
    keywords: ['valor', 'preco', 'preço', 'quanto custa', 'tabela', 'orçamento', 'comprar'],
    replyText: 'Olá! Que bom ter você por aqui! 🎵 Nossas produções e músicas personalizadas contam com pacotes exclusivos. Você pode conferir todos os detalhes e solicitar a sua diretamente no nosso portal oficial: https://nsmusic.nsnexus.com.br ou nos conte qual é o seu projeto!',
    isActive: true,
  },
  {
    id: 'rule_personalizada',
    category: 'Música Personalizada',
    keywords: ['musica personalizada', 'música personalizada', 'homenagem', 'casamento', 'dia dos pais', 'aniversario', 'presente'],
    replyText: '✨ Cada história merece uma trilha sonora única! Nós criamos canções exclusivas para casamentos, aniversários, homenagens e momentos inesquecíveis. Envie sua história e saiba mais em: https://nsmusic.nsnexus.com.br',
    isActive: true,
  },
  {
    id: 'rule_parceria',
    category: 'Parcerias & Collabs',
    keywords: ['parceria', 'collab', 'divulgação', 'divulgacao', 'tocar junto', 'dj', 'produtor'],
    replyText: 'E aí! Curtiu o som da @_nsmusic? 🎧 Estamos sempre abertos a colaborações musicais e projetos inovadores. Mande seu perfil ou link das suas tracks no Spotify/SoundCloud para o nosso time conferir!',
    isActive: true,
  },
  {
    id: 'rule_ia',
    category: 'IA & Tecnologia',
    keywords: ['ia', 'inteligencia artificial', 'chatgpt', 'como funciona', 'plataforma', 'site'],
    replyText: '🚀 Na NSMusic unimos criatividade humana com os modelos de ponta de Inteligência Artificial para gerar batidas, arranjos e composições em segundos. Conheça agora: https://nsmusic.nsnexus.com.br',
    isActive: true,
  },
];

export const AI_MUSIC_TEMPLATES = [
  {
    title: 'Músicas Personalizadas & Emoção',
    theme: 'Transforme histórias reais de casais, famílias e homenagens em canções emocionantes',
    caption: '🎵 Transformamos emoções em música personalizada! 💖\n\nCada história merece uma trilha sonora única.\n\n✨ Casamentos\n✨ Homenagens & Aniversários\n✨ Chá revelação\n\nNós criamos músicas exclusivas, com letra personalizada e produção feita especialmente para você.\n\n👉 Acesse nsmusic.nsnexus.com.br\n\n#nsmusic #musicapersonalizada #presentecriativo #homenagem #emocaoemformademusica',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    firstComment: '🎧 Solicite sua canção exclusiva pelo link da bio ou direct!'
  },
  {
    title: 'Sintetizadores & Produção',
    theme: 'Evolução dos sintetizadores analógicos na música eletrônica',
    caption: '🎹 O calor dos sintetizadores analógicos nunca sai de moda!\n\nEnquanto o digital oferece precisão infinita, é nas pequenas imperfeições e na saturação das válvulas que encontramos a verdadeira alma de uma track inesquecível.\n\nQual é o seu synth favorito de todos os tempos?\n\n#nsmusic #producaomusical #beatmaker #synths #studiolife #eletronicmusic',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    firstComment: '🎧 Ouça nossas playlists de referência no link da bio!'
  },
  {
    title: 'Dica de Mixagem & Frequências',
    theme: 'Limpeza de graves e espaço para o sub-bass respirar',
    caption: '🔊 A regra de ouro da mixagem de graves: dê espaço para o Kick e o Sub conversarem sem embolar!\n\n💡 3 passos rápidos:\n1. Aplique High-Pass em todos os instrumentos que não são graves\n2. Use Sidechain sutil entre o Bumbo e o Baixo\n3. Monitore em mono para conferir a compatibilidade de fase\n\nSalve para aplicar na sua próxima sessão de estúdio! 💾\n\n#mixagem #masterizacao #producaodeaudio #audioproducer #flstudio #ableton',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    firstComment: 'Qual DAW você usa no seu setup? Comente aqui embaixo!'
  },
  {
    title: 'Lançamento & Tendências',
    theme: 'O futuro da criação musical com inteligência artificial e novas frequências',
    caption: '⚡ As frequências do futuro: som espacial e experiências imersivas estão redefinindo como vivemos a música.\n\nPreparando novidades sonoras que vão elevar sua experiência auditiva ao próximo nível.\n\nAtive as notificações para não perder os próximos lançamentos da @_nsmusic! 🔔\n\n#lancamento #djset #festivais #futuremusic #nsmusic #musicapersonalizada',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    firstComment: 'Fique ligado nas novidades da semana nos nossos stories!'
  }
];

export const INITIAL_POSTS: InstagramPost[] = [
  {
    id: '18091232666431629',
    mediaUrl: 'https://scontent.cdninstagram.com/v/t51.71878-15/767783673_1258380276316667_3400957898794641036_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_eui2=AeHghR-7_hjKs0ic76oUKpX9-hNNHiVUfAb6E00eJVR8Bmq9m_PMHL8b0qRYcScgybwk_XjkUN3BayQqEnAOA6m2&_nc_ohc=raZnlPzIVTQQ7kNvwHnVw9h&_nc_oc=AdrFzoJN5pNAXjnI4XY1RJ_ITwaYGoPhdqIND1dPjl0OAUSgrUKtN6RQgtSy5llII8vFb7-ylmSEpih2hkyWmFRg&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&edm=AM6HXa8EAAAA&_nc_gid=IIuUSIL1dMJXUgIvWqt5Zw&_nc_tpa=Q5bMBQKbqyS-gRRN5DTKYnpduWJQE9CUMDYYWEHpF7Lt4Hyq-kvntUt4vptZ1uBK38LBrVqlAW-LTd7qqg&oh=00_AQPXhRJdXCVcO9KR6A57pcdxUOy9Ft1xsHyMChZntL6JGQ&oe=6AC484CB',
    caption: '🎵 Transformamos emoções em música personalizada! 💖\n\nCada história merece uma trilha sonora única.\n\nSeja para:\n✨ Dia dos Pais\n✨ Chá revelação\n✨ Casamento\n✨ Aniversário\n✨ Homenagem especial\n✨ Presente emocionante\n\nNós criamos músicas exclusivas, com letra personalizada e produção feita especialmente para você.\n\n💌 Envie sua história e receba uma canção que toca o coração e eterniza momentos inesquecíveis.\n\nnsmusic.nsnexus.com.br\n\n#MusicaPersonalizada #PresenteCriativo #Homenagem #DiaDosPais #ChaRevelacao',
    firstComment: '👉 Acesse nsmusic.nsnexus.com.br e crie a sua canção personalizada!',
    type: 'reel',
    aspectRatio: '9:16',
    scheduledAt: '2026-08-07T11:25:30.000Z',
    publishedAt: '2026-08-07T11:25:30.000Z',
    status: 'published',
    igPostId: '18091232666431629',
    likes: 703,
    comments: 103,
    reach: 8420,
  },
  {
    id: '17953015656247378',
    mediaUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/765917434_18077507984401042_4379914813890302141_n.webp?stp=dst-jpg_e35_tt6&_nc_cat=105&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_eui2=AeGFMS0WDr4QAl4VPqrxfPolDvzzDRN0k0IO_PMNE3STQnsyqd37RTEEOyUP2Qqykij1KAot1iKuy1YrxZKmrtWg&_nc_ohc=JrbKqpDS9fsQ7kNvwGELf74&_nc_oc=AdqaSKBSPHojfMGiq61sKl6VHSmMrrRGhfO5wdToiv8Sa1m5FpRHYSc4R7Zj4G0MjBJCvow4GQhpLHyej2hU9BzR&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&edm=AM6HXa8EAAAA&_nc_gid=IIuUSIL1dMJXUgIvWqt5Zw&oh=00_AQOkEN3k_Mkrt-6F-DLxkOKdQBeeyySZT_m0EqYyfXzh8Q&oe=6AC46070',
    caption: '🎶 A REVOLUÇÃO MUSICAL CHEGOU!\n\nEstamos orgulhosos de apresentar a NSMusic, a sua nova plataforma de criação de músicas com Inteligência Artificial.\n\n🚀 Crie músicas originais em segundos.\n\nEsqueça as barreiras técnicas. Na NSMusic, você é o compositor. Basta digitar sua ideia ou prompt e nossa IA avançada cuida do resto.\n\n👉 EXPERIMENTE AGORA: Link na Bio!\nwww.nsmusic.nsnexus.com.br\n\n#NSMusic #IAMusical #MusicaComIA #CriaçãoMusical #Novidade',
    type: 'feed',
    aspectRatio: '1:1',
    scheduledAt: '2026-08-07T01:35:51.000Z',
    publishedAt: '2026-08-07T01:35:51.000Z',
    status: 'published',
    igPostId: '17953015656247378',
    likes: 1,
    comments: 0,
    reach: 120,
  },
  {
    id: '18575392852068326',
    mediaUrl: 'https://scontent.cdninstagram.com/v/t51.71878-15/771652153_4489957367883322_825813364697112050_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_eui2=AeFL3LS5PW-cmKNmNCGMgOPGYrh8Xp6THRliuHxenpMdGWTQF2zRSUCblX_KL4gbPW1121XSE8H8CAJiTGnx0Lyq&_nc_ohc=oLPsOXgNgIAQ7kNvwFIPfUa&_nc_oc=Adpa8MVR29YFLOPZ1UDpTPlooqiVXP_34CRRb2K7Mo-GrDVExFkr0XAvDr3XlKphb37AES0BXPgezNjKsT6py5VA&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&edm=AM6HXa8EAAAA&_nc_gid=IIuUSIL1dMJXUgIvWqt5Zw&_nc_tpa=Q5bMBQIvTeQgXON_Ey2gepEefAq87cgC6IWl97MxlwlrBVrljmRJHFJ0F-_1MlqNmuUbiIdDhP_j1mBGQQ&oh=00_AQMiKAdR1LPyde-MuZbJjBqZHqB8gufBjXdUXvR5Kwp2Ow&oe=6AC45A3B',
    caption: 'Batidas, melodias e produções sonoras exclusivas. Acesse nsmusic.nsnexus.com.br e transforme suas ideias em música.\n\n#nsmusic #producaomusical #beats #musica #audio',
    type: 'reel',
    aspectRatio: '9:16',
    scheduledAt: '2026-08-08T18:27:35.000Z',
    publishedAt: '2026-08-08T18:27:35.000Z',
    status: 'published',
    igPostId: '18575392852068326',
    likes: 8,
    comments: 1,
    reach: 340,
  }
];

export const HASHTAG_GROUPS: HashtagGroup[] = [
  {
    category: 'NSMusic & Produção',
    tags: ['#nsmusic', '#musicapersonalizada', '#producaomusical', '#beatmaker', '#produtormusical', '#audioproducer', '#studiolife'],
  },
  {
    category: 'Música & Inteligência Artificial',
    tags: ['#iamusical', '#musicacomia', '#criacaomusical', '#tecnologiaeaudio', '#futurodamusica', '#aiartist', '#synths'],
  },
  {
    category: 'Momentos & Emoção',
    tags: ['#homenagem', '#presentecriativo', '#musicanocasamento', '#emocaoemformademusica', '#cancaopersonalizada', '#momentosinesqueciveis'],
  },
  {
    category: 'Beats & Estilo',
    tags: ['#beatsforsale', '#instrumentais', '#trapproducer', '#lofiforstudy', '#electronicmusic', '#novidadesmusicais'],
  },
];

export const SAMPLE_IMAGES = [
  {
    title: 'Estúdio de Produção',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Microfone & Gravação',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Headphones & Mix',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'DJ Setup & Iluminação',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  },
];

