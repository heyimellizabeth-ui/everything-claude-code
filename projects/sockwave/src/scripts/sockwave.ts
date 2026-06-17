/*
 * Sockwave — a procedural flow-field particle engine.
 *
 * Pink particles drift across an ink field, their direction sampled from a
 * cheap animated value-noise field. The pointer bends nearby particles toward
 * it; scroll progress retunes the field (speed, swirl, hue spread) so the
 * visual evolves as you move down the page.
 *
 * Zero dependencies, Canvas 2D, reduced-motion aware. No network, no assets.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hueShift: number;
}

export interface Sockwave {
  destroy(): void;
  setReducedMotion(reduced: boolean): void;
}

// Smooth, seamless pseudo-noise from summed sines — good enough for a flow
// field and far cheaper than Perlin/simplex for this purpose.
function flowAngle(x: number, y: number, t: number, swirl: number): number {
  const a =
    Math.sin(x * 0.0016 + t) +
    Math.sin(y * 0.0021 - t * 0.8) +
    Math.sin((x + y) * 0.0012 + t * 0.5);
  return a * swirl;
}

export function createSockwave(canvas: HTMLCanvasElement): Sockwave {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let particles: Particle[] = [];
  let raf = 0;
  let running = false;
  let reduced = false;
  let t = 0;

  const pointer = { x: 0, y: 0, active: false };
  let scrollProgress = 0;

  function targetCount(): number {
    // Scale particle count with viewport area, capped for perf.
    const area = width * height;
    return Math.max(120, Math.min(720, Math.round(area / 2600)));
  }

  function spawn(p?: Particle): Particle {
    const maxLife = 120 + Math.random() * 200;
    const part: Particle = p ?? ({} as Particle);
    part.x = Math.random() * width;
    part.y = Math.random() * height;
    part.vx = 0;
    part.vy = 0;
    part.life = Math.random() * maxLife;
    part.maxLife = maxLife;
    part.hueShift = Math.random() * 40 - 20;
    return part;
  }

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = targetCount();
    if (particles.length > count) {
      particles.length = count;
    } else {
      while (particles.length < count) particles.push(spawn());
    }
    paintBackground(1);
    if (reduced) renderPoster();
  }

  function paintBackground(alpha: number): void {
    // Translucent fill creates the motion-trail effect when animating.
    ctx.fillStyle = `rgba(10, 10, 11, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  }

  function step(): void {
    const speed = 0.6 + scrollProgress * 1.7;
    const swirl = 0.9 + scrollProgress * 1.6;
    t += 0.0016 * (reduced ? 0 : 1);

    paintBackground(0.085);
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      const angle = flowAngle(p.x, p.y, t, swirl);
      p.vx += Math.cos(angle) * 0.12 * speed;
      p.vy += Math.sin(angle) * 0.12 * speed;

      // Pointer attraction.
      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 42000) {
          const f = (1 - d2 / 42000) * 0.5;
          p.vx += (dx / Math.sqrt(d2 + 1)) * f;
          p.vy += (dy / Math.sqrt(d2 + 1)) * f;
        }
      }

      p.vx *= 0.92;
      p.vy *= 0.92;
      const px = p.x;
      const py = p.y;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      const fade = Math.sin((p.life / p.maxLife) * Math.PI);
      const hue = 327 + p.hueShift + scrollProgress * 18;
      ctx.strokeStyle = `hsla(${hue}, 86%, ${58 + scrollProgress * 8}%, ${0.55 * fade})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      if (
        p.life <= 0 ||
        p.x < -20 ||
        p.x > width + 20 ||
        p.y < -20 ||
        p.y > height + 20
      ) {
        spawn(p);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(): void {
    if (!running) return;
    step();
    raf = window.requestAnimationFrame(loop);
  }

  // A single dense frame for users who prefer reduced motion: trace the flow
  // field once into static filaments, no animation loop.
  function renderPoster(): void {
    paintBackground(1);
    ctx.globalCompositeOperation = 'lighter';
    const lines = Math.min(900, Math.round((width * height) / 1700));
    for (let i = 0; i < lines; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      const hue = 327 + (Math.random() * 40 - 20);
      ctx.strokeStyle = `hsla(${hue}, 86%, 60%, 0.18)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 26; s++) {
        const a = flowAngle(x, y, 12.3, 1.2);
        x += Math.cos(a) * 6;
        y += Math.sin(a) * 6;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function start(): void {
    if (running || reduced) return;
    running = true;
    raf = window.requestAnimationFrame(loop);
  }

  function stop(): void {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function setReducedMotion(value: boolean): void {
    reduced = value;
    if (reduced) {
      stop();
      renderPoster();
    } else {
      for (const p of particles) spawn(p);
      paintBackground(1);
      start();
    }
  }

  // ---- wiring -------------------------------------------------------------

  function onPointerMove(e: PointerEvent): void {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  }
  function onPointerLeave(): void {
    pointer.active = false;
  }
  function onScroll(): void {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  }
  function onVisibility(): void {
    if (document.hidden) stop();
    else if (!reduced) start();
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerout', onPointerLeave, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  onScroll();
  start();

  return {
    setReducedMotion,
    destroy(): void {
      stop();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      particles = [];
    },
  };
}
