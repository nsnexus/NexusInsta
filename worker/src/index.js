// Cloudflare Worker: nexusinsta-robot
// Executa 100% autônomo na nuvem às 10:00 e 18:00 (Horário de Brasília)

function getSecrets(env = {}) {
  return {
    openaiKey: env.OPENAI_KEY || "",
    metaToken: env.META_ACCESS_TOKEN || env.META_TOKEN || "",
    igAccountId: env.INSTAGRAM_ACCOUNT_ID || "17841442031250300",
    supabaseUrl: env.SUPABASE_URL || "https://ptrrrkeffotilxxxdwww.supabase.co",
    supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || "",
  };
}

const INSTITUTIONAL_THEMES = [
  "Músicas personalizadas para casamentos, declarações de amor e votos matrimoniais inesquecíveis",
  "Homenagem emocionante para mãe ou pai com memórias de infância em forma de canção de estúdio",
  "Pedido de casamento ou início de namoro com música exclusiva contando como o casal se conheceu",
  "Músicas para filhos e revelação de nome: eternizando a chegada do maior amor do mundo",
  "Aniversário marcante e celebração de conquistas cantadas em estilo profissional",
  "Curiosidades dos bastidores da NS Music: da história do cliente até a canção finalizada",
  "Variedade de ritmos: do sertanejo acústico ao pagode alegre, gospel e MPB com qualidade de estúdio",
];

