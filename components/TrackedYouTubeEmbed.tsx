"use client";

import { useEffect, useRef } from "react";

type TrackedYouTubeEmbedProps = {
  iframeId: string;
  videoId: string;
  title: string;
  className?: string;
};

type DataLayerEvent = Record<string, unknown>;

type YouTubePlayer = {
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
};

type YouTubePlayerEvent = {
  data: number;
};

type YouTubeIframeApi = {
  Player: new (
    elementId: string,
    config: {
      events?: {
        onStateChange?: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
    PAUSED: number;
    PLAYING: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeIframeApi;
    dataLayer?: DataLayerEvent[];
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeIframeApiPromise: Promise<YouTubeIframeApi> | null = null;

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube iframe API is unavailable."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeIframeApiPromise) {
    return youtubeIframeApiPromise;
  }

  youtubeIframeApiPromise = new Promise<YouTubeIframeApi>((resolve, reject) => {
    const resolveApi = () => {
      if (window.YT?.Player) {
        resolve(window.YT);
      }
    };

    const handleError = () => {
      reject(new Error("Failed to load YouTube iframe API."));
    };

    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      resolveApi();
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-flowr-youtube-api="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("error", handleError, { once: true });
      resolveApi();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.defer = true;
    script.dataset.flowrYoutubeApi = "true";
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return youtubeIframeApiPromise;
}

function buildVideoWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function TrackedYouTubeEmbed({
  iframeId,
  videoId,
  title,
  className = "",
}: TrackedYouTubeEmbedProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const reachedMilestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let isActive = true;

    const stopProgressPolling = () => {
      if (progressTimerRef.current !== null) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };

    const getPlaybackSnapshot = (forcedPercent?: number) => {
      const player = playerRef.current;
      const currentTime = player ? Math.round(player.getCurrentTime()) : 0;
      const duration = player ? Math.round(player.getDuration()) : 0;
      const measuredPercent =
        duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;

      return {
        video_current_time: currentTime,
        video_duration: duration,
        video_percent: forcedPercent ?? measuredPercent,
      };
    };

    const pushVideoEvent = (
      eventName: string,
      extraData: Record<string, unknown> = {},
    ) => {
      if (!isActive) return;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        video_id: videoId,
        video_title: title,
        video_provider: "youtube",
        video_url: buildVideoWatchUrl(videoId),
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
        ...extraData,
      });
    };

    const checkMilestones = () => {
      const player = playerRef.current;
      if (!player) return;

      const duration = player.getDuration();
      if (duration <= 0) return;

      const percentComplete = (player.getCurrentTime() / duration) * 100;

      [25, 50, 75].forEach((milestone) => {
        if (
          percentComplete >= milestone &&
          !reachedMilestonesRef.current.has(milestone)
        ) {
          reachedMilestonesRef.current.add(milestone);
          pushVideoEvent(
            "flowr_video_progress",
            getPlaybackSnapshot(milestone),
          );
        }
      });
    };

    const startProgressPolling = () => {
      stopProgressPolling();
      progressTimerRef.current = window.setInterval(checkMilestones, 1000);
    };

    loadYouTubeIframeApi()
      .then((youtube) => {
        if (!isActive) return;

        playerRef.current = new youtube.Player(iframeId, {
          events: {
            onStateChange: (event) => {
              if (event.data === youtube.PlayerState.PLAYING) {
                if (!hasStartedRef.current) {
                  hasStartedRef.current = true;
                  pushVideoEvent("flowr_video_start", getPlaybackSnapshot(0));
                }

                startProgressPolling();
                return;
              }

              if (event.data === youtube.PlayerState.PAUSED) {
                stopProgressPolling();
                return;
              }

              if (event.data === youtube.PlayerState.ENDED) {
                checkMilestones();
                stopProgressPolling();
                pushVideoEvent(
                  "flowr_video_complete",
                  getPlaybackSnapshot(100),
                );
              }
            },
          },
        });
      })
      .catch(() => {
        // Leave the iframe usable even when the player API cannot be loaded.
      });

    return () => {
      isActive = false;
      stopProgressPolling();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [iframeId, title, videoId]);

  return (
    <iframe
      id={iframeId}
      title={title}
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&enablejsapi=1&playsinline=1`}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      className={className}
    />
  );
}
