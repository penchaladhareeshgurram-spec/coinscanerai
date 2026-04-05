import React, { useEffect, useRef } from 'react';

interface AuroraProps {
  colorStops: string[];
  amplitude?: number;
  blend?: number;
}

export const Aurora: React.FC<AuroraProps> = ({
  colorStops,
  amplitude = 1.4,
  blend = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a dynamic gradient background based on colorStops
      colorStops.forEach((color, index) => {
        const x = canvas.width / 2 + Math.sin(time + index) * canvas.width * 0.3 * amplitude;
        const y = canvas.height / 2 + Math.cos(time + index * 2) * canvas.height * 0.3 * amplitude;
        
        const radius = Math.max(canvas.width, canvas.height) * 0.8 * blend;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');

        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorStops, amplitude, blend]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: `blur(${blend * 50}px)` }}
    />
  );
};
