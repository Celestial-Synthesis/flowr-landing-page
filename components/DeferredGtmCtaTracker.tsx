"use client";

import { useEffect, useState, type ComponentType } from "react";

const trackerDelayMs = 1400;

type IdleCallbackHandle = number;

type IdleCallback = (callback: () => void) => IdleCallbackHandle;
type IdleCancel = (handle: IdleCallbackHandle) => void;

function getIdleScheduler(): {
  schedule: IdleCallback;
  cancel: IdleCancel;
} {
  if (typeof window === "undefined") {
    return {
      schedule: () => 0,
      cancel: () => undefined,
    };
  }

  if ("requestIdleCallback" in window && "cancelIdleCallback" in window) {
    const schedule = window.requestIdleCallback.bind(window) as IdleCallback;
    const cancel = window.cancelIdleCallback.bind(window) as IdleCancel;

    return { schedule, cancel };
  }

  return {
    schedule: (callback) => window.setTimeout(callback, trackerDelayMs),
    cancel: (handle) => window.clearTimeout(handle),
  };
}

export function DeferredGtmCtaTracker() {
  const [Tracker, setTracker] = useState<ComponentType | null>(null);

  useEffect(() => {
    let active = true;
    const { schedule, cancel } = getIdleScheduler();

    const handle = schedule(() => {
      void import("@/components/GtmCtaTracker").then((module) => {
        if (!active) return;
        setTracker(() => module.GtmCtaTracker);
      });
    });

    return () => {
      active = false;
      cancel(handle);
    };
  }, []);

  if (!Tracker) return null;

  return <Tracker />;
}
