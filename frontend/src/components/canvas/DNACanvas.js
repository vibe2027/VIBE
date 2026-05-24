import React, { useRef, useEffect } from 'react';

export const DNACanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, 180, 180);

      for (let i = 0; i < 20; i++) {
        const y = (i / 20) * 180;
        const phase = t + (i / 20) * Math.PI * 4;
        const x1 = 90 + 60 * Math.sin(phase);
        const x2 = 90 + 60 * Math.sin(phase + Math.PI);
        const colors = ['#D4AF37', '#b44fff', '#00eeff', '#ff5050', '#ff88ff'];
        const col = colors[i % colors.length];

        ctx.beginPath();
        ctx.arc(x1, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x2, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();

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

      t += 0.03;
      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return (
    <canvas ref={canvasRef} width="180" height="180" />
  );
};
