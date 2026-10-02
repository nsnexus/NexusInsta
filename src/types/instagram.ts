export type PostStatus = 'scheduled' | 'publishing' | 'published' | 'failed';
export type PostType = 'feed' | 'reel' | 'story';
export type AspectRatio = '1:1' | '4:5' | '9:16';

export interface InstagramPost {
  id: string;
  mediaUrl: string;
  caption: string;
  firstComment?: string;
  type: PostType;
  aspectRatio: AspectRatio;
  scheduledAt: string; // ISO date string
  status: PostStatus;
  publishedAt?: string;
  creationId?: string;
  igPostId?: string;
  likes?: number;
  comments?: number;
  reach?: number;
  errorMessage?: string;
  generatedByAi?: boolean;
}

export interface MetaApiConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  pageId: string;
  instagramAccountId: string;
  username: string;
  accountName: string;
  avatarUrl: string;
  isConnected: boolean;
  isLiveMode: boolean;
  dailyQuotaUsed: number;
  followersCount?: number;
  mediaCount?: number;
}

export interface AiAutopilotConfig {
  isEnabled: boolean;
  nichePrompt: string;
  toneOfVoice: string;
  postTime: string;
  activeDays: string[]; // ['seg', 'qua', 'sex']
  openaiApiKey?: string;
  defaultAspectRatio: AspectRatio;
  autoPublishDirectly: boolean; // se true publica direto, se false cria agendado
}

export interface DirectAutoReplyRule {
  id: string;
  keywords: string[];
  replyText: string;
  isActive: boolean;
  category: string;
}

export interface DirectMessageItem {
  id: string;
  senderName: string;
  senderHandle: string;
  senderAvatar?: string;
  messageText: string;
  timestamp: string;
  isIncoming: boolean;
  repliedAutomatically?: boolean;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: 'POST' | 'GET';
  status: '200 OK' | 'PENDING' | 'ERROR';
  message: string;
  payload?: Record<string, any>;
  response?: Record<string, any>;
}

export interface HashtagGroup {
  category: string;
  tags: string[];
}

export type AutomationContentType = 'MUSICA_CLIENTE' | 'INSTITUCIONAL';
export type AutomationMediaFormat = 'REELS' | 'FEED';
export type AutomationExecutionMode = 'AUTOMATICO' | 'APROVACAO';
export type AutomationPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK';
export type AutomationLogStatus = 'AGUARDANDO_APROVACAO' | 'AGENDADO' | 'PUBLICANDO' | 'PUBLICADO' | 'FALHA';

export interface ContentAutomationRule {
  id: string;
  name: string;
  isActive: boolean;
  mode: AutomationExecutionMode;
  contentType: AutomationContentType;
  mediaFormat: AutomationMediaFormat;
  platforms: AutomationPlatform[];
  daysOfWeek: string[]; // ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
  scheduledTime: string; // '10:00', '18:00'
  audioClipDuration: number; // 30, 45, 60
  customPrompt?: string;
  aiModel: string; // 'gpt-6-astra', 'gpt-6.1-sol', 'gpt-5.4-pro', 'gpt-4o'
  imageModel: string; // 'gpt-image-2.5-sunburst', 'dall-e-3'
  lastRunAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentAutomationLog {
  id: string;
  automationId?: string;
  automationName?: string;
  contentType: AutomationContentType;
  mediaFormat: AutomationMediaFormat;
  platforms: AutomationPlatform[];
  status: AutomationLogStatus;
  
  // Detalhes da música do cliente
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  honoreeName?: string;
  musicStyle?: string;
  occasion?: string;
  audioUrl?: string;
  
  // Conteúdo gerado pela IA
  themeConcept?: string;
  imagePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  hashtags: string[];
  
  // Meta API
  metaCreationId?: string;
  metaPostId?: string;
  permalink?: string;
  
  // Logs e datas
  errorMessage?: string;
  retryCount: number;
  scheduledFor: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSongItem {
  id: string;
  orderNumber: string;
  customerName: string;
  honoreeName: string;
  occasion: string;
  musicStyle: string;
  musicMood?: string;
  story?: string;
  lyrics?: string;
  audioUrl: string;
  authorizedForMarketing: boolean;
  publishedOnSocial: boolean;
  publishedSocialAt?: string;
  createdAt: string;
}

