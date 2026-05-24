import React, { useRef, useEffect, useState } from 'react';

// ── Constants ──
const CITIES = [
  { name: 'QUÉBEC', lat: 46.8, lon: -71.2, col: '#D4AF37' },
  { name: 'MONTRÉAL', lat: 45.5, lon: -73.6, col: '#b44fff' },
  { name: 'TORONTO', lat: 43.7, lon: -79.4, col: '#00eeff' },
  { name: 'VANCOUVER', lat: 49.3, lon: -123.1, col: '#ff5050' },
  { name: 'OTTAWA', lat: 45.4, lon: -75.7, col: '#ff88ff' },
  { name: 'PARIS', lat: 48.9, lon: 2.3, col: '#D4AF37' },
  { name: 'BERLIN', lat: 52.5, lon: 13.4, col: '#b44fff' },
  { name: 'NYC', lat: 40.7, lon: -74.0, col: '#00eeff' },
  { name: 'LONDON', lat: 51.5, lon: -0.1, col: '#ff5050' },
  { name: 'TOKYO', lat: 35.7, lon: 139.7, col: '#ff88ff' },
  { name: 'SAO PAULO', lat: -23.5, lon: -46.6, col: '#D4AF37' },
  { name: 'SYDNEY', lat: -33.9, lon: 151.2, col: '#00eeff' },
];

const RAINBOW = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787', '#FF00FF', '#00EEFF'];
const MAX_ROT_X = 1.3;

// ── Helpers ──
const ll2xyz = (lat, lon, r) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return {
    x: -r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
};

const rotPoint = (p, rotX, rotY) => {
  const cy = Math.cos(rotY);
  const sy = Math.sin(rotY);
  const cx2 = Math.cos(rotX);
  const sx2 = Math.sin(rotX);
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const y2 = p.y * cx2 - z1 * sx2;
  const z2 = p.y * sx2 + z1 * cx2;
  return { x: x1, y: y2, z: z2 };
};

// ── Drawing functions ──
const drawBackground = (ctx, cx, cy, R) => {
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  bg.addColorStop(0, '#0d0020');
  bg.addColorStop(1, '#000');
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
};

