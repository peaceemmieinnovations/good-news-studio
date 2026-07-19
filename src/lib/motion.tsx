import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- Smooth scroll (Lenis) ---------- */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let rafId = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}

/* ---------- Scroll progress bar ---------- */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left">
      <div ref={ref} className="h-full w-full origin-left scale-x-0 bg-gradient-primary shadow-glow" />
    </div>
  );
}

/* ---------- Reveal on scroll ---------- */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  opts: { y?: number; delay?: number; stagger?: number; selector?: string; scale?: number } = {},
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { y = 40, delay = 0, stagger = 0.06, selector, scale } = opts;
    const targets = selector ? el.querySelectorAll<HTMLElement>(selector) : [el];
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y,
        opacity: 0,
        scale: scale ?? 1,
        duration: 0.9,
        ease: "power3.out",
        delay,
        stagger,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, el);
    return () => ctx.revert();
  }, [opts]);
  return ref;
}

export function Reveal({
  children,
  className,
  y = 40,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useReveal<HTMLDivElement>({ y, delay });
  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} className={className}>
      {children}
    </Comp>
  );
}

/* ---------- Split text reveal (word by word) ---------- */
export function SplitText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    const ctx = gsap.context(() => {
      gsap.from(words, {
        yPercent: 110,
        opacity: 0,
        rotate: 4,
        duration: 1,
        ease: "expo.out",
        stagger: 0.055,
        delay: 0.15,
      });
    }, el);
    return () => ctx.revert();
  }, [children]);
  return (
    <span ref={ref} className={className}>
      {children.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.05em]">
          <span data-word className="inline-block will-change-transform">
            {w}
            {i < children.split(" ").length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ---------- Magnetic button ---------- */
export function Magnetic({
  children,
  strength = 22,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
    gsap.to(el, { x, y, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={"inline-block will-change-transform " + (className ?? "")}
    >
      {children}
    </div>
  );
}

/* ---------- Parallax wrapper ---------- */
export function Parallax({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -speed * 100,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, [speed]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ---------- Marquee ---------- */
export function Marquee({ items, speed = 40 }: { items: string[]; speed?: number }) {
  const list = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden py-8 border-y border-border/40 bg-surface/30">
      <div
        className="flex whitespace-nowrap gap-12 will-change-transform"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        {list.map((it, i) => (
          <span
            key={i}
            className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-muted-foreground/40 hover:text-gradient transition"
          >
            {it} <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Animated hero canvas (gradient mesh + particles) ---------- */
export function AnimatedHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse
    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: MouseEvent | globalThis.MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    // Particles
    const count = Math.min(120, Math.floor((w * h) / 14000));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.3,
      hue: 250 + Math.random() * 90,
    }));

    let t = 0;
    let raf = 0;

    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, w, h);

      // gradient mesh blobs
      const blobs = [
        { x: w * (0.25 + 0.1 * Math.sin(t)), y: h * (0.3 + 0.1 * Math.cos(t * 1.3)), r: Math.max(w, h) * 0.45, c: "rgba(99, 102, 241, 0.35)" },
        { x: w * (0.75 + 0.12 * Math.cos(t * 0.9)), y: h * (0.65 + 0.09 * Math.sin(t)), r: Math.max(w, h) * 0.5, c: "rgba(217, 70, 239, 0.28)" },
        { x: w * (0.5 + 0.15 * Math.sin(t * 0.7)), y: h * (0.9 + 0.08 * Math.cos(t * 1.1)), r: Math.max(w, h) * 0.4, c: "rgba(34, 211, 238, 0.22)" },
      ];
      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // particles + connections
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        // repel from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140) {
          const f = (140 - Math.sqrt(d2)) / 140;
          p.vx += (dx / (Math.sqrt(d2) || 1)) * f * 0.4;
          p.vy += (dy / (Math.sqrt(d2) || 1)) * f * 0.4;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.85)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // connect
      ctx.strokeStyle = "rgba(160, 160, 255, 0.12)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = dx * dx + dy * dy;
          if (d < 110 * 110) {
            ctx.globalAlpha = 1 - d / (110 * 110);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [mounted]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden
    />
  );
}
