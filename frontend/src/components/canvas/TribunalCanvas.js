import React, { useRef, useEffect } from 'react';

export const TribunalCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = 320;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = 320;
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Pillars
      for (let i = 0; i < 5; i++) {
        const px = W * 0.1 + i * (W * 0.18);
        const py = H - 60;
        ctx.fillStyle = 'rgba(212,175,55,0.04)';
        ctx.fillRect(px - 5, 36, 10, py - 36);
      }

      // Judge bench
      const bx = W / 2 - 24;
      const by = H - 110;
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

      // Red borders
      ctx.fillStyle = `rgba(220,50,50,${0.18 + 0.1 * Math.sin(t * 0.7)})`;
      ctx.fillRect(0, 0, 4, H);
      ctx.fillRect(W - 4, 0, 4, H);

      t += 0.018;
      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />;
};
