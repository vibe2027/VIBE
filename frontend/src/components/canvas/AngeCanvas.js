import React, { useRef, useEffect } from 'react';

const SIZE = 180;
const CENTER = 90;

const drawOuterGlow = (ctx, t) => {
  const grd = ctx.createRadialGradient(CENTER, CENTER, 10, CENTER, CENTER, 80);
  grd.addColorStop(0, 'rgba(212,175,55,0.15)');
  grd.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 80 + 5 * Math.sin(t), 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
};

const drawInnerCore = (ctx) => {
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 30, 0, Math.PI * 2);
  const inner = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 30);
  inner.addColorStop(0, 'rgba(212,175,55,0.6)');
  inner.addColorStop(1, 'rgba(212,175,55,0.1)');
  ctx.fillStyle = inner;
  ctx.fill();
};

const drawOrbitingParticles = (ctx, t) => {
  for (let i = 0; i < 8; i++) {
    const a = t + (i / 8) * Math.PI * 2;
    const r = 50 + 8 * Math.sin(t * 2 + i);
    const x = CENTER + Math.cos(a) * r;
    const y = CENTER + Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,175,55,${0.4 + 0.3 * Math.sin(t + i)})`;
    ctx.fill();
  }
};

export const AngeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let t = 0;
    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      drawOuterGlow(ctx, t);
      drawInnerCore(ctx);
      drawOrbitingParticles(ctx, t);
      t += 0.02;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} width={SIZE} height={SIZE} />;
};
