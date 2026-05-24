import { useEffect, useRef } from 'react';

/**
 * Hook to manage canvas animation lifecycle.
 * The draw function is called on every frame with (context, frameCount).
 */
export const useCanvas = (draw) => {
  const canvasRef = useRef(null);
  const drawRef = useRef(draw);

  // Keep the latest draw function without re-running the effect
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationId;

    const render = () => {
      frameCount++;
      drawRef.current(context, frameCount);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return canvasRef;
};
