"use client";

/**
 * LocalRecorderLauncher
 *
 * Dynamically imports the vendored @flowr/sdk-recorder-local bundle at runtime,
 * initialises the recorder, and exposes its handle + event log via props/callbacks.
 * Cleans up (destroy) on unmount.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OfficialRecording } from "@/lib/playground-official-recordings";

export type RecorderStatus =
  | "idle"
  | "loading"
  | "ready"
  | "recording"
  | "error";

export type SavedRecording = {
  id: string;
  title: string;
  stepCount: number;
  createdAt: number;
};

type SdkRecording = {
  id: string;
  title?: string;
  steps?: unknown[];
  stepCount?: number;
  createdAt?: number;
  updatedAt?: number;
};

export type RecorderHandle = {
  status: RecorderStatus;
  errorMessage: string | null;
  isRecording: boolean;
  savedRecordings: SavedRecording[];
  open: () => void;
  close: () => void;
  startRecording: (title?: string) => void;
  stopRecording: () => void;
  replayRecording: (idOrRecording: string | OfficialRecording) => void;
  deleteRecording: (id: string) => void;
  clearAll: () => void;
};

// Minimal slice of the SDK types we interact with.
type SdkHandle = {
  open(): void;
  close(): void;
  startRecording(opts?: { title?: string }): Promise<unknown>;
  stopRecording(): Promise<unknown>;
  listRecordings(): Promise<SdkRecording[]>;
  deleteRecording(id: string): Promise<void>;
  clearAll(): Promise<void>;
  replay(idOrRecording: string | OfficialRecording): Promise<void>;
  on(event: string, listener: (data?: unknown) => void): void;
  destroy(): void;
};

type SdkModule = {
  recorderLocal(opts: {
    storageKey: string;
    position: string;
    screenshots: boolean;
    iconUrl?: string;
    panelCssText?: string;
  }): SdkHandle;
};

const SDK_URL = "/vendor/flowr/sdk-recorder-local/index.js";
const STORAGE_KEY = "flowr-playground:recordings";
const FLOWR_BUBBLE_ICON_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="FlowR"><path fill="#fff" d="M6 5.5A1.5 1.5 0 0 1 7.5 4h10a1.5 1.5 0 0 1 0 3h-8v3.25h6.5a1.5 1.5 0 0 1 0 3H9.5V18.5a1.5 1.5 0 0 1-3 0v-13Z"/></svg>',
)}`;
const FLOWR_BUBBLE_CSS = `
  .bubble {
    background: #7a263f;
  }

  .bubble:hover {
    background: #681f35;
  }

  .bubble img {
    width: 26px;
    height: 26px;
  }
`;

const toSavedRecording = (recording: SdkRecording): SavedRecording => ({
  id: recording.id,
  title: recording.title?.trim() || "Untitled recording",
  stepCount: Array.isArray(recording.steps)
    ? recording.steps.length
    : (recording.stepCount ?? 0),
  createdAt: recording.createdAt ?? recording.updatedAt ?? Date.now(),
});

const resolveSdkErrorMessage = (data: unknown): string => {
  if (data instanceof Error) return data.message;
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    const event = data as { error?: unknown; message?: unknown };
    if (event.error instanceof Error) return event.error.message;
    if (typeof event.error === "string") return event.error;
    if (
      event.error &&
      typeof event.error === "object" &&
      "message" in event.error
    ) {
      return String((event.error as { message: unknown }).message);
    }
    if (typeof event.message === "string") return event.message;
  }

  return "An error occurred in the FlowR SDK.";
};

export function useLocalRecorder(): RecorderHandle {
  const sdkRef = useRef<SdkHandle | null>(null);
  const mountedRef = useRef(false);
  const [status, setStatus] = useState<RecorderStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);

  const reportError = useCallback((err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : fallback;
    setErrorMessage(msg);
    setStatus("error");
  }, []);

  const refreshList = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk) return;
    try {
      const recordings = await sdk.listRecordings();
      if (mountedRef.current) {
        setSavedRecordings(
          Array.isArray(recordings) ? recordings.map(toSavedRecording) : [],
        );
      }
    } catch (err) {
      reportError(err, "Failed to list saved recordings.");
    }
  }, [reportError]);

  useEffect(() => {
    let destroyed = false;
    mountedRef.current = true;

    import(/* webpackIgnore: true */ SDK_URL)
      .then((mod: SdkModule) => {
        if (destroyed) return;

        const handle = mod.recorderLocal({
          storageKey: STORAGE_KEY,
          position: "bottom-right",
          screenshots: true,
          iconUrl: FLOWR_BUBBLE_ICON_URL,
          panelCssText: FLOWR_BUBBLE_CSS,
        });

        sdkRef.current = handle;

        handle.on("ready", () => {
          if (destroyed) return;
          setStatus("ready");
          void refreshList();
        });

        handle.on("recording-started", () => {
          if (destroyed) return;
          setIsRecording(true);
          setStatus("recording");
        });

        handle.on("recording-saved", () => {
          if (destroyed) return;
          setIsRecording(false);
          setStatus("ready");
          void refreshList();
        });

        handle.on("replay-complete", () => {
          if (destroyed) return;
          void refreshList();
        });

        handle.on("error", (data) => {
          if (destroyed) return;
          setErrorMessage(resolveSdkErrorMessage(data));
          setStatus("error");
        });
      })
      .catch((err: unknown) => {
        if (destroyed) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load the FlowR recorder SDK.";
        setErrorMessage(msg);
        setStatus("error");
      });

    return () => {
      destroyed = true;
      mountedRef.current = false;
      sdkRef.current?.destroy();
      sdkRef.current = null;
    };
  }, [refreshList]);

  const open = useCallback(() => sdkRef.current?.open(), []);
  const close = useCallback(() => sdkRef.current?.close(), []);
  const startRecording = useCallback(
    (title?: string) => {
      setErrorMessage(null);
      void sdkRef.current
        ?.startRecording({ title })
        .catch((err) => reportError(err, "Failed to start recording."));
    },
    [reportError],
  );
  const stopRecording = useCallback(() => {
    void sdkRef.current
      ?.stopRecording()
      .then(() => {
        if (!mountedRef.current) return;
        setIsRecording(false);
        setStatus("ready");
        void refreshList();
      })
      .catch((err) => reportError(err, "Failed to stop recording."));
  }, [refreshList, reportError]);
  const replayRecording = useCallback(
    (idOrRecording: string | OfficialRecording) => {
      void sdkRef.current
        ?.replay(idOrRecording)
        .catch((err) => reportError(err, "Failed to replay recording."));
    },
    [reportError],
  );
  const deleteRecording = useCallback(
    (id: string) => {
      void sdkRef.current
        ?.deleteRecording(id)
        .then(() => refreshList())
        .catch((err) => reportError(err, "Failed to delete recording."));
    },
    [refreshList, reportError],
  );
  const clearAll = useCallback(() => {
    void sdkRef.current
      ?.clearAll()
      .then(() => refreshList())
      .catch((err) => reportError(err, "Failed to clear recordings."));
  }, [refreshList, reportError]);

  return useMemo(
    () => ({
      status,
      errorMessage,
      isRecording,
      savedRecordings,
      open,
      close,
      startRecording,
      stopRecording,
      replayRecording,
      deleteRecording,
      clearAll,
    }),
    [
      status,
      errorMessage,
      isRecording,
      savedRecordings,
      open,
      close,
      startRecording,
      stopRecording,
      replayRecording,
      deleteRecording,
      clearAll,
    ],
  );
}

export default useLocalRecorder;