const drawLatitudeGrid = (ctx, cx, cy, R, rotX, rotY) => {
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -180; lon < 180; lon += 5) {
      const r1 = rotPoint(ll2xyz(lat, lon, R), rotX, rotY);
      const r2 = rotPoint(ll2xyz(lat, lon + 5, R), rotX, rotY);
      if (r1.z > 0 && r2.z > 0) {
        ctx.beginPath();
        ctx.moveTo(cx + r1.x, cy + r1.y);
        ctx.lineTo(cx + r2.x, cy + r2.y);
        ctx.strokeStyle = 'rgba(212,175,55,0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
};

const drawLongitudeGrid = (ctx, cx, cy, R, rotX, rotY) => {
  for (let lon = -180; lon < 180; lon += 30) {
    for (let lat = -80; lat < 80; lat += 5) {
      const r1 = rotPoint(ll2xyz(lat, lon, R), rotX, rotY);
      const r2 = rotPoint(ll2xyz(lat + 5, lon, R), rotX, rotY);
      if (r1.z > 0 && r2.z > 0) {
        ctx.beginPath();
        ctx.moveTo(cx + r1.x, cy + r1.y);
        ctx.lineTo(cx + r2.x, cy + r2.y);
        ctx.strokeStyle = 'rgba(212,175,55,0.04)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
};

const drawRainbowEquator = (ctx, cx, cy, R, rotX, rotY) => {
  for (let i = 0; i < 240; i++) {
    const lon = -180 + i * 1.5;
    const r1 = rotPoint(ll2xyz(0, lon, R), rotX, rotY);
    const r2 = rotPoint(ll2xyz(0, lon + 1.5, R), rotX, rotY);
    if (r1.z > 0 && r2.z > 0) {
      const color = RAINBOW[Math.floor(i / 30) % RAINBOW.length];
      ctx.beginPath();
      ctx.moveTo(cx + r1.x, cy + r1.y);
      ctx.lineTo(cx + r2.x, cy + r2.y);
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
};

const drawCities = (ctx, cx, cy, R, W, rotX, rotY, frame) => {
  CITIES.forEach((city, ci) => {
    const r = rotPoint(ll2xyz(city.lat, city.lon, R), rotX, rotY);
    if (r.z <= 0) return;

    const sx = cx + r.x;
    const sy = cy + r.y;
    const pulse = 0.65 + 0.35 * Math.sin(frame * 0.07 + ci * 1.3);

    // City dot
    ctx.shadowBlur = 14;
    ctx.shadowColor = city.col;
    ctx.beginPath();
    ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = city.col;
    ctx.globalAlpha = pulse;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // City name
    ctx.font = `bold ${Math.max(9, Math.round(W * 0.022))}px "Space Mono", monospace`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = city.col;
    ctx.fillStyle = city.col;
    ctx.textAlign = 'center';
    ctx.fillText(city.name, sx, sy - 17);
    ctx.shadowBlur = 0;
  });
};

const drawRim = (ctx, cx, cy, R) => {
  const rim = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
  rim.addColorStop(0, 'rgba(0,220,255,0.95)');
  rim.addColorStop(0.5, 'rgba(180,0,255,0.80)');
  rim.addColorStop(1, 'rgba(0,220,255,0.95)');
  ctx.shadowBlur = 18;
  ctx.shadowColor = 'rgba(0,200,255,0.8)';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = rim;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowBlur = 0;
};

// ── Component ──
export const GlobeCanvas = () => {
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const rotXRef = useRef(0.3);
  const rotYRef = useRef(0);
  const velXRef = useRef(0);
  const velYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const frameRef = useRef(0);
  const [, setCursor] = useState('grab');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      const s = Math.min(window.innerWidth, 520);
      canvas.width = s;
      canvas.height = s;
    };

    resize();
    window.addEventListener('resize', resize);

    let animationId;
    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.42;

      ctx.clearRect(0, 0, W, H);

      drawBackground(ctx, cx, cy, R);
      drawLatitudeGrid(ctx, cx, cy, R, rotXRef.current, rotYRef.current);
      drawLongitudeGrid(ctx, cx, cy, R, rotXRef.current, rotYRef.current);
      drawRainbowEquator(ctx, cx, cy, R, rotXRef.current, rotYRef.current);
      drawCities(ctx, cx, cy, R, W, rotXRef.current, rotYRef.current, frameRef.current);
      drawRim(ctx, cx, cy, R);

      // Auto-rotation and inertia
      if (!isDraggingRef.current) {
        rotYRef.current += 0.0045;
        if (Math.abs(velXRef.current) > 0.0005) {
          velXRef.current *= 0.94;
          rotYRef.current += velXRef.current;
        }
        if (Math.abs(velYRef.current) > 0.0005) {
          velYRef.current *= 0.94;
          rotXRef.current += velYRef.current;
          rotXRef.current = Math.max(-MAX_ROT_X, Math.min(MAX_ROT_X, rotXRef.current));
        }
      }

      frameRef.current++;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  const updateRotation = (clientX, clientY) => {
    velXRef.current = (clientX - lastXRef.current) * 0.005;
    velYRef.current = (clientY - lastYRef.current) * 0.005;
    rotYRef.current += velXRef.current;
    rotXRef.current = Math.max(
      -MAX_ROT_X,
      Math.min(MAX_ROT_X, rotXRef.current + velYRef.current)
    );
    lastXRef.current = clientX;
    lastYRef.current = clientY;
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    setCursor('grabbing');
    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    updateRotation(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setCursor('grab');
  };

  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    lastXRef.current = e.touches[0].clientX;
    lastYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    updateRotation(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width="420"
      height="420"
      style={{
        display: 'block',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
        width: '100%',
        maxWidth: '520px',
        height: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};
