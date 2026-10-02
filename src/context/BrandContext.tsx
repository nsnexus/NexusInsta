import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Brand, 
  Organization, 
  CreditTransaction, 
  ContentIdea, 
  StructuredContent, 
  CarouselSlide,
  ContentObjective,
  CreditReferenceType
} from '../types/brand';
import { 
  INITIAL_ORGANIZATION, 
  INITIAL_BRANDS, 
  INITIAL_CREDIT_TRANSACTIONS, 
  INITIAL_CONTENT_IDEAS, 
  INITIAL_STRUCTURED_CONTENTS 
} from '../data/defaultBrands';

interface BrandContextType {
  organization: Organization;
  brands: Brand[];
  activeBrand: Brand;
  setActiveBrandId: (brandId: string) => void;
  createBrand: (newBrandData: Omit<Brand, 'id' | 'organizationId' | 'createdAt'>) => Brand;
  updateBrand: (brandId: string, updates: Partial<Brand>) => void;
  deleteBrand: (brandId: string) => void;
  
  // Ledger
  creditBalance: number;
  creditTransactions: CreditTransaction[];
  deductCredits: (amount: number, reason: string, referenceType: CreditReferenceType, referenceId?: string) => boolean;
  addCredits: (amount: number, reason: string) => void;
  
  // Ideas & Planner
  contentIdeas: ContentIdea[];
  activeBrandIdeas: ContentIdea[];
  addContentIdea: (idea: Omit<ContentIdea, 'id'>) => ContentIdea;
  updateContentIdea: (id: string, updates: Partial<ContentIdea>) => void;
  deleteContentIdea: (id: string) => void;
  generateIdeasForActiveBrand: (objective?: ContentObjective, count?: number) => Promise<ContentIdea[]>;
  regenerateIdea: (ideaId: string) => Promise<ContentIdea>;
  
