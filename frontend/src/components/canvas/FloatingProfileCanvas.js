import React, { useRef, useEffect } from 'react';

export const FloatingProfileCanvas = ({ hue = 45 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, 58, 58);

      const grd = ctx.createRadialGradient(29, 29, 2, 29, 29, 29);
      grd.addColorStop(0, `hsla(${hue},70%,55%,0.95)`);
      grd.addColorStop(1, `hsla(${hue + 40},60%,15%,0.7)`);
      ctx.beginPath();
      ctx.arc(29, 29, 26, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const a = t + (i / 5) * Math.PI * 2;
        const r = 10 + 3 * Math.sin(t * 1.5 + i);
        const x = 29 + Math.cos(a) * r;
        const y = 29 + Math.sin(a) * r;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + i * 28},100%,80%,0.8)`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(29, 29, 26, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue},80%,60%,0.4)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      t += 0.035;
      requestAnimationFrame(draw);
    }

    draw();
  }, [hue]);

  return (
    <canvas
      ref={canvasRef}
      width="58"
      height="58"
      style={{ borderRadius: '50%', margin: '0 auto 8px', display: 'block' }}
    />
  );
};
