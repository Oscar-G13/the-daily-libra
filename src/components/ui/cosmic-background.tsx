"use client";

import { useEffect, useRef } from "react";

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2 + 0.2,
      opacity: Math.random() * 0.6 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    // Particles
    const particles = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height + canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: 0,
      speed: Math.random() * 0.3 + 0.1,
      drift: (Math.random() - 0.5) * 0.5,
    }));

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Stars
      stars.forEach((star) => {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
        const opacity = star.opacity + twinkle * 0.15;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${Math.max(0, opacity)})`;
        ctx.fill();
      });

      // Floating particles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        p.opacity = Math.min(0.4, p.opacity + 0.005);

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
          p.opacity = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
        ctx.fill();
      });

      // Libra constellation hint (Scales)
      const cx = canvas.width * 0.75;
      const cy = canvas.height * 0.3;
      const constellationPoints = [
        [cx, cy],
        [cx - 40, cy + 20],
        [cx + 40, cy + 20],
        [cx - 40, cy + 50],
        [cx + 40, cy + 50],
        [cx - 55, cy + 55],
        [cx + 55, cy + 55],
      ];
      const constellationLines = [
        [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6],
      ];

      ctx.strokeStyle = "rgba(201, 168, 76, 0.08)";
      ctx.lineWidth = 0.5;
      constellationLines.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(constellationPoints[a][0], constellationPoints[a][1]);
        ctx.lineTo(constellationPoints[b][0], constellationPoints[b][1]);
        ctx.stroke();
      });

      constellationPoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(201, 168, 76, 0.25)";
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
