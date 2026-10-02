import type { ContentAutomationRule, ContentAutomationLog, ClientSongItem } from '../types/instagram';

const getSupabaseConfig = () => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ptrrrkeffotilxxxdwww.supabase.co';
  const key = (import.meta as any).env?.VITE_SUPABASE_KEY || (typeof window !== 'undefined' ? localStorage.getItem('nexus_supabase_key') : '') || '';
  return { url, key };
};

const SUPABASE_URL = getSupabaseConfig().url;
const headers = {
  get apikey() { return getSupabaseConfig().key; },
  get Authorization() { return `Bearer ${getSupabaseConfig().key}`; },
  'Content-Type': 'application/json',
};

export const SupabaseService = {
  /**
   * Busca todas as regras de automação
   */
  async getAutomationRules(): Promise<ContentAutomationRule[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content_automations?select=*&order=created_at.asc`, {
        headers,
      });
      if (!res.ok) throw new Error(`Falha ao buscar regras: HTTP ${res.status}`);
      const data = await res.json();
      return (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        isActive: r.is_active,
        mode: r.mode || 'AUTOMATICO',
        contentType: r.content_type || 'MUSICA_CLIENTE',
        mediaFormat: r.media_format || 'REELS',
        platforms: r.platforms || ['INSTAGRAM'],
        daysOfWeek: r.days_of_week || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
        scheduledTime: r.scheduled_time || '10:00',
        audioClipDuration: r.audio_clip_duration || 45,
        customPrompt: r.custom_prompt || '',
        aiModel: r.ai_model || 'gpt-6-astra',
        imageModel: r.image_model || 'gpt-image-2.5-sunburst',
        lastRunAt: r.last_run_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.error('[SupabaseService] getAutomationRules error:', err);
      return [];
    }
  },

  /**
   * Salva ou atualiza uma regra de automação
   */
  async upsertAutomationRule(rule: Partial<ContentAutomationRule> & { name: string }): Promise<boolean> {
    try {
      const payload: any = {
        name: rule.name,
        is_active: rule.isActive ?? true,
        mode: rule.mode || 'AUTOMATICO',
        content_type: rule.contentType || 'MUSICA_CLIENTE',
        media_format: rule.mediaFormat || 'REELS',
        platforms: rule.platforms || ['INSTAGRAM'],
        days_of_week: rule.daysOfWeek || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
        scheduled_time: rule.scheduledTime || '10:00',
        audio_clip_duration: rule.audioClipDuration || 45,
        custom_prompt: rule.customPrompt || '',
        ai_model: rule.aiModel || 'gpt-6-astra',
        image_model: rule.imageModel || 'gpt-image-2.5-sunburst',
        updated_at: new Date().toISOString(),
      };

      if (rule.id) {
        payload.id = rule.id;
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/content_automations`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch (err) {
      console.error('[SupabaseService] upsertAutomationRule error:', err);
      return false;
    }
  },

  /**
   * Deleta uma regra de automação
   */
  async deleteAutomationRule(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content_automations?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    } catch (err) {
      console.error('[SupabaseService] deleteAutomationRule error:', err);
      return false;
    }
  },

  /**
   * Busca músicas de clientes no banco da NS Music
   * @param authorizedOnly Se true, traz apenas as com autorização para marketing
   * @param limit Limite de resultados (padrão 50)
   */
  async getClientSongs(authorizedOnly = false, limit = 50): Promise<ClientSongItem[]> {
    try {
      let query = `${SUPABASE_URL}/rest/v1/orders?select=id,order_number,customer_name,honoree_name,occasion,music_style,music_mood,story,lyrics,audio_url,authorized_for_marketing,published_on_social,published_social_at,created_at&payment_status=eq.PAGAMENTO_APROVADO&production_status=eq.AUDIO_GERADO&audio_url=not.is.null`;

      if (authorizedOnly) {
        query += '&authorized_for_marketing=eq.true';
      }

      query += `&order=authorized_for_marketing.desc,created_at.desc&limit=${limit}`;

      const res = await fetch(query, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return (data || []).map((row: any) => ({
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name || 'Cliente NS Music',
        honoreeName: row.honoree_name || 'Homenageado',
        occasion: row.occasion || 'Música Especial',
        musicStyle: row.music_style || 'Estilo Variado',
        musicMood: row.music_mood || '',
        story: row.story || '',
        lyrics: row.lyrics || '',
        audioUrl: row.audio_url,
        authorizedForMarketing: Boolean(row.authorized_for_marketing),
        publishedOnSocial: Boolean(row.published_on_social),
        publishedSocialAt: row.published_social_at,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('[SupabaseService] getClientSongs error:', err);
      return [];
    }
  },

  /**
   * Altera a autorização de divulgação de uma música
   */
  async toggleMusicMarketingAuthorization(orderId: string, authorized: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          authorized_for_marketing: authorized,
          updated_at: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('[SupabaseService] toggleMusicMarketingAuthorization error:', err);
      return false;
    }
  },

  /**
   * Sorteia aleatoriamente uma música autorizada que AINDA NÃO tenha sido publicada
   */
  async getRandomEligibleSong(): Promise<ClientSongItem | null> {
    try {
      const query = `${SUPABASE_URL}/rest/v1/orders?select=id,order_number,customer_name,honoree_name,occasion,music_style,music_mood,story,lyrics,audio_url,authorized_for_marketing,published_on_social,created_at&payment_status=eq.PAGAMENTO_APROVADO&production_status=eq.AUDIO_GERADO&authorized_for_marketing=eq.true&published_on_social=eq.false&audio_url=not.is.null&limit=30`;

      const res = await fetch(query, { headers });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return null;

      // Sorteia aleatoriamente
      const randomIndex = Math.floor(Math.random() * data.length);
      const row = data[randomIndex];

      return {
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name || 'Cliente NS Music',
        honoreeName: row.honoree_name || 'Homenageado',
        occasion: row.occasion || 'Música Especial',
        musicStyle: row.music_style || 'Estilo Variado',
        musicMood: row.music_mood || '',
        story: row.story || '',
        lyrics: row.lyrics || '',
        audioUrl: row.audio_url,
        authorizedForMarketing: true,
        publishedOnSocial: false,
        createdAt: row.created_at,
      };
    } catch (err) {
      console.error('[SupabaseService] getRandomEligibleSong error:', err);
      return null;
    }
  },

  /**
   * Marca uma música como publicada nas redes
   */
  async markSongAsPublished(orderId: string): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          published_on_social: true,
          published_social_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('[SupabaseService] markSongAsPublished error:', err);
      return false;
    }
  },

  /**
   * Busca histórico de postagens e calendário
   */
  async getAutomationLogs(): Promise<ContentAutomationLog[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content_automation_logs?select=*&order=scheduled_for.desc&limit=100`, {
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return (data || []).map((row: any) => ({
        id: row.id,
        automationId: row.automation_id,
        automationName: row.automation_name,
        contentType: row.content_type,
        mediaFormat: row.media_format,
        platforms: row.platforms || ['INSTAGRAM'],
        status: row.status,
        orderId: row.order_id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        honoreeName: row.honoree_name,
        musicStyle: row.music_style,
        occasion: row.occasion,
        audioUrl: row.audio_url,
        themeConcept: row.theme_concept,
        imagePrompt: row.image_prompt,
        imageUrl: row.image_url,
        videoUrl: row.video_url,
        caption: row.caption || '',
        hashtags: row.hashtags || [],
        metaCreationId: row.meta_creation_id,
        metaPostId: row.meta_post_id,
        permalink: row.permalink,
        errorMessage: row.error_message,
        retryCount: row.retry_count || 0,
        scheduledFor: row.scheduled_for,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error('[SupabaseService] getAutomationLogs error:', err);
      return [];
    }
  },

  /**
   * Cria ou atualiza um registro de log no Supabase
   */
  async upsertAutomationLog(log: Partial<ContentAutomationLog> & { caption: string; contentType: string }): Promise<ContentAutomationLog | null> {
    try {
      const payload: any = {
        automation_id: log.automationId,
        automation_name: log.automationName,
        content_type: log.contentType,
        media_format: log.mediaFormat || 'FEED',
        platforms: log.platforms || ['INSTAGRAM'],
        status: log.status || 'PUBLICADO',
        order_id: log.orderId,
        order_number: log.orderNumber,
        customer_name: log.customerName,
        honoree_name: log.honoreeName,
        music_style: log.musicStyle,
        occasion: log.occasion,
        audio_url: log.audioUrl,
        theme_concept: log.themeConcept,
        image_prompt: log.imagePrompt,
        image_url: log.imageUrl,
        video_url: log.videoUrl,
        caption: log.caption,
        hashtags: log.hashtags || [],
        meta_creation_id: log.metaCreationId,
        meta_post_id: log.metaPostId,
        permalink: log.permalink,
        error_message: log.errorMessage,
        retry_count: log.retryCount || 0,
        scheduled_for: log.scheduledFor || new Date().toISOString(),
        published_at: log.publishedAt,
        updated_at: new Date().toISOString(),
      };

      if (log.id) {
        payload.id = log.id;
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/content_automation_logs`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const returned = await res.json();
      return returned?.[0] || null;
    } catch (err) {
      console.error('[SupabaseService] upsertAutomationLog error:', err);
      return null;
    }
  },

  /**
   * Deleta um log
   */
  async deleteAutomationLog(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content_automation_logs?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    } catch (err) {
      console.error('[SupabaseService] deleteAutomationLog error:', err);
      return false;
    }
  },
};
