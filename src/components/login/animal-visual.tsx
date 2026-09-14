"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic animal visual for the login screen (spec section E–I, BH, BI).
 *
 * This component is built as a real media slot: point `videoSrc` at a
 * compressed, looping MP4/WebM of the chosen animal (black wolf by
 * default per the brief) and it autoplays muted, inline, looping, with
 * no visible controls — exactly as specified. `posterSrc` is shown
 * immediately (and used as the no-JS / reduced-data fallback) so the
 * page never waits on a blank box for a heavy video to arrive.
 *
 * Until a real asset is supplied, `videoSrc`/`posterSrc` are left
 * undefined and the component renders an atmospheric gradient study
 * instead — dark, cyan-rimmed, animated the same way the real footage
 * would be — so the page's cinematic feel and animation system can be
 * reviewed and shipped independently of sourcing the final footage.
 */

interface AnimalVisualProps {
  videoSrc?: string;
  posterSrc?: string;
  alt?: string;
}

export function AnimalVisual({ videoSrc, posterSrc, alt = "" }: AnimalVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [introDone, setIntroDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    // BI. Cinematic intro sequence timing (~900ms).
    const timer = setTimeout(() => setIntroDone(true), 60);
    return () => {
      mq.removeEventListener("change", handler);
      clearTimeout(timer);
    };
  }, []);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    // Deliberately tiny range — "parallax sangat kecil" per spec BH.
    setParallax({ x: px * 6, y: py * 4 });
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="animal-visual"
      aria-hidden="true"
    >
      <div
        className="animal-visual__media-layer"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.04)`,
        }}
      >
        {videoSrc ? (
          <video
            className="animal-visual__video"
            autoPlay
            muted
            loop
            playsInline
            poster={posterSrc}
            aria-label={alt}
          >
            <source src={videoSrc} />
          </video>
        ) : (
          <AtmosphericStudy />
        )}
      </div>

      {/* Overlay stack — fog, vignette, cyan rim, gradient-to-form (spec G, I) */}
      <div className="animal-visual__fog" />
      <div className="animal-visual__rim-light" />
      <div className="animal-visual__vignette" />
      <div className="animal-visual__form-gradient" />

      <div
        className={`animal-visual__intro-veil ${introDone ? "animal-visual__intro-veil--hidden" : ""}`}
      />
    </div>
  );
}

/**
 * Fallback atmospheric study shown until a real photoreal video/image
 * asset is wired in. Not a literal wolf illustration — a dark,
 * cinematic gradient composition with a slow cyan sweep and a subtle
 * breathing pulse, so the layout and lighting language can be judged
 * on their own terms.
 */
function AtmosphericStudy() {
  return (
    <div className="atmospheric-study">
      <div className="atmospheric-study__silhouette" />
      <div className="atmospheric-study__sweep" />
      <div className="atmospheric-study__particles" />
    </div>
  );
}
