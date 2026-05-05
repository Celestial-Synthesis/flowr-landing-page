"use client";

/**
 * PlaygroundShell
 *
 * Composition root for the /playground route. Manages:
 * - Extension detection (Chrome only)
 * - Mode selector: "local" (in-page SDK) vs "extension" (when installed)
 * - Recorder controls and saved recordings list
 * - Practice surfaces and official recording library
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import {
  detectFlowrExtension,
  type ExtensionDetectionResult,
} from "@/lib/flowr-extension";
import {
  useLocalRecorder,
  type RecorderHandle,
  type SavedRecording,
} from "@/components/playground/LocalRecorderLauncher";
import PlaygroundSurfaces from "@/components/playground/PlaygroundSurfaces";
import OfficialRecordingLibrary from "@/components/playground/OfficialRecordingLibrary";
import {
  chromeStoreUrl,
  contactUrl,
  firefoxStoreUrl,
} from "@/components/store-links";

type InstallStore = "chrome" | "firefox" | "safari";

function detectInstallStore(userAgent: string): InstallStore {
  if (/firefox|fxios/i.test(userAgent)) {
    return "firefox";
  }

  if (
    /safari/i.test(userAgent) &&
    !/chrome|chromium|crios|edg|opr|opera|fxios/i.test(userAgent)
  ) {
    return "safari";
  }

  return "chrome";
}

function getInstallStoreSnapshot(): InstallStore {
  return detectInstallStore(window.navigator.userAgent);
}

function getServerInstallStoreSnapshot(): InstallStore {
  return "chrome";
}

function subscribeToInstallStore() {
  return () => {};
}

function getInstallDetails(store: InstallStore) {
  if (store === "firefox") {
    return {
      href: firefoxStoreUrl,
      label: "Add FlowR to Firefox",
      ariaLabel: "Install FlowR from Mozilla Add-ons for Firefox",
    };
  }

  if (store === "safari") {
    return {
      href: contactUrl,
      label: "Safari coming soon",
      ariaLabel: "Safari support is coming soon for FlowR",
    };
  }

  return {
    href: chromeStoreUrl,
    label: "Add FlowR to Chrome",
    ariaLabel: "Install FlowR from the Chrome Web Store",
  };
}

/* ─── Extension status badge ─────────────────────────────────────────────── */

function ExtensionBadge({
  result,
  isChecking,
}: {
  result: ExtensionDetectionResult | null;
  isChecking: boolean;
}) {
  if (isChecking || !result) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eadfd8] px-3 py-1 text-xs font-medium text-[#5f5550]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c4b3ab]" />
        Checking extension…
      </span>
    );
  }

  const map: Record<string, { label: string; dot: string; badge: string }> = {
    installed: {
      label: "Extension installed",
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-800",
    },
    "not-installed": {
      label: "Extension not detected",
      dot: "bg-amber-400",
      badge: "bg-amber-50 text-amber-800",
    },
    unsupported: {
      label:
        result.browser === "firefox"
          ? "Firefox extension check unavailable"
          : result.browser === "safari"
            ? "Safari extension check unavailable"
            : "Extension check unavailable",
      dot: "bg-[#c4b3ab]",
      badge: "bg-[#eadfd8] text-[#5f5550]",
    },
    unknown: {
      label: "Extension status unknown",
      dot: "bg-[#c4b3ab]",
      badge: "bg-[#eadfd8] text-[#5f5550]",
    },
  };

  const cfg = map[result.status] ?? map["unknown"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {result.version && <span className="opacity-60">v{result.version}</span>}
    </span>
  );
}

/* ─── Recorder controls panel ─────────────────────────────────────────────── */

