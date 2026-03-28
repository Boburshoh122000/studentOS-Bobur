import { useEffect, useState, useRef } from 'react';
import { useNavigation } from 'react-router-dom';

export function PageProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setVisible(true);
      setProgress(15);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 85) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 85;
          }
          return p + Math.random() * 12;
        });
      }, 180);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigation.state]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '3px',
        background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
        zIndex: 9999,
        transition: 'width 0.2s ease, opacity 0.3s ease',
        opacity: progress === 100 ? 0 : 1,
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 8px rgba(99,102,241,0.6)',
      }}
    />
  );
}
