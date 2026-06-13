import React, { useEffect, useRef } from 'react';

const Hyperspeed = (props: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const stars: any[] = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: (Math.random() - 0.5) * w,
            y: (Math.random() - 0.5) * h,
            z: Math.random() * w
        });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = props.effectOptions?.colors?.background ? `#${props.effectOptions.colors.background.toString(16).padStart(6, '0')}` : 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (let star of stars) {
          star.z -= 5;
          if (star.z <= 0) {
              star.x = (Math.random() - 0.5) * w;
              star.y = (Math.random() - 0.5) * h;
              star.z = w;
          }

          const k = 128.0 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          if (px >= 0 && px <= w && py >= 0 && py <= h) {
              const size = (1 - star.z / w) * 3;
              ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - star.z / w) + ')';
              ctx.beginPath();
              ctx.arc(px, py, size, 0, Math.PI * 2);
              ctx.fill();
            }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    };
  }, [props.effectOptions]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default Hyperspeed;
