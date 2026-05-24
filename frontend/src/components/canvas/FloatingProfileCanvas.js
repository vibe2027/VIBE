import React, { useRef, useEffect } from 'react';

const SIZE = 58;
const CENTER = 29;
const RADIUS = 26;

const drawAvatar = (ctx, hue) => {
  const grd = ctx.createRadialGradient(CENTER, CENTER, 2, CENTER, CENTER, CENTER);
  grd.addColorStop(0, `hsla(${hue},70%,55%,0.95)`);
  grd.addColorStop(1, `hsla(${hue + 40},60%,15%,0.7)`);
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
};

const drawOrbitingDots = (ctx, hue, t) => {
  for (let i = 0; i < 5; i++) {
    const a = t + (i / 5) * Math.PI * 2;
    const r = 10 + 3 * Math.sin(t * 1.5 + i);
    const x = CENTER + Math.cos(a) * r;
    const y = CENTER + Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue + i * 28},100%,80%,0.8)`;
    ctx.fill();
  }
};

const drawRing = (ctx, hue) => {
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(${hue},80%,60%,0.4)`;
  ctx.lineWidth = 0.8;
  ctx.stroke();
};

export const FloatingProfileCanvas = ({ hue = 45 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let t = 0;
    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      drawAvatar(ctx, hue);
      drawOrbitingDots(ctx, hue, t);
      drawRing(ctx, hue);
      t += 0.035;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [hue]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{ borderRadius: '50%', margin: '0 auto 8px', display: 'block' }}
    />
  );
};
