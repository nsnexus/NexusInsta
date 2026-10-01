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