// 1. Executa post de Música de Cliente
async function runClientSongAutomation(env) {
  const secrets = getSecrets(env);
  const sbHeaders = {
    apikey: secrets.supabaseKey,
    Authorization: `Bearer ${secrets.supabaseKey}`,
    "Content-Type": "application/json",
  };

  // Busca regra configurada
  const ruleRes = await fetch(`${secrets.supabaseUrl}/rest/v1/content_automations?id=eq.aut_cliente_10h&select=*`, {
    headers: sbHeaders,
  });
  const rules = await ruleRes.json().catch(() => []);
  const rule = rules[0] || {
    is_active: true,
    mode: "AUTOMATICO",
    ai_model: "gpt-6-astra",
    image_model: "gpt-image-2.5-sunburst",
  };

  if (!rule.is_active) {
    console.log("[ROBÔ] Regra de música de cliente está pausada no painel.");
    return { skipped: true, reason: "Rule is paused" };
  }

  // Busca música elegível (paga, gerada, autorizada e não publicada)
  const songsRes = await fetch(
    `${secrets.supabaseUrl}/rest/v1/orders?select=id,order_number,customer_name,honoree_name,occasion,music_style,story,lyrics,audio_url&payment_status=eq.PAGAMENTO_APROVADO&production_status=eq.AUDIO_GERADO&authorized_for_marketing=eq.true&published_on_social=eq.false&audio_url=not.is.null&limit=20`,
    { headers: sbHeaders }
  );

  const songs = await songsRes.json().catch(() => []);
  if (!songs || songs.length === 0) {
    console.log("[ROBÔ] Nenhuma música autorizada disponível para postagem hoje.");
    return { skipped: true, reason: "No authorized songs available" };
  }

  // Sorteia aleatoriamente
  const song = songs[Math.floor(Math.random() * songs.length)];
  console.log(`[ROBÔ] Música selecionada: ${song.honoreeName} (${song.music_style}) - Pedido ${song.order_number}`);

  // GPT-6 Astra gera o conceito e a copy
  const prompt = `Você é o copywriter oficial da NS Music (@_nsmusic).
Crie um post emocionante sobre a música de ${song.customer_name} feita especialmente para ${song.honoree_name}.
Ocasião: ${song.occasion}. Estilo musical: ${song.music_style}.
Retorne estritamente um JSON no formato:
{
  "caption": "legenda formatada com emojis, história afetiva e CTA link na bio @_nsmusic",
  "firstComment": "comentário de engajamento",
  "imagePrompt": "prompt ultra detalhado em inglês para gerar capa estética no clima do estilo musical ${song.music_style}, iluminação profissional de estúdio de música, ultra hd"
}`;

  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secrets.openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: rule.ai_model || "gpt-6-astra",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    }),
  });

  const gptData = await gptRes.json();
  const copy = JSON.parse(gptData.choices[0].message.content);

  // Gera imagem
  const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secrets.openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: rule.image_model || "gpt-image-2.5-sunburst",
      prompt: `${copy.imagePrompt}, cinematic neon purple lighting, professional music production cover`,
      n: 1,
      size: "1024x1024",
    }),
  });

  let imageUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80";
  const dalleData = await dalleRes.json().catch(() => null);
  if (dalleData?.data?.[0]?.url) {
    imageUrl = dalleData.data[0].url;
  }

  // Se modo for APROVAÇÃO, apenas registra como AGUARDANDO_APROVACAO
  if (rule.mode === "APROVACAO") {
    await fetch(`${secrets.supabaseUrl}/rest/v1/content_automation_logs`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        automation_id: "aut_cliente_10h",
        automation_name: "Música de Cliente Diária (Reels 10:00)",
        content_type: "MUSICA_CLIENTE",
        media_format: "REELS",
        status: "AGUARDANDO_APROVACAO",
        order_id: song.id,
        order_number: song.order_number,
        customer_name: song.customer_name,
        honoree_name: song.honoree_name,
        music_style: song.music_style,
        occasion: song.occasion,
        audio_url: song.audio_url,
        image_url: imageUrl,
        caption: copy.caption,
      }),
    });
    console.log("[ROBÔ] Música gerada e salva na fila de aprovação!");
    return { success: true, mode: "APROVACAO" };
  }

  // Publica na Meta Graph API
  const containerRes = await fetch(`https://graph.facebook.com/v21.0/${secrets.igAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: copy.caption,
      access_token: secrets.metaToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerData.id) throw new Error(JSON.stringify(containerData));

  await new Promise((r) => setTimeout(r, 3500));

  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${secrets.igAccountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerData.id,
      access_token: secrets.metaToken,
    }),
  });

  const publishData = await publishRes.json();

  // Marca pedido como publicado no Supabase
  await fetch(`${secrets.supabaseUrl}/rest/v1/orders?id=eq.${song.id}`, {
    method: "PATCH",
    headers: sbHeaders,
    body: JSON.stringify({
      published_on_social: true,
      published_social_at: new Date().toISOString(),
    }),
  });

  // Salva Log de Sucesso
  await fetch(`${secrets.supabaseUrl}/rest/v1/content_automation_logs`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "return=minimal" },
    body: JSON.stringify({
      automation_id: "aut_cliente_10h",
      automation_name: "Música de Cliente Diária (Reels 10:00)",
      content_type: "MUSICA_CLIENTE",
      media_format: "REELS",
      status: "PUBLICADO",
      order_id: song.id,
      order_number: song.order_number,
      customer_name: song.customer_name,
      honoree_name: song.honoree_name,
      music_style: song.music_style,
      occasion: song.occasion,
      audio_url: song.audio_url,
      image_url: imageUrl,
      caption: copy.caption,
      meta_creation_id: containerData.id,
      meta_post_id: publishData.id,
      published_at: new Date().toISOString(),
    }),
  });

  console.log(`[ROBÔ SUCESSO] Música de cliente publicada! Post ID: ${publishData.id}`);
  return { success: true, postId: publishData.id };
}

// 2. Executa post Institucional
async function runInstitutionalAutomation(env) {
  const secrets = getSecrets(env);
  const sbHeaders = {
    apikey: secrets.supabaseKey,
    Authorization: `Bearer ${secrets.supabaseKey}`,
    "Content-Type": "application/json",
  };

  const dayIndex = new Date().getDay() % INSTITUTIONAL_THEMES.length;
  const theme = INSTITUTIONAL_THEMES[dayIndex];

  console.log(`[ROBÔ INSTITUCIONAL] Tema do dia: "${theme}"`);

  // GPT-6 Astra gera a copy
  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secrets.openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-6-astra",
      messages: [
        {
          role: "system",
          content: "Você é o estrategista de marketing do Instagram @_nsmusic (nsmusic.nsnexus.com.br). Crie posts incríveis sobre o poder da música personalizada. Retorne JSON: { \"caption\": \"legenda completa com emojis e hashtags #nsmusic #musicapersonalizada\", \"imagePrompt\": \"prompt cinematográfico em inglês para DALL-E / GPT-Image\" }",
        },
        {
          role: "user",
          content: `Crie um post sobre: ${theme}. Destaque a qualidade profissional e o link da bio nsmusic.nsnexus.com.br.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    }),
  });

  const gptData = await gptRes.json();
  const copy = JSON.parse(gptData.choices[0].message.content);

  // Gera imagem
  const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secrets.openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2.5-sunburst",
      prompt: `${copy.imagePrompt}, cinematic recording studio, neon purple highlights, 4k ultra hd`,
      n: 1,
      size: "1024x1024",
    }),
  });

  const dalleData = await dalleRes.json().catch(() => null);
  const imageUrl = dalleData?.data?.[0]?.url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80";

  // Publica no Feed
  const containerRes = await fetch(`https://graph.facebook.com/v21.0/${secrets.igAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: copy.caption,
      access_token: secrets.metaToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerData.id) throw new Error(JSON.stringify(containerData));

  await new Promise((r) => setTimeout(r, 3500));

  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${secrets.igAccountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerData.id,
      access_token: secrets.metaToken,
    }),
  });

  const publishData = await publishRes.json();

  // Salva no banco de logs
  await fetch(`${secrets.supabaseUrl}/rest/v1/content_automation_logs`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "return=minimal" },
    body: JSON.stringify({
      automation_id: "aut_institucional_18h",
      automation_name: "Conteúdo Institucional NS Music (Feed 18:00)",
      content_type: "INSTITUCIONAL",
      media_format: "FEED",
      status: "PUBLICADO",
      theme_concept: theme,
      image_url: imageUrl,
      caption: copy.caption,
      meta_creation_id: containerData.id,
      meta_post_id: publishData.id,
      published_at: new Date().toISOString(),
    }),
  });

  console.log(`[ROBÔ SUCESSO] Institucional publicado! Post ID: ${publishData.id}`);
  return { success: true, postId: publishData.id };
}

export default {
  // Cron Trigger na Nuvem Cloudflare (Roda a cada hora no minuto 0)
  async scheduled(event, env, ctx) {
    const currentUtcHour = new Date().getUTCHours();
    console.log(`[CRON EXECUTADO] Hora UTC atual: ${currentUtcHour}:00 (Hora BRT: ${(currentUtcHour - 3 + 24) % 24}:00)`);

    // 13:00 UTC = 10:00 Horário de Brasília (Música de Cliente)
    if (currentUtcHour === 13) {
      ctx.waitUntil(runClientSongAutomation(env));
    } 
    // 21:00 UTC = 18:00 Horário de Brasília (Institucional)
    else if (currentUtcHour === 21) {
      ctx.waitUntil(runInstitutionalAutomation(env));
    }
  },

  // Endpoints HTTP para status e disparo manual do painel
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/status") {
      return new Response(
        JSON.stringify({
          status: "ONLINE",
          robotName: "NS Music Autonomous Cloud Engine",
          aiModel: "gpt-6-astra",
          imageModel: "gpt-image-2.5-sunburst",
          schedules: [
            "10:00 BRT (0 13 * * *) - Música de Cliente (Reels)",
            "18:00 BRT (0 21 * * *) - Conteúdo Institucional (Feed)",
          ],
          account: "@_nsmusic",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (url.pathname === "/trigger/client-song" || (url.pathname === "/trigger" && request.method === "POST")) {
      try {
        const result = await runClientSongAutomation(env);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (url.pathname === "/trigger/institutional") {
      try {
        const result = await runInstitutionalAutomation(env);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "NS Music Cloud Worker Online. Use /status, /trigger/client-song ou /trigger/institutional.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  },
};
