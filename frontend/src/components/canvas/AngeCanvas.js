import React, { useRef, useEffect } from 'react';

export const AngeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, 180, 180);

      const grd = ctx.createRadialGradient(90, 90, 10, 90, 90, 80);
      grd.addColorStop(0, 'rgba(212,175,55,0.15)');
      grd.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.beginPath();
      ctx.arc(90, 90, 80 + 5 * Math.sin(t), 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(90, 90, 30, 0, Math.PI * 2);
      const inner = ctx.createRadialGradient(90, 90, 0, 90, 90, 30);
      inner.addColorStop(0, 'rgba(212,175,55,0.6)');
      inner.addColorStop(1, 'rgba(212,175,55,0.1)');
      ctx.fillStyle = inner;
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const a = t + (i / 8) * Math.PI * 2;
        const r = 50 + 8 * Math.sin(t * 2 + i);
        const x = 90 + Math.cos(a) * r;
        const y = 90 + Math.sin(a) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${0.4 + 0.3 * Math.sin(t + i)})`;
        ctx.fill();
      }

      t += 0.02;
      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return <canvas ref={canvasRef} width="180" height="180" />;
};
