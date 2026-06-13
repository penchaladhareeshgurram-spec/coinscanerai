import React, { useRef, useEffect } from 'react';

export interface HyperspeedProps {
  effectOptions?: {
    speed?: number;
    density?: number;
    color?: string;
    distortion?: number;
    highwayColors?: string[];
  };
}

export const Hyperspeed: React.FC<HyperspeedProps> = ({ effectOptions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;

    const stars: any[] = [];
    const numStars = effectOptions?.density || 400;
    const speed = effectOptions?.speed || 2;
    const highwayColors = effectOptions?.highwayColors || ['#ffffff'];

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * w - w / 2,
            y: Math.random() * h - h / 2,
            z: Math.random() * w,
            color: highwayColors[Math.floor(Math.random() * highwayColors.length)]
        });
    }

    let animationFrameId: number;

    const render = () => {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        for (let i = 0; i < numStars; i++) {
            const star = stars[i];
            star.z -= speed * 2;

            if (star.z <= 0) {
                star.z = w;
                star.x = Math.random() * w - cx;
                star.y = Math.random() * h - cy;
            }

            const k = 120.0 / Math.max(0.1, star.z);
            const px = star.x * k + cx;
            const py = star.y * k + cy;

            const nextZ = star.z - speed * (effectOptions?.distortion || 5);
            const nextK = 120.0 / Math.max(0.1, nextZ);
            const nextPx = star.x * nextK + cx;
            const nextPy = star.y * nextK + cy;

            if (px >= 0 && px <= w && py >= 0 && py <= h) {
                const brightness = Math.max(0, 1 - (star.z / w));
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(nextPx, nextPy);
                
                if (highwayColors.length > 1) {
                  ctx.strokeStyle = star.color;
                  ctx.globalAlpha = brightness;
                } else {
                  ctx.strokeStyle = `rgba(255, 255, 255, ${brightness})`;
                  ctx.globalAlpha = 1;
                }
                
                ctx.lineWidth = brightness * 3;
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
        animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    };
  }, [effectOptions]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};
