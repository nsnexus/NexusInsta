import { useState, useEffect } from 'react';

interface UseTypewriterReturn {
  displayed: string;
  done: boolean;
}

export function useTypewriter(
  text: string,
  speed: number = 38,
  startDelay: number = 600
): UseTypewriterReturn {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let currentIndex = 0;
    setDisplayed('');
    setDone(false);

    const delayId = setTimeout(() => {
      intervalId = setInterval(() => {
        currentIndex++;
        setDisplayed(text.slice(0, currentIndex));

        if (currentIndex >= text.length) {
          setDone(true);
          if (intervalId) clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(delayId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
