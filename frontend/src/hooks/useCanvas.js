import { useEffect, useRef } from 'react';

export const useCanvas = (draw, options = {}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    let frameCount = 0;

    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return canvasRef;
};
