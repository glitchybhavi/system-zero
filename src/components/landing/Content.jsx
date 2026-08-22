// Landing Page content component 
// Dev Notes: I  used LERP Scroll technique and Lenis engine to make this landing page Smooth and to achieve desirable output. 
// Contents of Page are still in prototype and will be updated


import { useEffect, useRef } from 'react';
import './Content.css';

// --- SCROLL-MORPH LERP ENGINE (module scope helpers) ---
function mapRange(val, inMin, inMax) {
  const result = (val - inMin) / (inMax - inMin);
  return Math.max(0, Math.min(1, result));
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, n) {
  return a + (b - a) * n;
}

const PHASES = {
  t1: { in: [0.0, 0.06], hold: [0.06, 0.28], out: [0.28, 0.36] },
  t2: { in: [0.32, 0.42], hold: [0.42, 0.64], out: [0.64, 0.72] },
  t3: { in: [0.68, 0.78], hold: [0.78, 0.88], out: [0.88, 1.0] },
  bgFadeIn: [0.0, 0.1],
  bgFadeOut: [0.86, 1.0],
};

export default function Content() {
  const rootRef = useRef(null);
  const morphSectionRef = useRef(null);
  const ambientBgRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);

  // --- Effect: cinematic scroll-morph text sequence (Lerp-smoothed) ---
  useEffect(() => {
    const morphSection = morphSectionRef.current;
    const text1 = text1Ref.current;
    const text2 = text2Ref.current;
    const text3 = text3Ref.current;
    const ambientBg = ambientBgRef.current;
    if (!morphSection || !text1 || !text2 || !text3 || !ambientBg) return;

    // Target state — recomputed whenever scroll position changes
    const target = {
      bg: { opacity: 0, y: 0, rot: 0 },
      t1: { opacity: 0, y: 50, blur: 0 },
      t2: { opacity: 0, y: 30, scale: 1.15, blur: 20 },
      t3: { opacity: 0, y: 0, scale: 0.85, blur: 0 },
    };

    // Current on-screen state — chases target every frame via lerp
    const current = {
      bg: { opacity: 0, y: 0, rot: 0 },
      t1: { opacity: 0, y: 50, blur: 0 },
      t2: { opacity: 0, y: 30, scale: 1.15, blur: 20 },
      t3: { opacity: 0, y: 0, scale: 0.85, blur: 0 },
    };

    function computeTargets(p) {
      // --- Ambient background glow ---
      let bgOpacity = 0;
      if (p > 0 && p < 1) {
        if (p < PHASES.bgFadeIn[1]) {
          bgOpacity = easeInOutCubic(mapRange(p, PHASES.bgFadeIn[0], PHASES.bgFadeIn[1]));
        } else if (p < PHASES.bgFadeOut[0]) {
          bgOpacity = 1;
        } else {
          bgOpacity = 1 - easeInOutCubic(mapRange(p, PHASES.bgFadeOut[0], PHASES.bgFadeOut[1]));
        }
      }
      target.bg.opacity = bgOpacity;
      target.bg.y = p * 100;
      target.bg.rot = p * 15;

      // --- Phase 1 text ---
      let t1Opacity = 0,
        t1Y = 50,
        t1Blur = 0;
      const p1 = PHASES.t1;
      if (p < p1.in[1]) {
        const e = easeInOutCubic(mapRange(p, p1.in[0], p1.in[1]));
        t1Opacity = e;
        t1Y = 50 * (1 - e);
      } else if (p < p1.hold[1]) {
        t1Opacity = 1;
        t1Y = 0;
      } else if (p < p1.out[1]) {
        const e = easeInOutCubic(mapRange(p, p1.out[0], p1.out[1]));
        t1Opacity = 1 - e;
        t1Y = -36 * e;
        t1Blur = 14 * e;
      }
      target.t1 = { opacity: t1Opacity, y: t1Y, blur: t1Blur };

      // --- Phase 2 text ---
      let t2Opacity = 0,
        t2Y = 30,
        t2Scale = 1.15,
        t2Blur = 20;
      const p2 = PHASES.t2;
      if (p >= p2.in[0] && p < p2.in[1]) {
        const e = easeInOutCubic(mapRange(p, p2.in[0], p2.in[1]));
        t2Opacity = e;
        t2Scale = 1.15 - 0.15 * e;
        t2Blur = 20 * (1 - e);
        t2Y = 30 * (1 - e);
      } else if (p >= p2.in[1] && p < p2.hold[1]) {
        t2Opacity = 1;
        t2Scale = 1;
        t2Blur = 0;
        t2Y = 0;
      } else if (p >= p2.hold[1] && p < p2.out[1]) {
        const e = easeInOutCubic(mapRange(p, p2.out[0], p2.out[1]));
        t2Opacity = 1 - e;
        t2Scale = 1 - 0.05 * e;
        t2Blur = 10 * e;
        t2Y = -30 * e;
      }
      target.t2 = { opacity: t2Opacity, y: t2Y, scale: t2Scale, blur: t2Blur };

      // --- Phase 3 text (massive reveal) ---
      let t3Opacity = 0,
        t3Scale = 0.85;
      const p3 = PHASES.t3;
      if (p >= p3.in[0] && p < p3.in[1]) {
        const e = easeInOutCubic(mapRange(p, p3.in[0], p3.in[1]));
        t3Opacity = e;
        t3Scale = 0.85 + 0.15 * e;
      } else if (p >= p3.in[1] && p < p3.hold[1]) {
        t3Opacity = 1;
        t3Scale = 1;
      } else if (p >= p3.hold[1] && p <= 1.0) {
        const e = easeInOutCubic(mapRange(p, p3.out[0], p3.out[1]));
        t3Opacity = 1 - e;
        t3Scale = 1 + 0.1 * e;
      }
      target.t3 = { opacity: t3Opacity, y: 0, scale: t3Scale, blur: 0 };
    }

    function updateScrollProgress() {
      const rect = morphSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScroll = rect.height - windowHeight;
      let p = -rect.top / totalScroll;
      p = Math.max(0, Math.min(1, p));
      computeTargets(p);
    }

    // Frame-rate independent lerp constant. 8 complements Lenis duration:1.2
    const LERP_SPEED = 8;
    let lastTime = 0;
    let isFirstFrame = true;
    let rafId;

    function lerpGroup(cur, tgt, factor) {
      for (const key in tgt) {
        cur[key] = lerp(cur[key], tgt[key], factor);
      }
    }

    function snapCurrentToTarget() {
      for (const key in target.bg) current.bg[key] = target.bg[key];
      for (const key in target.t1) current.t1[key] = target.t1[key];
      for (const key in target.t2) current.t2[key] = target.t2[key];
      for (const key in target.t3) current.t3[key] = target.t3[key];
    }

    function applyStyles() {
      ambientBg.style.setProperty('--bg-opacity', current.bg.opacity.toFixed(4));
      ambientBg.style.setProperty('--bg-y', `${current.bg.y.toFixed(2)}px`);
      ambientBg.style.setProperty('--bg-rot', `${current.bg.rot.toFixed(2)}deg`);

      text1.style.setProperty('--opacity', current.t1.opacity.toFixed(4));
      text1.style.setProperty('--translateY', `${current.t1.y.toFixed(2)}px`);
      text1.style.setProperty('--blur', `${current.t1.blur.toFixed(2)}px`);
      text1.style.setProperty('--scale', '1');

      text2.style.setProperty('--opacity', current.t2.opacity.toFixed(4));
      text2.style.setProperty('--translateY', `${current.t2.y.toFixed(2)}px`);
      text2.style.setProperty('--scale', current.t2.scale.toFixed(4));
      text2.style.setProperty('--blur', `${current.t2.blur.toFixed(2)}px`);

      text3.style.setProperty('--opacity', current.t3.opacity.toFixed(4));
      text3.style.setProperty('--translateY', '0px');
      text3.style.setProperty('--scale', current.t3.scale.toFixed(4));
      text3.style.setProperty('--blur', '0px');
    }

    function animationLoop(time) {
      // On first frame, snap to correct state instantly (no lerp-from-zero flash)
      if (isFirstFrame) {
        lastTime = time;
        updateScrollProgress();
        snapCurrentToTarget();
        applyStyles();
        isFirstFrame = false;
        rafId = requestAnimationFrame(animationLoop);
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const factor = 1 - Math.exp(-LERP_SPEED * dt);

      lerpGroup(current.bg, target.bg, factor);
      lerpGroup(current.t1, target.t1, factor);
      lerpGroup(current.t2, target.t2, factor);
      lerpGroup(current.t3, target.t3, factor);

      applyStyles();
      rafId = requestAnimationFrame(animationLoop);
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();
    rafId = requestAnimationFrame(animationLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  // --- Intersection Observer for zigzag rows & value-prop grid ---
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -15% 0px', // Trigger when element clears bottom 15% of viewport
      threshold: 0.15,
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Stop observing once animated in for performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    root.querySelectorAll('.slide-from-left, .slide-from-right, .fade-in, .value-card').forEach((el) => {
      scrollObserver.observe(el);
    });

    return () => scrollObserver.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      {/* SCROLL MORPH SECTION */}
      <section className="scroll-morph-container" id="morph-section" ref={morphSectionRef}>
        <div className="sticky-content">
          <div className="ambient-bg" ref={ambientBgRef} />

          <div className="morph-text" id="text-1" ref={text1Ref}>
            <h2>
              Struggling to visualize complex
              <br />
              Computer Science concepts?
            </h2>
          </div>

          <div className="morph-text" id="text-2" ref={text2Ref}>
            <h2>
              You are in the right place.
              <br />
              Welcome to
            </h2>
          </div>

          <div className="morph-text massive" id="text-3" ref={text3Ref}>
            <h2>SYSTEM ZERO</h2>
          </div>
        </div>
      </section>

      {/* CORE FEATURES (ZIGZAG) */}
      <section className="features-section" id="architecture">
        {/* Row 1: Operating Systems */}
        <div className="feature-row">
          <div className="feature-text slide-from-left">
            <h3>Operating Systems</h3>
            <p>
              Dive deep into the kernel. Visually manipulate Virtual Memory pages, resolve Critical Section
              deadlocks in real-time, and watch Process Scheduling algorithms execute step-by-step.
            </p>
          </div>
          <div className="feature-image-container fade-in">
            <div className="overline-text">[ OS VISUALIZATION INTERFACE ]</div>
            <div className="glass-card">
              <div className="card-glow" />
              <div className="card-placeholder-ui">
                <div className="ui-line" />
                <div className="ui-line short" />
                <div className="ui-line accent" style={{ marginTop: '20px' }} />
                <div className="ui-line" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Computer Architecture */}
        <div className="feature-row">
          <div className="feature-text slide-from-right">
            <h3>Computer Architecture</h3>
            <p>
              Trace the silicon pathways. Monitor CPU Register pipelines, simulate Cache Hits and Misses under
              load, and construct complex Logic Gate Circuits with immediate visual feedback.
            </p>
          </div>
          <div className="feature-image-container fade-in">
            <div className="overline-text">[ ARCHITECTURE ENGINE ]</div>
            <div className="glass-card">
              <div className="card-glow" />
              <div className="card-placeholder-ui" style={{ alignItems: 'flex-end' }}>
                <div className="ui-line short" />
                <div className="ui-line" />
                <div className="ui-line accent" style={{ marginTop: '20px', width: '80%' }} />
                <div className="ui-line short" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Data Representation */}
        <div className="feature-row">
          <div className="feature-text slide-from-left">
            <h3>Data Representation</h3>
            <p>
              See the bits flip. Utilize our Interactive Binary, Hexadecimal, and Octal Converter. Master
              Bitwise Operations by watching data transform at the lowest machine level.
            </p>
          </div>
          <div className="feature-image-container fade-in">
            <div className="overline-text">[ DATA TRANSFORMATION MATRIX ]</div>
            <div className="glass-card">
              <div className="card-glow" />
              <div className="card-placeholder-ui" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="ui-line" />
                <div className="ui-line accent" />
                <div className="ui-line short" />
                <div className="ui-line" />
                <div className="ui-line accent" />
                <div className="ui-line short" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP GRID */}
      <section className="value-prop-section" id="documentation">
        <div className="section-header slide-from-left">
          <span className="section-overline">[ Why System Zero ]</span>
          <h2>
            Built for the way
            <br />
            engineers actually learn
          </h2>
          <p>
            Every tool is designed around one principle: you understand something deeply only when you can see
            it move, break it, and rebuild it from scratch.
          </p>
        </div>

        <div className="value-grid">
          <div className="value-card">
            <div className="value-icon">
              <svg viewBox="0 0 24 24">
                <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h4>Interactive First</h4>
            <p>
              Don't just read code—manipulate parameters in real-time. Experience dynamic visual feedback that
              solidifies abstract theoretical concepts.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <svg viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4>Zero Configuration</h4>
            <p>
              Runs on your browser with instant execution. No local environments, no dependency hell. Just
              launch and learn immediately.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path d="M12 14v6.5" />
              </svg>
            </div>
            <h4>Exam &amp; Interview Ready</h4>
            <p>
              Designed specifically around core university CS curricula. Master the exact topics tested in
              top-tier technical interviews and final exams.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
