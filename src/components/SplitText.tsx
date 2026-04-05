import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: any;
  splitType?: 'chars' | 'words' | 'lines';
  from?: any;
  to?: any;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
}

export default function SplitText({
  text,
  className = '',
  delay = 130,
  duration = 1.25,
  ease = 'easeOut',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
  showCallback = false,
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold, margin: rootMargin as any });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const lines = text.split('\n');
  let charIndex = 0;
  const totalChars = text.replace(/\n/g, '').length;

  return (
    <div ref={ref} className={className} style={{ textAlign }}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{ display: 'block' }}>
          {line.split('').map((char, i) => {
            const currentIndex = charIndex++;
            return (
              <motion.span
                key={currentIndex}
                custom={currentIndex}
                initial="hidden"
                animate={controls}
                variants={{
                  hidden: from,
                  visible: (i) => ({
                    ...to,
                    transition: {
                      delay: (delay * i) / 1000,
                      duration: duration,
                      ease: ease === 'elastic.out(1, 0.3)' ? [0.175, 0.885, 0.32, 1.275] : ease,
                    },
                  }),
                }}
                onAnimationComplete={() => {
                  if (currentIndex === totalChars - 1 && onLetterAnimationComplete) {
                    onLetterAnimationComplete();
                  }
                }}
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
              >
                {char}
              </motion.span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
