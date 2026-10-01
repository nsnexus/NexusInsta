# NexusInsta — Plataforma de Automação & Agendamento para Instagram

Uma plataforma moderna para agendamento e automação de publicações no Instagram utilizando a **Meta Graph API oficial (v21.0)**, construída com **React 19**, **TypeScript**, **Vite** e **Tailwind CSS**.

---

## 🚀 Funcionalidades

- **📱 Pré-Visualização Mobile em Tempo Real**: Simulador interativo de smartphone com formatos **1:1 (Quadrado)**, **4:5 (Retrato/Feed)** e **9:16 (Reels/Stories)**.
- **🎨 Estúdio de Criação de Post**:
  - Upload local de mídia ou URL direta.
  - Galeria de demonstração integrada.
  - Editor com contagem de caracteres (2.200) e hashtags (30).
  - Inserção em 1 clique de pacotes de hashtags por nicho (Marketing, Tecnologia, Design, Negócios).
  - Agendador inteligente com horários de pico e primeiro comentário automático.
- **⏱️ Fila de Automação Ativa**:
  - Motor de verificação em tempo real (intervalo a cada 3 segundos).
  - Contagem regressiva ao vivo ("Dispara em X minutos").
  - Ação de "Publicar Já", reagendamento e exclusão.
- **⚙️ Integração com a Meta Graph API (v21.0)**:
  - Alternador entre **Modo Sandbox (Simulador de Alta Fidelidade)** e **Modo Produção Live**.
  - Configuração de App ID, App Secret, Long-Lived Page Access Token e Instagram Business Account ID.
  - Validador de conexão com a API.
  - Documentação cURL integrada do fluxo de 2 etapas (Container de Mídia -> Publicação).
- **📊 Analytics & Desempenho**:
  - Monitoramento da cota de publicação da Meta (máx 50 posts/24h).
  - Melhores horários para postar no Instagram em 2026.
  - Métricas de curtidas, comentários e alcance.
- **📜 Console de Logs HTTP**:
  - Terminal com visualização dos payloads enviados e respostas JSON da Meta em tempo real.

---

## 🛠️ Tecnologias

- **React 19**
- **TypeScript**
- **Vite 8**
- **Tailwind CSS 3.4**
- **Lucide Icons**
- **Cloudflare Pages** (Deploy & Hospedagem)

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

---

## ☁️ Deploy no Cloudflare Pages

1. **Build Command**: `npm run build`
2. **Build Output Directory**: `dist`
3. **Node Version**: `18` ou superior
4. A rota SPA já está configurada via `public/_redirects`.
