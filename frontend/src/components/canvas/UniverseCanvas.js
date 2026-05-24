import React, { useRef, useEffect } from 'react';

const STAR_COLORS = ['#D4AF37', '#b44fff', '#00eeff', '#ff5050', '#ffffff'];
const STAR_COUNT = 120;

const createStars = (width, height) =>
  Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.2 + 0.3,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    speed: Math.random() * 0.3 + 0.1,
  }));

const drawStars = (ctx, stars, t) => {
  stars.forEach((s) => {
    const op = 0.3 + 0.3 * Math.sin(t * s.speed + s.x);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = op;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
};

export const UniverseCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = createStars(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStars(ctx, stars, t);
      t += 0.01;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="universe"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
