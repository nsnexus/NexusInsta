export type ContentObjective = 
  | 'vender' 
  | 'educar' 
  | 'autoridade' 
  | 'engajamento' 
  | 'trafego' 
  | 'crescimento';

export type ContentFormat = 'carousel' | 'feed' | 'reel' | 'story';
export type CarouselSlideType = 'cover' | 'retention' | 'body_1' | 'body_2' | 'summary_cta';
export type CarouselSlideLayout = 'hero_center' | 'split_card' | 'minimal_quote' | 'checklist' | 'cta_action';

export interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export interface BrandTypography {
  headingFont: string;
  bodyFont: string;
}

export interface EditorialPillar {
  id: string;
  name: string;
  objective: ContentObjective;
  description: string;
  suggestedFormats: ContentFormat[];
}

export interface Brand {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
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
  colors: BrandColors;
  typography: BrandTypography;
  logoUrl: string;
  pillars: EditorialPillar[];
  brandMemoryJson?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  creditBalance: number;
}

export type CreditReferenceType = 
  | 'ai_text' 
  | 'ai_image' 
  | 'ai_carousel' 
  | 'ai_reel' 
  | 'recharge' 
  | 'refund';

export interface CreditTransaction {
  id: string;
  organizationId: string;
  brandId?: string;
  delta: number; // ex: -15 ou +100
  reason: string;
  referenceType: CreditReferenceType;
  referenceId?: string;
  createdAt: string;
}

export interface CarouselSlide {
  id: string;
  slideNumber: number;
  type: CarouselSlideType;
  headline: string;
  subheadline?: string;
  bodyText?: string;
  ctaText?: string;
  visualPrompt?: string;
  imageUrl?: string;
  layout: CarouselSlideLayout;
  customBgColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
}

export interface ReelScene {
  sceneNumber: number;
  durationSeconds: number;
  screenText: string;
  visualDirection: string;
  voiceoverText: string;
  mediaUrl?: string;
}

export interface StructuredContent {
  id: string;
  brandId: string;
  ideaId?: string;
  title: string;
  format: ContentFormat;
  aspectRatio: '4:5' | '1:1' | '9:16';
  objective: ContentObjective;
  headline: string;
  caption: string;
  cta: string;
  hashtags: string[];
  slides: CarouselSlide[];
  reelScenes?: ReelScene[];
  abVariations?: {
    hooks: string[];
    ctas: string[];
  };
  status: 'draft' | 'approved' | 'scheduled' | 'published';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentIdea {
  id: string;
  brandId: string;
  title: string;
  hook: string;
  objective: ContentObjective;
  format: ContentFormat;
  scheduledAt?: string;
  status: 'idea' | 'generating' | 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';
  campaign?: string;
  pillarId?: string;
  structuredContentId?: string;
}

export const AI_CREDIT_COSTS: Record<CreditReferenceType, number> = {
  ai_text: 2,
  ai_image: 5,
  ai_carousel: 15,
  ai_reel: 20,
  recharge: 0,
  refund: 0,
};
