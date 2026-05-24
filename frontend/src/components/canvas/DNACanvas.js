import React, { useRef, useEffect } from 'react';

const DNA_COLORS = ['#D4AF37', '#b44fff', '#00eeff', '#ff5050', '#ff88ff'];
const SEGMENT_COUNT = 20;
const CANVAS_SIZE = 180;

const drawDNAStrand = (ctx, t) => {
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const y = (i / SEGMENT_COUNT) * CANVAS_SIZE;
    const phase = t + (i / SEGMENT_COUNT) * Math.PI * 4;
    const x1 = 90 + 60 * Math.sin(phase);
    const x2 = 90 + 60 * Math.sin(phase + Math.PI);
    const col = DNA_COLORS[i % DNA_COLORS.length];

    // Left strand
    ctx.beginPath();
    ctx.arc(x1, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.8;
    ctx.fill();

    // Right strand
    ctx.beginPath();
    ctx.arc(x2, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();

    // Connecting line every 3 segments
    if (i % 3 === 0) {
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = 'rgba(212,175,55,0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
};

export const DNACanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let t = 0;
    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawDNAStrand(ctx, t);
      t += 0.03;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />;
};
