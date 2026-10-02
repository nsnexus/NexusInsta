/**
 * Gerador de Reels Verticais (1080x1920): Imagem + Áudio MP3 = Vídeo Reel
 * Animação Ken Burns (zoom suave), visualizador de áudio (waveform) e partículas dinâmicas.
 */

export interface ReelRenderOptions {
  imageUrl: string;
  audioUrl: string;
  songTitle: string;
  customerName?: string;
  honoreeName?: string;
  musicStyle?: string;
  durationSeconds?: number; // 30, 45, 60
  onProgress?: (percent: number, statusText: string) => void;
}

export interface ReelRenderResult {
  videoBlob: Blob;
  videoUrl: string;
  duration: number;
}

export const ReelGenerator = {
  /**
   * Renderiza um vídeo vertical 1080x1920 sincronizado com o áudio do cliente
   */
  async renderReelVideo(options: ReelRenderOptions): Promise<ReelRenderResult> {
    const {
      imageUrl,
      audioUrl,
      songTitle,
      honoreeName = 'Homenageado Especial',
      musicStyle = 'NS Music',
      durationSeconds = 45,
      onProgress,
    } = options;

    onProgress?.(5, 'Carregando áudio e arte visual...');

    // 1. Carrega a Imagem
    const img = await this.loadImage(imageUrl);

    onProgress?.(15, 'Processando faixa de áudio MP3...');

    // 2. Carrega e decodifica o Áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await this.loadAndDecodeAudio(audioContext, audioUrl);

    // Duração real limitada ao configurado
    const maxDuration = Math.min(durationSeconds, audioBuffer.duration);

    onProgress?.(25, 'Preparando motor gráfico 1080x1920...');

    // 3. Configura Canvas 1080x1920 (Vertical 9:16)
    const width = 1080;
    const height = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Não foi possível obter o contexto 2D do Canvas.');

    // 4. Configura Nós de Áudio e Analisador de Frequência
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const dest = audioContext.createMediaStreamDestination();
    sourceNode.connect(analyser);
    analyser.connect(dest);

    // 5. Configura Gravador de Mídia
    const canvasStream = canvas.captureStream(30); // 30 FPS
    const audioTrack = dest.stream.getAudioTracks()[0];
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    const mimeType = this.getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: 6_000_000, // 6 Mbps alta qualidade
    });

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    // 6. Loop de Renderização e Animação
    return new Promise<ReelRenderResult>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        audioContext.close();
        const videoBlob = new Blob(recordedChunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(videoBlob);
        onProgress?.(100, 'Reel gerado com sucesso!');
        resolve({
          videoBlob,
          videoUrl,
          duration: maxDuration,
        });
      };

      mediaRecorder.onerror = (err) => {
        audioContext.close();
        reject(err);
      };

      // Partículas flutuantes
      const particles = Array.from({ length: 35 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speedY: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      }));

      const startTime = performance.now();
      sourceNode.start(0, 0, maxDuration);
      mediaRecorder.start();

      const renderFrame = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / maxDuration, 1);

        onProgress?.(
          Math.floor(25 + progress * 70),
          `Renderizando Reel 1080x1920: ${Math.floor(elapsed)}s / ${Math.floor(maxDuration)}s`
        );

        analyser.getByteFrequencyData(dataArray);

        // Limpa o canvas
        ctx.fillStyle = '#05070f';
        ctx.fillRect(0, 0, width, height);

        // Efeito Ken Burns: Zoom suave na imagem central
        const zoom = 1 + progress * 0.12; // 12% zoom ao longo do clipe
        const imgW = width * zoom;
        const imgH = height * zoom;
        const offsetX = (width - imgW) / 2;
        const offsetY = (height - imgH) / 2;

        ctx.save();
        ctx.drawImage(img, offsetX, offsetY, imgW, imgH);

        // Degradê cinematográfico escurecendo bordas superiores e inferiores
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(5, 7, 15, 0.85)');
        gradient.addColorStop(0.3, 'rgba(5, 7, 15, 0.2)');
        gradient.addColorStop(0.65, 'rgba(5, 7, 15, 0.4)');
        gradient.addColorStop(1, 'rgba(5, 7, 15, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Partículas brilhantes
        ctx.fillStyle = '#f43f5e';
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(244, 63, 94, ${p.alpha * 0.8})`;
          ctx.fill();
          p.y -= p.speedY;
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
        });

        // Topo: Marca NS Music
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NS MUSIC • MÚSICA PERSONALIZADA', width / 2, 140);

        ctx.fillStyle = '#ec4899';
        ctx.font = '600 24px sans-serif';
        ctx.fillText(`@_nsmusic  |  ${musicStyle.toUpperCase()}`, width / 2, 185);

        // Área Central-Inferior: Card da Canção
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(80, height - 520, width - 160, 240, 24);
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(songTitle || 'Canção Inesquecível', width / 2, height - 440);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '30px sans-serif';
        ctx.fillText(`Homenagem para: ${honoreeName}`, width / 2, height - 380);

        // Visualizador de Ondas Sonoras (Audio Waveform)
        const barCount = 48;
        const barWidth = 10;
        const barGap = 6;
        const totalW = barCount * (barWidth + barGap);
        const startX = (width - totalW) / 2;
        const waveY = height - 220;

        for (let i = 0; i < barCount; i++) {
          const freqVal = dataArray[i % dataArray.length] || 0;
          const barHeight = Math.max(8, (freqVal / 255) * 110);

          const barGrad = ctx.createLinearGradient(0, waveY - barHeight / 2, 0, waveY + barHeight / 2);
          barGrad.addColorStop(0, '#f43f5e');
          barGrad.addColorStop(0.5, '#ec4899');
          barGrad.addColorStop(1, '#a855f7');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(startX + i * (barWidth + barGap), waveY - barHeight / 2, barWidth, barHeight, 5);
          ctx.fill();
        }

        // Barra de Progresso
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(80, height - 120, width - 160, 8);

        ctx.fillStyle = '#ec4899';
        ctx.fillRect(80, height - 120, (width - 160) * progress, 8);

        // Rodapé
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 24px sans-serif';
        ctx.fillText('Toque no link da bio para criar a sua música exclusiva 🎧', width / 2, height - 70);

        ctx.restore();

        if (progress < 1) {
          requestAnimationFrame(renderFrame);
        } else {
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 300);
        }
      };

      requestAnimationFrame(renderFrame);
    });
  },

  async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback para imagem segura caso CORS bloqueie
        const fallback = new Image();
        fallback.crossOrigin = 'anonymous';
        fallback.onload = () => resolve(fallback);
        fallback.onerror = reject;
        fallback.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80';
      };
      img.src = url;
    });
  },

  async loadAndDecodeAudio(audioContext: AudioContext, audioUrl: string): Promise<AudioBuffer> {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error(`Falha ao baixar áudio: HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  },

  getSupportedMimeType(): string {
    const candidates = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
    ];

    for (const t of candidates) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'video/webm';
  },
};
