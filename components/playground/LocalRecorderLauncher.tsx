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
import { playgroundSdkEntryUrl } from "@/lib/playground-sdk-runtime";

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

const SDK_URL = playgroundSdkEntryUrl;

let sdkModulePreload: Promise<SdkModule> | null = null;

const preloadLocalRecorderSdk = (): Promise<SdkModule> => {
  if (!sdkModulePreload) {
    sdkModulePreload = import(/* webpackIgnore: true */ SDK_URL) as Promise<SdkModule>;
  }
  return sdkModulePreload;
};

if (typeof window !== "undefined") {
  void preloadLocalRecorderSdk();
}
const STORAGE_KEY = "flowr-playground:recordings";
const OFFICIAL_REPLAY_PANEL_SUPPRESSION_KEY =
  "flowr-playground:official-replay-panel-suppression";
const OFFICIAL_REPLAY_PANEL_SUPPRESSION_TTL_MS = 60_000;
const FLOWR_BUBBLE_ICON_URL = "/flowr48.png";
const FLOWR_BUBBLE_CSS = `
  @keyframes flowr-bubble-pulse {
    0%,
    100% {
      box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.18),
        0 2px 6px rgba(0, 0, 0, 0.08),
        0 0 0 0 rgba(122, 38, 63, 0.22);
    }

    50% {
      box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.18),
        0 2px 6px rgba(0, 0, 0, 0.08),
        0 0 0 12px rgba(122, 38, 63, 0);
    }
  }

  .bubble {
    background: linear-gradient(180deg, #fffdfd 0%, #fff2f5 100%);
    border: 1px solid rgba(122, 38, 63, 0.16);
    animation: flowr-bubble-pulse 2.8s ease-in-out infinite;
  }

  .bubble:hover {
    background: #ffffff;
    animation-play-state: paused;
  }

  .bubble:active {
    animation-play-state: paused;
  }

  .bubble img {
    width: 28px;
    height: 28px;
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

const getSessionStorage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const writeOfficialReplayPanelSuppression = (
  recording: OfficialRecording,
): void => {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.setItem(
      OFFICIAL_REPLAY_PANEL_SUPPRESSION_KEY,
      JSON.stringify({ recordingId: recording.id, createdAt: Date.now() }),
    );
  } catch {}
};

const clearOfficialReplayPanelSuppression = (): void => {
  try {
    getSessionStorage()?.removeItem(OFFICIAL_REPLAY_PANEL_SUPPRESSION_KEY);
  } catch {}
};

const readOfficialReplayPanelSuppression = (): string | null => {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(OFFICIAL_REPLAY_PANEL_SUPPRESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      recordingId?: unknown;
      createdAt?: unknown;
    } | null;

    if (
      !parsed ||
      typeof parsed.recordingId !== "string" ||
      typeof parsed.createdAt !== "number" ||
      Date.now() - parsed.createdAt > OFFICIAL_REPLAY_PANEL_SUPPRESSION_TTL_MS
    ) {
      storage.removeItem(OFFICIAL_REPLAY_PANEL_SUPPRESSION_KEY);
      return null;
    }

    return parsed.recordingId;
  } catch {
    storage.removeItem(OFFICIAL_REPLAY_PANEL_SUPPRESSION_KEY);
    return null;
  }
};

const resolveReplayEventRecordingId = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;

  const event = data as { id?: unknown; recording?: unknown };
  if (typeof event.id === "string") return event.id;
  if (!event.recording || typeof event.recording !== "object") return null;

  const recording = event.recording as { id?: unknown };
  return typeof recording.id === "string" ? recording.id : null;
};

const closeSuppressedOfficialReplayPanel = (
  sdk: SdkHandle,
  data?: unknown,
): void => {
  const suppressedRecordingId = readOfficialReplayPanelSuppression();
  if (!suppressedRecordingId) return;

  const replayRecordingId = resolveReplayEventRecordingId(data);
  if (replayRecordingId && replayRecordingId !== suppressedRecordingId) return;

  sdk.close();
  clearOfficialReplayPanelSuppression();
};

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

    preloadLocalRecorderSdk()
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

        handle.on("replay-start", (data) => {
          if (destroyed) return;
          closeSuppressedOfficialReplayPanel(handle, data);
        });

        handle.on("replay-complete", () => {
          if (destroyed) return;
          clearOfficialReplayPanelSuppression();
          void refreshList();
        });

        handle.on("error", (data) => {
          if (destroyed) return;
          clearOfficialReplayPanelSuppression();
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
      const sdk = sdkRef.current;
      if (!sdk) return;

      const shouldClosePanelAfterStart = typeof idOrRecording !== "string";
      if (shouldClosePanelAfterStart) {
        writeOfficialReplayPanelSuppression(idOrRecording);
      } else {
        clearOfficialReplayPanelSuppression();
      }

      void sdk
        .replay(idOrRecording)
        .then(() => {
          if (shouldClosePanelAfterStart) {
            sdk.close();
          }
        })
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