function RecorderControls({ handle }: { handle: RecorderHandle }) {
  const [newTitle, setNewTitle] = useState("");

  const statusLabel: Record<string, string> = {
    idle: "Loading recorder…",
    loading: "Loading recorder…",
    ready: "Ready",
    recording: "Recording…",
    error: "Error",
  };

  const isLoading = handle.status === "idle" || handle.status === "loading";
  const isReady = handle.status === "ready";
  const isRecording = handle.status === "recording";
  const isError = handle.status === "error";

  return (
    <section
      id="flowr-recorder-controls"
      data-testid="recorder-controls"
      aria-labelledby="flowr-recorder-controls-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="flowr-recorder-controls-heading"
          className="text-lg font-semibold text-[#201916]"
        >
          Recorder controls
        </h2>
        <span
          id="flowr-recorder-status"
          data-testid="recorder-status"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isRecording
              ? "bg-red-100 text-red-700"
              : isError
                ? "bg-red-50 text-red-600"
                : isLoading
                  ? "bg-[#eadfd8] text-[#5f5550]"
                  : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {isLoading && (
            <svg
              aria-hidden="true"
              className="mr-1 inline h-3 w-3 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          )}
          {statusLabel[handle.status] ?? handle.status}
        </span>
      </div>

      {isError && handle.errorMessage && (
        <p
          id="flowr-recorder-error"
          data-testid="recorder-error"
          className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {handle.errorMessage}
        </p>
      )}

      {/* Title input for new recordings */}
      <div className="mb-4">
        <label
          htmlFor="flowr-new-recording-title"
          className="mb-1 block text-xs font-medium text-[#5f5550]"
        >
          Recording title (optional)
        </label>
        <input
          id="flowr-new-recording-title"
          data-testid="new-recording-title"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="e.g. Form submit walkthrough"
          disabled={!isReady}
          className="w-full rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] placeholder:text-[#c4b3ab] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          id="flowr-btn-open-panel"
          data-testid="btn-open-panel"
          onClick={() => handle.open()}
          disabled={isLoading || isError}
          className="rounded-lg border border-[#eadfd8] bg-white px-4 py-2 text-sm font-medium text-[#201916] transition hover:bg-[#fbf8f5] disabled:opacity-40"
        >
          Open panel
        </button>

        <button
          id="flowr-btn-start"
          data-testid="btn-start"
          onClick={() => {
            handle.startRecording(newTitle || undefined);
            setNewTitle("");
          }}
          disabled={!isReady}
          className="rounded-lg bg-[#7a263f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#681f35] disabled:opacity-40"
        >
          Start recording
        </button>

        <button
          id="flowr-btn-stop"
          data-testid="btn-stop"
          onClick={() => handle.stopRecording()}
          disabled={!isRecording}
          className="rounded-lg bg-[#201916] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3a2a25] disabled:opacity-40"
        >
          Stop &amp; save
        </button>
      </div>
    </section>
  );
}

/* ─── Saved recordings list ───────────────────────────────────────────────── */

function SavedRecordingsList({ handle }: { handle: RecorderHandle }) {
  const { savedRecordings } = handle;

  if (savedRecordings.length === 0) {
    return (
      <section
        id="flowr-saved-recordings"
        data-testid="saved-recordings"
        className="rounded-xl border border-[#eadfd8] bg-white p-6"
      >
        <h2 className="mb-2 text-lg font-semibold text-[#201916]">
          My recordings
        </h2>
        <p className="text-sm text-[#5f5550]">
          No recordings yet. Start one above, interact with the practice
          surfaces below, then stop to save.
        </p>
      </section>
    );
  }

  return (
    <section
      id="flowr-saved-recordings"
      data-testid="saved-recordings"
      aria-labelledby="flowr-saved-recordings-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2
          id="flowr-saved-recordings-heading"
          className="text-lg font-semibold text-[#201916]"
        >
          My recordings{" "}
          <span className="ml-1 text-sm font-normal text-[#5f5550]">
            ({savedRecordings.length})
          </span>
        </h2>
        <button
          id="flowr-btn-clear-all"
          data-testid="btn-clear-all"
          onClick={() => {
            if (
              window.confirm(
                "Delete all saved recordings from this playground? This cannot be undone.",
              )
            ) {
              handle.clearAll();
            }
          }}
          className="text-xs text-red-600 underline hover:text-red-800"
        >
          Clear all
        </button>
      </div>

      <ul
        id="flowr-saved-recordings-list"
        data-testid="saved-recordings-list"
        className="divide-y divide-[#eadfd8]"
        role="list"
      >
        {savedRecordings.map((rec) => (
          <SavedRecordingRow key={rec.id} rec={rec} handle={handle} />
        ))}
      </ul>
    </section>
  );
}

function SavedRecordingRow({
  rec,
  handle,
}: {
  rec: SavedRecording;
  handle: RecorderHandle;
}) {
  const date = new Date(rec.createdAt).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <li
      id={`flowr-recording-row-${rec.id}`}
      data-testid={`recording-row-${rec.id}`}
      className="flex items-center justify-between gap-4 py-3"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#201916]">
          {rec.title || "Untitled recording"}
        </p>
        <p className="text-xs text-[#5f5550]">
          {rec.stepCount} step{rec.stepCount !== 1 ? "s" : ""} · {date}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          id={`flowr-btn-replay-${rec.id}`}
          data-testid={`btn-replay-${rec.id}`}
          onClick={() => handle.replayRecording(rec.id)}
          className="rounded-lg border border-[#eadfd8] bg-white px-3 py-1.5 text-xs font-medium text-[#201916] transition hover:bg-[#fbf8f5]"
        >
          ▶ Replay
        </button>
        <button
          id={`flowr-btn-delete-${rec.id}`}
          data-testid={`btn-delete-${rec.id}`}
          onClick={() => handle.deleteRecording(rec.id)}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

/* ─── Extension install nudge ─────────────────────────────────────────────── */

function ExtensionNudge() {
  const installStore = useSyncExternalStore(
    subscribeToInstallStore,
    getInstallStoreSnapshot,
    getServerInstallStoreSnapshot,
  );
  const installDetails = getInstallDetails(installStore);

  return (
    <div
      id="flowr-extension-nudge"
      data-testid="extension-nudge"
      className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm"
    >
      <p className="font-semibold text-amber-800 mb-1">
        Want richer recording features?
      </p>
      <p className="text-amber-700 mb-3">
        Install the FlowR browser extension to capture across any page, manage
        your library in the sidebar, and share recordings with your team.
      </p>
      <a
        id="flowr-nudge-install-link"
        data-testid="nudge-install-link"
        href={installDetails.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={installDetails.ariaLabel}
        className="inline-block rounded-lg bg-[#7a263f] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#681f35]"
      >
        {installDetails.label}
      </a>
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */

export default function PlaygroundShell() {
  const recorder = useLocalRecorder();
  const [extensionResult, setExtensionResult] =
    useState<ExtensionDetectionResult | null>(null);
  const [isCheckingExtension, setIsCheckingExtension] = useState(true);

  const runDetect = useCallback(async () => {
    setIsCheckingExtension(true);
    setExtensionResult(null);
    const result = await detectFlowrExtension();
    setExtensionResult(result);
    setIsCheckingExtension(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void detectFlowrExtension().then((result) => {
      if (!cancelled) {
        setExtensionResult(result);
        setIsCheckingExtension(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const extensionInstalled = extensionResult?.status === "installed";

  return (
    <div
      id="flowr-playground-shell"
      data-testid="playground-shell"
      className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20"
    >
      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ExtensionBadge
            result={extensionResult}
            isChecking={isCheckingExtension}
          />
          <button
            id="flowr-btn-recheck-extension"
            data-testid="btn-recheck-extension"
            onClick={runDetect}
            disabled={isCheckingExtension}
            className="text-xs text-[#7a263f] underline hover:text-[#681f35] disabled:cursor-wait disabled:opacity-50"
          >
            Re-check
          </button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#201916] sm:text-4xl">
          FlowR Playground
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#5f5550] leading-relaxed">
          Try FlowR without installing anything. Record interactions on the
          practice surfaces below, then replay them instantly. Your recordings
          are stored locally in this browser only.
        </p>

        {extensionInstalled && (
          <p className="mt-3 text-sm text-emerald-700 font-medium">
            ✓ FlowR extension detected — you can also use it directly on this
            page for the full experience.
          </p>
        )}
      </div>

      {/* Local SDK recorder */}
      <div className="flex flex-col gap-6">
        <RecorderControls handle={recorder} />
        <SavedRecordingsList handle={recorder} />
      </div>

      {!extensionInstalled && extensionResult !== null && (
        <div className="mt-6">
          <ExtensionNudge />
        </div>
      )}

      {/* Practice surfaces */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-semibold text-[#201916]">
          Practice surfaces
        </h2>
        <PlaygroundSurfaces />
      </div>

      {/* Official library */}
      <div className="mt-12">
        <OfficialRecordingLibrary recorder={recorder} />
      </div>
    </div>
  );
}
