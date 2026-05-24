import React, { useRef, useEffect } from 'react';

const HEIGHT = 320;

const drawPillars = (ctx, W) => {
  for (let i = 0; i < 5; i++) {
    const px = W * 0.1 + i * (W * 0.18);
    const py = HEIGHT - 60;
    ctx.fillStyle = 'rgba(212,175,55,0.04)';
    ctx.fillRect(px - 5, 36, 10, py - 36);
  }
};

const drawJudgeBench = (ctx, W, t) => {
  const bx = W / 2 - 24;
  const by = HEIGHT - 110;

  ctx.fillStyle = 'rgba(212,175,55,0.07)';
  ctx.fillRect(bx, by, 48, 34);
  ctx.strokeStyle = 'rgba(212,175,55,0.2)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bx, by, 48, 34);

  ctx.fillStyle = `rgba(212,175,55,${0.5 + 0.3 * Math.sin(t)})`;
  ctx.font = '12px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚖', W / 2, by + 17);
};

const drawRedBorders = (ctx, W, t) => {
  ctx.fillStyle = `rgba(220,50,50,${0.18 + 0.1 * Math.sin(t * 0.7)})`;
  ctx.fillRect(0, 0, 4, HEIGHT);
  ctx.fillRect(W - 4, 0, 4, HEIGHT);
};

export const TribunalCanvas = () => {
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
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, HEIGHT);

      drawPillars(ctx, W);
      drawJudgeBench(ctx, W, t);
      drawRedBorders(ctx, W, t);

      t += 0.018;
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
