import React, { useRef, useEffect } from 'react';

const HEIGHT = 340;
const STAR_COUNT = 25;
const FOG_LAYERS = 4;

const drawSky = (ctx, W) => {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#000814');
  sky.addColorStop(1, '#060018');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HEIGHT);
};

const drawStars = (ctx, W, t) => {
  for (let i = 0; i < STAR_COUNT; i++) {
    const sx = ((i * 97 + t * 5) % W);
    const sy = 22 + Math.sin(i * 0.8 + t * 0.22) * 14;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.2 * Math.sin(i + t)})`;
    ctx.fill();
  }
};

const drawFog = (ctx, W, t) => {
  for (let layer = 0; layer < FOG_LAYERS; layer++) {
    const y = HEIGHT * 0.38 + layer * HEIGHT * 0.13;
    const op = 0.07 + layer * 0.05;
    ctx.fillStyle = `rgba(140,140,200,${op})`;
    for (let i = 0; i < 5; i++) {
      const bx = ((i * 110 + t * 5 * (layer + 1)) % (W + 160)) - 80;
      ctx.beginPath();
      ctx.ellipse(
        bx,
        y,
        90 + 25 * Math.sin(i),
        28 + 10 * Math.sin(i * 0.7),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
};

export const SalonCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = HEIGHT;

    const ctx = canvas.getContext('2d');
    let t = 0;
    let animationId;

    const draw = () => {
      const W = canvas.width;
      ctx.clearRect(0, 0, W, HEIGHT);
      drawSky(ctx, W);
      drawStars(ctx, W, t);
      drawFog(ctx, W, t);
      t += 0.012;
      animationId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />;
};
