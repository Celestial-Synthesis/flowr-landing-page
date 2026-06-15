"use client";

import { useEffect, useRef, useState } from "react";

type HeroWorkflowSceneProps = {
  className?: string;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function setHeroProgressVariables(scene: HTMLDivElement, progress: number) {
  const setVariable = (name: string, value: string) => {
    scene.style.setProperty(name, value);
  };

  setVariable("--flowr-hero-break-progress", progress.toFixed(4));
  setVariable("--flowr-hero-shell-x", `${96 * progress}px`);
  setVariable("--flowr-hero-shell-y", `${22 * progress}px`);
  setVariable("--flowr-hero-shell-rotate", `${0.8 * progress}deg`);
  setVariable("--flowr-hero-shell-scale", (1 - progress * 0.035).toFixed(4));
  setVariable("--flowr-hero-toolbar-opacity", (1 - progress * 0.28).toFixed(4));
  setVariable("--flowr-hero-toolbar-x", `${-84 * progress}px`);
  setVariable("--flowr-hero-toolbar-y", `${-78 * progress}px`);
  setVariable("--flowr-hero-toolbar-rotate", `${-2.6 * progress}deg`);
  setVariable("--flowr-hero-toolbar-scale", (1 - progress * 0.07).toFixed(4));
  setVariable("--flowr-hero-url-opacity", (1 - progress * 0.2).toFixed(4));
  setVariable("--flowr-hero-url-x", `${380 * progress}px`);
  setVariable("--flowr-hero-url-y", `${-10 * progress}px`);
  setVariable("--flowr-hero-url-rotate", `${2.2 * progress}deg`);
  setVariable("--flowr-hero-url-scale", (1 - progress * 0.045).toFixed(4));
  setVariable("--flowr-hero-form-x", `${-360 * progress}px`);
  setVariable("--flowr-hero-form-y", `${110 * progress}px`);
  setVariable("--flowr-hero-form-rotate", `${-7.5 * progress}deg`);
  setVariable("--flowr-hero-form-scale", (1 - progress * 0.12).toFixed(4));
  setVariable("--flowr-hero-copy-x", `${620 * progress}px`);
  setVariable("--flowr-hero-copy-y", `${128 * progress}px`);
  setVariable("--flowr-hero-copy-rotate", `${7 * progress}deg`);
  setVariable("--flowr-hero-copy-scale", (1 - progress * 0.12).toFixed(4));
  setVariable("--flowr-hero-recorder-x", `${420 * progress}px`);
  setVariable("--flowr-hero-recorder-y", `${-104 * progress}px`);
  setVariable("--flowr-hero-recorder-rotate", `${7.5 * progress}deg`);
  setVariable("--flowr-hero-recorder-scale", (1 - progress * 0.11).toFixed(4));
}

export function HeroWorkflowScene({ className = "" }: HeroWorkflowSceneProps) {
  const [isReady, setIsReady] = useState(false);
  const [assemblyState, setAssemblyState] = useState<"together" | "apart">(
    "together",
  );
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const metricsRef = useRef({ startY: 0, distance: 1 });
  const lastProgressRef = useRef(-1);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setIsReady(true), 1160);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopViewport = window.matchMedia("(min-width: 1024px)");

    if (reducedMotion.matches || !desktopViewport.matches) {
      const scene = sceneRef.current;
      if (scene) {
        setHeroProgressVariables(scene, 0);
      }

      return () => {
        window.clearTimeout(readyTimer);
      };
    }

    const measureScrollRange = () => {
      const scene = sceneRef.current;

      if (scene === null) return;

      const rect = scene.getBoundingClientRect();
      const sceneTop = rect.top + window.scrollY;
      const sceneBottom = sceneTop + rect.height;
      const startY = Math.max(0, sceneTop - window.innerHeight * 0.42);

      metricsRef.current = {
        startY,
        distance: Math.max(sceneBottom - startY, 1),
      };
    };

    const updateScrollProgress = () => {
      frameRef.current = null;
      const scene = sceneRef.current;

      if (scene === null) return;

      const { startY, distance } = metricsRef.current;
      const progress = clamp((window.scrollY - startY) / distance, 0, 1);

      if (Math.abs(progress - lastProgressRef.current) < 0.001) return;

      lastProgressRef.current = progress;
      setHeroProgressVariables(scene, progress);

      const nextAssemblyState = progress > 0.012 ? "apart" : "together";
      setAssemblyState((currentAssemblyState) =>
        currentAssemblyState === nextAssemblyState
          ? currentAssemblyState
          : nextAssemblyState,
      );
    };

    const requestUpdate = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      measureScrollRange();
      requestUpdate();
    });

    if (sceneRef.current !== null) {
      resizeObserver.observe(sceneRef.current);
    }

    measureScrollRange();
    requestUpdate();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", measureScrollRange);
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.clearTimeout(readyTimer);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", measureScrollRange);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div
      id="flowr-hero-workflow-scene"
      ref={sceneRef}
      aria-hidden="true"
      className={`flowr-hero-workflow-scene ${
        isReady ? "flowr-hero-workflow-scene--ready" : ""
      } flowr-hero-workflow-scene--${assemblyState} mx-auto w-full max-w-7xl overflow-visible rounded-lg border border-[#e7d8cf] bg-white/82 p-3 shadow-2xl shadow-[#3c2118]/12 backdrop-blur ${className}`}
      data-flowr-assembly={assemblyState}
    >
      <div
        id="flowr-hero-toolbar"
        className="flowr-hero-toolbar flowr-hero-piece flowr-hero-piece--toolbar flex items-center justify-between pb-3"
      >
        <div
          id="flowr-hero-window-dots"
          className="flowr-hero-window-dots flex items-center gap-2"
        >
          <span
            id="flowr-hero-window-dot-close"
            className="flowr-hero-window-dot flowr-hero-window-dot--close size-3 rounded-full bg-[#ff7a70]"
          />
          <span
            id="flowr-hero-window-dot-minimize"
            className="flowr-hero-window-dot flowr-hero-window-dot--minimize size-3 rounded-full bg-[#ffc24a]"
          />
          <span
            id="flowr-hero-window-dot-zoom"
            className="flowr-hero-window-dot flowr-hero-window-dot--zoom size-3 rounded-full bg-[#4fc3a1]"
          />
        </div>
        <div
          id="flowr-hero-url"
          className="flowr-hero-url hidden rounded-md bg-[#f7f1ed] px-4 py-1.5 text-xs font-medium text-[#675f59] sm:block"
        >
          customer.example.com/setup
        </div>
      </div>
      <div
        id="flowr-hero-toolbar-border"
        className="flowr-hero-toolbar-border border-t border-[#eadfd8]"
      />
      <div
        id="flowr-hero-workspace"
        className="flowr-hero-workspace grid gap-4 pt-4 md:grid-cols-[1fr_280px]"
      >
        <div
          id="flowr-hero-main-grid"
          className="flowr-hero-main-grid grid gap-4 sm:grid-cols-2"
        >
          <div
            id="flowr-hero-form-card"
            className="flowr-hero-piece flowr-hero-piece--form-card rounded-md border border-[#eadfd8] bg-[#fffaf7] p-5"
          >
            <div
              id="flowr-hero-form-label"
              className="flowr-hero-form-label h-3 w-28 rounded-sm bg-[#d4c2b7]"
            />
            <div
              id="flowr-hero-active-field"
              className="flowr-hero-field flowr-hero-field--active mt-5 h-11 rounded-md border-2 border-[#7a263f] bg-[#fff3ee] shadow-[0_0_0_6px_rgba(122,38,63,0.1)]"
            />
            <div
              id="flowr-hero-secondary-field"
              className="flowr-hero-field flowr-hero-field--secondary mt-4 h-11 rounded-md border border-[#eadfd8] bg-white"
            />
          </div>
          <div
            id="flowr-hero-copy-card"
            className="flowr-hero-piece flowr-hero-piece--copy-card rounded-md border border-[#eadfd8] bg-white p-5"
          >
            <div
              id="flowr-hero-copy-heading"
              className="flowr-hero-copy-heading h-3 w-32 rounded-sm bg-[#d4c2b7]"
            />
            <div
              id="flowr-hero-copy-lines"
              className="flowr-hero-copy-lines mt-5 space-y-3"
            >
              <div className="flowr-hero-copy-line flowr-hero-copy-line--one h-3 rounded-sm bg-[#eadfd8]" />
              <div className="flowr-hero-copy-line flowr-hero-copy-line--two h-3 w-4/5 rounded-sm bg-[#eadfd8]" />
              <div className="flowr-hero-copy-line flowr-hero-copy-line--three h-3 w-2/3 rounded-sm bg-[#eadfd8]" />
            </div>
            <div
              id="flowr-hero-invite-button"
              className="flowr-hero-invite-button mt-7 inline-flex rounded-md bg-[#7a263f] px-4 py-2 text-sm font-semibold text-white"
            >
              Invite teammate
            </div>
          </div>
        </div>
        <div
          id="flowr-hero-recorder-panel"
          className="flowr-hero-piece flowr-hero-piece--recorder-panel hidden rounded-md border border-[#eadfd8] bg-[#fff8f4] p-4 md:block"
        >
          <div
            id="flowr-hero-recorder-header"
            className="flowr-hero-recorder-header mb-4 flex items-center justify-between"
          >
            <span className="flowr-hero-recorder-brand text-sm font-semibold text-[#201916]">
              FlowR
            </span>
            <span
              id="flowr-hero-recording-badge"
              className="flowr-hero-recording-badge inline-flex items-center gap-1 rounded-md bg-[#fff0ea] px-2 py-1 text-xs font-semibold text-[#7a263f]"
            >
              <span className="flowr-record-dot size-2 rounded-full bg-[#d64444]" />
              Recording
            </span>
          </div>
          <div
            id="flowr-hero-step-list"
            className="flowr-hero-step-list space-y-3 text-xs font-semibold text-[#675f59]"
          >
            <div
              id="flowr-hero-step-capture"
              className="flowr-hero-step flowr-hero-step--capture rounded-md border border-[#7a263f]/25 bg-white p-3 text-[#7a263f]"
            >
              01 Capture workflow name
            </div>
            <div
              id="flowr-hero-step-owner"
              className="flowr-hero-step flowr-hero-step--owner rounded-md border border-[#eadfd8] bg-white p-3"
            >
              02 Add owner email
            </div>
            <div
              id="flowr-hero-step-publish"
              className="flowr-hero-step flowr-hero-step--publish rounded-md border border-[#eadfd8] bg-white p-3"
            >
              03 Publish invite
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