  // Structured Contents & Carousels
  structuredContents: StructuredContent[];
  activeBrandContents: StructuredContent[];
  createStructuredContent: (data: Omit<StructuredContent, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => StructuredContent;
  updateStructuredContent: (id: string, updates: Partial<StructuredContent>) => void;
  deleteStructuredContent: (id: string) => void;
  generateCarouselFromIdea: (idea: ContentIdea) => Promise<StructuredContent>;
  updateSlide: (contentId: string, slideId: string, updates: Partial<CarouselSlide>) => void;
  duplicateSlide: (contentId: string, slideId: string) => void;
  removeSlide: (contentId: string, slideId: string) => void;
  
  // Modals & Navigation
  isBrandModalOpen: boolean;
  setIsBrandModalOpen: (open: boolean) => void;
  isLedgerModalOpen: boolean;
  setIsLedgerModalOpen: (open: boolean) => void;
  editingContentId: string | null;
  setEditingContentId: (id: string | null) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Organization & Brands
  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem('nexus_organization');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_ORGANIZATION; }
    }
    return INITIAL_ORGANIZATION;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('nexus_brands');
    if (saved) {
      try { 
        const parsed: Brand[] = JSON.parse(saved);
        const filtered = parsed
          .filter((b) => b.id !== 'brand_mindfit' && b.id !== 'brand_cacamba')
          .map((b) => {
            if (b.id === 'brand_nsmusic') {
              const needsLogo = !b.logoUrl || b.logoUrl.includes('fbcdn.net') || b.logoUrl.includes('unsplash') || b.logoUrl.includes('photo-15');
              const needsDesc = !b.description || b.description.includes('conecta artistas e fãs');
              const needsWeb = !b.websiteUrl || b.websiteUrl.includes('nsnexus.com.br');
              const needsColors = b.colors?.primary === '#FF6F61';
              return {
                ...b,
                name: 'NSMusic',
                handle: '@_nsmusic',
                logoUrl: needsLogo ? '/nsmusic-logo.png' : b.logoUrl,
                websiteUrl: needsWeb ? 'https://nsmusic.ia.br' : b.websiteUrl,
                description: needsDesc ? 'Transforme suas ideias em músicas completas com IA. 🤖🎶 ⚡ Crie faixas originais em segundos, apenas digitando.' : b.description,
                colors: needsColors ? INITIAL_BRANDS[0].colors : b.colors,
              };
            }
            return b;
          });
        if (filtered.length > 0) return filtered;
        return INITIAL_BRANDS; 
      } catch { return INITIAL_BRANDS; }
    }
    return INITIAL_BRANDS;
  });

  const [activeBrandId, setActiveBrandIdState] = useState<string>(() => {
    const saved = localStorage.getItem('nexus_active_brand_id');
    if (saved === 'brand_mindfit' || saved === 'brand_cacamba') return 'brand_nsmusic';
    return saved || INITIAL_BRANDS[0]?.id || 'brand_nsmusic';
  });

  // 2. Credits & Ledger
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => {
    const saved = localStorage.getItem('nexus_credit_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_CREDIT_TRANSACTIONS; }
    }
    return INITIAL_CREDIT_TRANSACTIONS;
  });

  // 3. Ideas & Structured Contents
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>(() => {
    const saved = localStorage.getItem('nexus_content_ideas');
    if (saved) {
      try { 
        const parsed: ContentIdea[] = JSON.parse(saved);
        return parsed.filter((i) => i.brandId !== 'brand_mindfit' && i.brandId !== 'brand_cacamba');
      } catch { return INITIAL_CONTENT_IDEAS; }
    }
    return INITIAL_CONTENT_IDEAS;
  });

  const [structuredContents, setStructuredContents] = useState<StructuredContent[]>(() => {
    const saved = localStorage.getItem('nexus_structured_contents');
    if (saved) {
      try { 
        const parsed: StructuredContent[] = JSON.parse(saved);
        return parsed.filter((c) => c.brandId !== 'brand_mindfit' && c.brandId !== 'brand_cacamba');
      } catch { return INITIAL_STRUCTURED_CONTENTS; }
    }
    return INITIAL_STRUCTURED_CONTENTS;
  });

  // UI Modals
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_organization', JSON.stringify(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem('nexus_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('nexus_active_brand_id', activeBrandId);
  }, [activeBrandId]);

  useEffect(() => {
    localStorage.setItem('nexus_credit_transactions', JSON.stringify(creditTransactions));
  }, [creditTransactions]);

  useEffect(() => {
    localStorage.setItem('nexus_content_ideas', JSON.stringify(contentIdeas));
  }, [contentIdeas]);

  useEffect(() => {
    localStorage.setItem('nexus_structured_contents', JSON.stringify(structuredContents));
  }, [structuredContents]);

  // Migrate legacy data in localStorage to official @_nsmusic data
  useEffect(() => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === 'brand_nsmusic') {
          const needsLogo = !b.logoUrl || b.logoUrl.includes('fbcdn.net') || b.logoUrl.includes('unsplash') || b.logoUrl.includes('photo-15');
          const needsDesc = !b.description || b.description.includes('conecta artistas e fãs');
          const needsWeb = !b.websiteUrl || b.websiteUrl.includes('nsnexus.com.br');
          const needsColors = b.colors?.primary === '#FF6F61';
          if (needsLogo || needsDesc || needsWeb || needsColors) {
            return {
              ...b,
              name: 'NSMusic',
              handle: '@_nsmusic',
              logoUrl: needsLogo ? '/nsmusic-logo.png' : b.logoUrl,
              websiteUrl: needsWeb ? 'https://nsmusic.ia.br' : b.websiteUrl,
              description: needsDesc ? 'Transforme suas ideias em músicas completas com IA. 🤖🎶 ⚡ Crie faixas originais em segundos, apenas digitando.' : b.description,
              colors: needsColors ? INITIAL_BRANDS[0].colors : b.colors,
            };
          }
        }
        return b;
      })
    );
  }, []);

  // Active Brand Helper
  const activeBrand = useMemo(() => {
    const found = brands.find((b) => b.id === activeBrandId);
    return found || brands[0] || INITIAL_BRANDS[0];
  }, [brands, activeBrandId]);

  const setActiveBrandId = useCallback((id: string) => {
    setActiveBrandIdState(id);
  }, []);

  const createBrand = useCallback((newBrandData: Omit<Brand, 'id' | 'organizationId' | 'createdAt'>) => {
    const newId = `brand_${Date.now()}`;
    const brand: Brand = {
      ...newBrandData,
      id: newId,
      organizationId: organization.id,
      createdAt: new Date().toISOString(),
    };
    setBrands((prev) => [brand, ...prev]);
    setActiveBrandIdState(newId);
    return brand;
  }, [organization.id]);

  const updateBrand = useCallback((brandId: string, updates: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBrand = useCallback((brandId: string) => {
    setBrands((prev) => {
      const remaining = prev.filter((b) => b.id !== brandId);
      if (activeBrandId === brandId && remaining.length > 0) {
        setActiveBrandIdState(remaining[0].id);
      }
      return remaining;
    });
  }, [activeBrandId]);

  // Credit Deduction & Ledger
  const deductCredits = useCallback((
    amount: number, 
    reason: string, 
    referenceType: CreditReferenceType, 
    referenceId?: string
  ): boolean => {
    if (organization.creditBalance < amount) {
      return false;
    }
    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organizationId: organization.id,
      brandId: activeBrandId,
      delta: -Math.abs(amount),
      reason,
      referenceType,
      referenceId,
      createdAt: new Date().toISOString(),
    };

    setOrganization((prev) => ({
      ...prev,
      creditBalance: prev.creditBalance - amount,
    }));
    setCreditTransactions((prev) => [newTx, ...prev]);
    return true;
  }, [organization.id, organization.creditBalance, activeBrandId]);

  const addCredits = useCallback((amount: number, reason: string) => {
    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organizationId: organization.id,
      delta: Math.abs(amount),
      reason,
      referenceType: 'recharge',
      createdAt: new Date().toISOString(),
    };
    setOrganization((prev) => ({
      ...prev,
      creditBalance: prev.creditBalance + amount,
    }));
    setCreditTransactions((prev) => [newTx, ...prev]);
  }, [organization.id]);

  // Active Brand Content Filters
  const activeBrandIdeas = useMemo(() => {
    return contentIdeas.filter((idea) => idea.brandId === activeBrand.id);
  }, [contentIdeas, activeBrand.id]);

  const activeBrandContents = useMemo(() => {
    return structuredContents.filter((c) => c.brandId === activeBrand.id);
  }, [structuredContents, activeBrand.id]);

  // Content Ideas Operations
  const addContentIdea = useCallback((ideaData: Omit<ContentIdea, 'id'>) => {
    const newIdea: ContentIdea = {
      ...ideaData,
      id: `idea_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    setContentIdeas((prev) => [newIdea, ...prev]);
    return newIdea;
  }, []);

  const updateContentIdea = useCallback((id: string, updates: Partial<ContentIdea>) => {
    setContentIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, ...updates } : idea))
    );
  }, []);

  const deleteContentIdea = useCallback((id: string) => {
    setContentIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);

  // AI Generation of Ideas for the Active Brand
  const generateIdeasForActiveBrand = useCallback(async (
    objective: ContentObjective = 'vender',
    count: number = 3
  ): Promise<ContentIdea[]> => {
    // Deduct AI text credits (2 credits)
    deductCredits(2, `Geração de pautas editoriais para ${activeBrand.name} (${objective})`, 'ai_text');

    const brandName = activeBrand.name;
    const niche = activeBrand.niche;

    // Generated strategic ideas adhering strictly to the active brand's personality
    const sampleIdeasByBrand: Record<string, Array<{ title: string; hook: string; format: any; pillarIndex: number }>> = {
      brand_nsmusic: [
        {
          title: 'Como Transformar uma Carta de Amor em Hit',
          hook: 'Nossos compositores receberam uma carta de 2 páginas e transformaram nesta música que fez a noiva chorar.',
          format: 'carousel',
          pillarIndex: 0,
        },
        {
          title: '3 Plugins Gratuitos que Parecem de R$ 2.000',
          hook: 'Se você produz no quarto e não tem orçamento para estúdio caro, esses 3 plugins vão salvar sua mix.',
          format: 'carousel',
          pillarIndex: 1,
        },
        {
          title: 'O Drop que Demorou 14 Horas para Ficar Pronto',
          hook: 'A diferença entre uma batida comum e uma batida inesquecível está nos detalhes invisíveis.',
          format: 'reel',
          pillarIndex: 3,
        },
      ],
      brand_mindfit: [
        {
          title: 'A Regra dos 20 Segundos Contra a Procrastinação',
          hook: 'Como diminuir o atrito neural para iniciar tarefas difíceis sem precisar de força de vontade infinita.',
          format: 'carousel',
          pillarIndex: 0,
        },
        {
          title: 'Café às 15h: Por que Está Estragando seu Sono',
          hook: 'A meia-vida da cafeína é de até 8 horas. O que acontece com o sono delta enquanto você dorme.',
          format: 'carousel',
          pillarIndex: 1,
        },
        {
          title: 'Respiração 4-7-8 para Crises de Tensão',
          hook: 'Faça isso agora durante 60 segundos e sinta seus batimentos cardíacos desacelerarem.',
          format: 'reel',
          pillarIndex: 2,
        },
      ],
      brand_cacamba: [
        {
          title: 'Caçamba Cheia: Até Onde Pode Carregar?',
          hook: 'Passar da borda da caçamba pode gerar recusa de transporte e multa de trânsito na hora.',
          format: 'carousel',
          pillarIndex: 1,
        },
        {
          title: 'Calculadora Rápida de Entulho para Reformas',
          hook: 'Quantos metros cúbicos rende quebrar 10m² de piso cerâmico? Veja antes de contratar.',
          format: 'carousel',
          pillarIndex: 0,
        },
        {
          title: 'O Caminho do Entulho: Da sua Obra à Brita Reciclada',
          hook: 'Você sabia que 85% do entulho da Caçamba Flow volta para a construção como base asfáltica?',
          format: 'carousel',
          pillarIndex: 2,
        },
      ],
    };

    const templates = sampleIdeasByBrand[activeBrand.id] || [
      {
        title: `Segredos de Sucesso no Nicho de ${niche}`,
        hook: `Como elevar os resultados da sua marca com métodos comprovados em ${brandName}.`,
        format: 'carousel',
        pillarIndex: 0,
      },
      {
        title: `Guia Prático Passo a Passo em ${brandName}`,
        hook: `Pare de cometer estes 3 erros comuns que atrasam o seu crescimento.`,
        format: 'carousel',
        pillarIndex: 1,
      },
    ];

    const generated: ContentIdea[] = templates.slice(0, count).map((item, idx) => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (idx + 1) * 2);
      scheduledDate.setHours(18, 0, 0, 0);

      const pillar = activeBrand.pillars[item.pillarIndex] || activeBrand.pillars[0];

      return {
        id: `idea_${Date.now()}_${idx}`,
        brandId: activeBrand.id,
        title: item.title,
        hook: item.hook,
        objective: objective || pillar?.objective || 'vender',
        format: item.format,
        scheduledAt: scheduledDate.toISOString(),
        status: 'idea',
        pillarId: pillar?.id,
        campaign: 'Campanha de Crescimento Editorial',
      };
    });

    setContentIdeas((prev) => [...generated, ...prev]);
    return generated;
  }, [activeBrand, deductCredits]);

  // Granular Regeneration of a Single Idea
  const regenerateIdea = useCallback(async (ideaId: string): Promise<ContentIdea> => {
    deductCredits(1, `Regeneração de pauta editorial ${ideaId}`, 'ai_text', ideaId);

    const updatedHook = `[Novo Ângulo IA] ${activeBrand.name}: O segredo definitivo para ${activeBrand.niche.toLowerCase()} que ninguém te conta.`;
    const updatedTitle = `Descubra a Nova Fórmula de ${activeBrand.name}`;

    let newIdea: ContentIdea | undefined;
    setContentIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          newIdea = {
            ...idea,
            title: updatedTitle,
            hook: updatedHook,
            status: 'idea',
          };
          return newIdea;
        }
        return idea;
      })
    );
    return newIdea!;
  }, [activeBrand, deductCredits]);

  // Structured Contents & Carousels
  const createStructuredContent = useCallback((
    data: Omit<StructuredContent, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ) => {
    const newContent: StructuredContent = {
      ...data,
      id: `content_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStructuredContents((prev) => [newContent, ...prev]);
    return newContent;
  }, []);

  const updateStructuredContent = useCallback((id: string, updates: Partial<StructuredContent>) => {
    setStructuredContents((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString(), version: (c.version || 1) + 1 }
          : c
      )
    );
  }, []);

  const deleteStructuredContent = useCallback((id: string) => {
    setStructuredContents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Generate full Carousel from Idea adhering to BestContent 5-slide model
  const generateCarouselFromIdea = useCallback(async (idea: ContentIdea): Promise<StructuredContent> => {
    // Deduct 15 credits for full structured carousel generation
    deductCredits(15, `Geração de Carrossel BestContent: "${idea.title}"`, 'ai_carousel', idea.id);

    const brand = activeBrand;
    const slides: CarouselSlide[] = [
      {
        id: `slide_${Date.now()}_1`,
        slideNumber: 1,
        type: 'cover',
        headline: idea.title,
        subheadline: idea.hook,
        visualPrompt: `Imagem impactante de alta resolução para capa no nicho de ${brand.niche}`,
        imageUrl: brand.logoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1080&q=80',
        layout: 'hero_center',
      },
      {
        id: `slide_${Date.now()}_2`,
        slideNumber: 2,
        type: 'retention',
        headline: 'Por que a maioria erra nisso?',
        subheadline: 'O erro comum que impede você de atingir o melhor resultado',
        bodyText: `No universo de ${brand.niche}, a maioria das pessoas foca apenas nos sintomas e esquece de atacar a causa raiz.`,
        visualPrompt: 'Cena com iluminação dramática e foco em detalhes',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1080&q=80',
        layout: 'split_card',
      },
      {
        id: `slide_${Date.now()}_3`,
        slideNumber: 3,
        type: 'body_1',
        headline: 'O Método em 3 Etapas Práticas:',
        bodyText: `1. Diagnóstico preciso e alinhamento de expectativas\n2. Aplicação do protocolo testado da ${brand.name}\n3. Medição constante de métricas e evolução contínua`,
        visualPrompt: 'Checklist e organização profissional',
        imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1080&q=80',
        layout: 'checklist',
      },
      {
        id: `slide_${Date.now()}_4`,
        slideNumber: 4,
        type: 'body_2',
        headline: 'A consistência gera o resultado inevitável',
        bodyText: `Quando você adota processos sólidos, o crescimento deixa de ser sorte e passa a ser uma consequência direta.`,
        visualPrompt: 'Design limpo e citação de autoridade',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&q=80',
        layout: 'minimal_quote',
      },
      {
        id: `slide_${Date.now()}_5`,
        slideNumber: 5,
        type: 'summary_cta',
        headline: 'Gostou deste conteúdo?',
        subheadline: `Salve este post para consultar mais tarde e compartilhe com quem precisa saber disso!`,
        ctaText: brand.defaultCta || 'Toque no link da bio e saiba mais!',
        visualPrompt: 'Call to action dinâmico com cores da marca',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&q=80',
        layout: 'cta_action',
      },
    ];

    const newContent: StructuredContent = {
      id: `content_${Date.now()}`,
      brandId: brand.id,
      ideaId: idea.id,
      title: idea.title,
      format: 'carousel',
      aspectRatio: '4:5',
      objective: idea.objective,
      headline: idea.title,
      caption: `🔥 ${idea.title}\n\n${idea.hook}\n\n💡 Salve para consultar mais tarde!\n\n👉 ${brand.defaultCta}\n\n#${brand.slug} #conteudocomia #marketingdigital #estrategia`,
      cta: brand.defaultCta,
      hashtags: [`#${brand.slug}`, '#conteudocomia', '#socialmedia', '#crescimento'],
      slides,
      version: 1,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      abVariations: {
        hooks: [
          idea.hook,
          `O segredo que ninguém revela sobre ${brand.niche}`,
          `3 coisas que você precisa saber hoje sobre ${brand.name}`
        ],
        ctas: [
          brand.defaultCta,
          'Comente "EU QUERO" para receber os detalhes no direct',
          'Salve este carrossel e compartilhe com sua equipe'
        ]
      }
    };

    setStructuredContents((prev) => [newContent, ...prev]);

    // Link idea to generated content
    setContentIdeas((prev) =>
      prev.map((i) =>
        i.id === idea.id ? { ...i, status: 'draft', structuredContentId: newContent.id } : i
      )
    );

    setEditingContentId(newContent.id);
    return newContent;
  }, [activeBrand, deductCredits]);

  // Slide management in Carousels
  const updateSlide = useCallback((contentId: string, slideId: string, updates: Partial<CarouselSlide>) => {
    setStructuredContents((prev) =>
      prev.map((content) => {
        if (content.id !== contentId) return content;
        return {
          ...content,
          updatedAt: new Date().toISOString(),
          slides: content.slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s)),
        };
      })
    );
  }, []);

  const duplicateSlide = useCallback((contentId: string, slideId: string) => {
    setStructuredContents((prev) =>
      prev.map((content) => {
        if (content.id !== contentId) return content;
        const targetIndex = content.slides.findIndex((s) => s.id === slideId);
        if (targetIndex === -1) return content;
        const targetSlide = content.slides[targetIndex];
        const newSlide: CarouselSlide = {
          ...targetSlide,
          id: `slide_${Date.now()}_copy`,
          slideNumber: targetSlide.slideNumber + 1,
          headline: `${targetSlide.headline} (Cópia)`,
        };
        const newSlides = [...content.slides];
        newSlides.splice(targetIndex + 1, 0, newSlide);
        // Renumber slides
        const renumbered = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        return { ...content, slides: renumbered, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const removeSlide = useCallback((contentId: string, slideId: string) => {
    setStructuredContents((prev) =>
      prev.map((content) => {
        if (content.id !== contentId || content.slides.length <= 1) return content;
        const filtered = content.slides.filter((s) => s.id !== slideId);
        const renumbered = filtered.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        return { ...content, slides: renumbered, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  return (
    <BrandContext.Provider
      value={{
        organization,
        brands,
        activeBrand,
        setActiveBrandId,
        createBrand,
        updateBrand,
        deleteBrand,
        creditBalance: organization.creditBalance,
        creditTransactions,
        deductCredits,
        addCredits,
        contentIdeas,
        activeBrandIdeas,
        addContentIdea,
        updateContentIdea,
        deleteContentIdea,
        generateIdeasForActiveBrand,
        regenerateIdea,
        structuredContents,
        activeBrandContents,
        createStructuredContent,
        updateStructuredContent,
        deleteStructuredContent,
        generateCarouselFromIdea,
        updateSlide,
        duplicateSlide,
        removeSlide,
        isBrandModalOpen,
        setIsBrandModalOpen,
        isLedgerModalOpen,
        setIsLedgerModalOpen,
        editingContentId,
        setEditingContentId,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
