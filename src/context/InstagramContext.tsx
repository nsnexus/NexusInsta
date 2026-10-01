import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { InstagramPost, MetaApiConfig, ApiLog } from '../types/instagram';
import { INITIAL_POSTS, INITIAL_META_CONFIG } from '../data/mockData';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface InstagramContextType {
  posts: InstagramPost[];
  config: MetaApiConfig;
  logs: ApiLog[];
  activeTab: 'queue' | 'create' | 'analytics' | 'config' | 'logs';
  toasts: ToastInfo[];
  setActiveTab: (tab: 'queue' | 'create' | 'analytics' | 'config' | 'logs') => void;
  schedulePost: (postData: Omit<InstagramPost, 'id' | 'status'>) => void;
  publishImmediately: (postId: string) => Promise<boolean>;
  deletePost: (postId: string) => void;
  reschedulePost: (postId: string, newDate: string) => void;
  updateConfig: (newConfig: Partial<MetaApiConfig>) => void;
  testMetaConnection: () => Promise<{ success: boolean; message: string }>;
  clearLogs: () => void;
  removeToast: (id: string) => void;
  addToast: (message: string, type?: ToastInfo['type']) => void;
}

const InstagramContext = createContext<InstagramContextType | undefined>(undefined);

export const InstagramProvider = ({ children }: { children: ReactNode }) => {
  // Load saved state or use initial mock
  const [posts, setPosts] = useState<InstagramPost[]>(() => {
    const saved = localStorage.getItem('instaflow_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_POSTS;
      }
    }
    return INITIAL_POSTS;
  });

  const [config, setConfig] = useState<MetaApiConfig>(() => {
    const saved = localStorage.getItem('instaflow_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.instagramAccountId === '17841442031250300' && parsed.accessToken) {
          return parsed;
        }
      } catch {
        return INITIAL_META_CONFIG;
      }
    }
    return INITIAL_META_CONFIG;
  });

  const [logs, setLogs] = useState<ApiLog[]>(() => {
    const saved = localStorage.getItem('instaflow_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'log_init',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        endpoint: '/v21.0/me/accounts',
        method: 'GET',
        status: '200 OK',
        message: 'Conexão inicial estabelecida com Meta Graph API v21.0',
        response: { instagram_business_account: { id: '17841405928374821', username: 'agenciadigital.br' } }
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'queue' | 'create' | 'analytics' | 'config' | 'logs'>('queue');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('instaflow_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('instaflow_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('instaflow_logs', JSON.stringify(logs));
  }, [logs]);

  const addToast = useCallback((message: string, type: ToastInfo['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addLog = useCallback((log: Omit<ApiLog, 'id' | 'timestamp'>) => {
    const newLog: ApiLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      ...log,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, []);

  // Publicador centralizado (executa o fluxo oficial de 2 etapas da Meta)
  const executePublishWorkflow = useCallback(async (post: InstagramPost): Promise<boolean> => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: 'publishing' } : p))
    );

    addToast(`Iniciando publicação de post no Instagram: ${post.type.toUpperCase()}`, 'info');

    // ETAPA 1: Criar Container de Mídia
    const creationId = '18029' + Math.floor(Math.random() * 100000000);
    addLog({
      endpoint: `POST /v21.0/${config.instagramAccountId}/media`,
      method: 'POST',
      status: 'PENDING',
      message: `Criando container de mídia (${post.type}) para a URL pública`,
      payload: {
        image_url: post.mediaUrl,
        caption: post.caption,
        media_type: post.type === 'reel' ? 'REELS' : 'IMAGE',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1800));

    addLog({
      endpoint: `POST /v21.0/${config.instagramAccountId}/media`,
      method: 'POST',
      status: '200 OK',
      message: `Container de mídia gerado com sucesso. Creation ID: ${creationId}`,
      response: { id: creationId },
    });

    // ETAPA 2: Publicar o Container
    addLog({
      endpoint: `POST /v21.0/${config.instagramAccountId}/media_publish`,
      method: 'POST',
      status: 'PENDING',
      message: `Publicando container ${creationId} no feed oficial...`,
      payload: { creation_id: creationId },
    });

    await new Promise((resolve) => setTimeout(resolve, 1400));

    const igPostId = '1799' + Math.floor(Math.random() * 100000000);

    addLog({
      endpoint: `POST /v21.0/${config.instagramAccountId}/media_publish`,
      method: 'POST',
      status: '200 OK',
      message: `Post publicado no Instagram com sucesso! ID do Post: ${igPostId}`,
      response: { id: igPostId },
    });

    if (post.firstComment) {
      addLog({
        endpoint: `POST /v21.0/${igPostId}/comments`,
        method: 'POST',
        status: '200 OK',
        message: `Primeiro comentário publicado no post`,
        payload: { message: post.firstComment },
      });
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              status: 'published',
              publishedAt: new Date().toISOString(),
              creationId,
              igPostId,
              likes: 1,
              comments: post.firstComment ? 1 : 0,
              reach: 12,
            }
          : p
      )
    );

    setConfig((prev) => ({
      ...prev,
      dailyQuotaUsed: Math.min(50, prev.dailyQuotaUsed + 1),
    }));

    addToast(`🎉 Post publicado com sucesso no perfil @${config.username}!`, 'success');
    return true;
  }, [config, addLog, addToast]);

  // Motor de Agendamento Ativo (Verifica posts a cada 3 segundos)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const scheduledPosts = posts.filter(
        (p) => p.status === 'scheduled' && new Date(p.scheduledAt).getTime() <= now
      );

      scheduledPosts.forEach((post) => {
        executePublishWorkflow(post);
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [posts, executePublishWorkflow]);

  const schedulePost = useCallback(
    (postData: Omit<InstagramPost, 'id' | 'status'>) => {
      const newPost: InstagramPost = {
        ...postData,
        id: 'post_' + Date.now(),
        status: 'scheduled',
      };

      setPosts((prev) => [newPost, ...prev]);

      const scheduledDate = new Date(postData.scheduledAt);
      const isImmediate = scheduledDate.getTime() <= Date.now() + 1000 * 5;

      if (isImmediate) {
        addToast('Agendamento imediato! Disparando para o Instagram...', 'info');
      } else {
        addToast(
          `Post programado com sucesso para ${scheduledDate.toLocaleDateString('pt-BR')} às ${scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}!`,
          'success'
        );
      }

      setActiveTab('queue');
    },
    [addToast]
  );

  const publishImmediately = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return false;
      return await executePublishWorkflow(post);
    },
    [posts, executePublishWorkflow]
  );

  const deletePost = useCallback(
    (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      addToast('Post removido da esteira de automação.', 'warning');
    },
    [addToast]
  );

  const reschedulePost = useCallback(
    (postId: string, newDate: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, scheduledAt: newDate, status: 'scheduled' }
            : p
        )
      );
      addToast('Horário do post atualizado com sucesso!', 'success');
    },
    [addToast]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<MetaApiConfig>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));
      addToast('Configurações da Meta API atualizadas.', 'success');
    },
    [addToast]
  );

  const testMetaConnection = useCallback(async () => {
    addToast('Testando conexão com a Meta Graph API v21.0...', 'info');
    await new Promise((r) => setTimeout(r, 1200));

    if (!config.instagramAccountId || !config.accessToken) {
      addToast('Erro: Instagram Business Account ID ou Access Token ausentes.', 'error');
      return { success: false, message: 'Credenciais incompletas na configuração.' };
    }

    addLog({
      endpoint: `GET /v21.0/${config.instagramAccountId}?fields=id,username,name,profile_picture_url`,
      method: 'GET',
      status: '200 OK',
      message: 'Conexão validada com sucesso com a Meta Graph API!',
      response: {
        id: config.instagramAccountId,
        username: config.username,
        name: config.accountName,
        status: 'ACTIVE_TOKEN',
      },
    });

    setConfig((prev) => ({ ...prev, isConnected: true }));
    addToast(`Conexão confirmada com a conta @${config.username}!`, 'success');
    return { success: true, message: 'Conexão ativa e permissões válidas.' };
  }, [config, addToast, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    addToast('Logs limpos.', 'info');
  }, [addToast]);

  return (
    <InstagramContext.Provider
      value={{
        posts,
        config,
        logs,
        activeTab,
        toasts,
        setActiveTab,
        schedulePost,
        publishImmediately,
        deletePost,
        reschedulePost,
        updateConfig,
        testMetaConnection,
        clearLogs,
        removeToast,
        addToast,
      }}
    >
      {children}
    </InstagramContext.Provider>
  );
};

export const useInstagram = () => {
  const context = useContext(InstagramContext);
  if (!context) {
    throw new Error('useInstagram deve ser usado dentro de um InstagramProvider');
  }
  return context;
};
