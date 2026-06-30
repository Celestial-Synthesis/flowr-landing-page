"use client";

/**
 * OfficialRecordingLibrary
 *
 * Token-backed public recording library for the playground.
 * Uses the FlowR publishable key to list public SDK recordings, then replays
 * the selected recording with the local recorder/replay bubble.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { RecorderHandle } from "@/components/playground/LocalRecorderLauncher";
import {
  fetchOfficialRecordings,
  getOfficialRecordingsCacheServerSnapshot,
  getOfficialRecordingsCacheSnapshot,
  officialRecordingsConfig,
  playgroundOfficialRecordingTargetUrl,
  subscribeToOfficialRecordingsCache,
  type OfficialRecordingEntry,
  type OfficialRecordingListResult,
} from "@/lib/playground-official-recordings";

type LoadStatus =
  | "missing-token"
  | "pending"
  | "loading"
  | "ready"
  | "empty"
  | "error";

const formatRecordingDate = (updatedAt: number): string =>
  new Date(updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const resolveErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : "Failed to load official recordings.";

const sortOfficialRecordingsOldestFirst = (
  entries: OfficialRecordingEntry[],
): OfficialRecordingEntry[] =>
  [...entries].sort((a, b) => {
    const aCreatedAt = a.recording.createdAt || a.updatedAt;
    const bCreatedAt = b.recording.createdAt || b.updatedAt;

    return (
      aCreatedAt - bCreatedAt ||
      a.updatedAt - b.updatedAt ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id)
    );
  });

const deriveLoadStatus = ({
  hasToken,
  activeResult,
  fetchState,
}: {
  hasToken: boolean;
  activeResult: OfficialRecordingListResult | null;
  fetchState: "idle" | "loading" | "done" | "error";
}): LoadStatus => {
  if (!hasToken) {
    return "missing-token";
  }

  if (activeResult) {
    return activeResult.recordings.length > 0 ? "ready" : "empty";
  }

  if (fetchState === "error") {
    return "error";
  }

  if (fetchState === "loading") {
    return "loading";
  }

  return "pending";
};

export default function OfficialRecordingLibrary({
  recorder,
}: {
  recorder: RecorderHandle;
}) {
  const hasToken = Boolean(officialRecordingsConfig.publishableToken);
  const cachedResult = useSyncExternalStore(
    subscribeToOfficialRecordingsCache,
    getOfficialRecordingsCacheSnapshot,
    getOfficialRecordingsCacheServerSnapshot,
  );
  const [fetchedResult, setFetchedResult] =
    useState<OfficialRecordingListResult | null>(null);
  const [fetchState, setFetchState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const canReplay = recorder.status === "ready";

  const activeResult = fetchedResult ?? cachedResult;
  const recordings = useMemo(
    () => sortOfficialRecordingsOldestFirst(activeResult?.recordings ?? []),
    [activeResult],
  );
  const nextCursor = fetchedResult?.nextCursor ?? cachedResult?.nextCursor;
  const status = deriveLoadStatus({ hasToken, activeResult, fetchState });

  useEffect(() => {
    let cancelled = false;
    if (!hasToken) {
      return;
    }

    void (async () => {
      if (!cachedResult) {
        setFetchState("loading");
      }

      try {
        const result = await fetchOfficialRecordings({
          targetUrl: playgroundOfficialRecordingTargetUrl,
        });
        if (cancelled) {
          return;
        }
        setFetchedResult(result);
        setFetchState("done");
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }
        if (cachedResult?.recordings.length) {
          setFetchState("done");
          return;
        }
        setErrorMessage(resolveErrorMessage(error));
        setFetchState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cachedResult, hasToken]);

  const reload = useCallback(() => {
    if (!hasToken) {
      return;
    }

    setFetchState("loading");
    setErrorMessage(null);
    setFetchedResult(null);

    void fetchOfficialRecordings({
      targetUrl: playgroundOfficialRecordingTargetUrl,
    })
      .then((result) => {
        setFetchedResult(result);
        setFetchState("done");
      })
      .catch((error: unknown) => {
        setErrorMessage(resolveErrorMessage(error));
        setFetchState("error");
      });
  }, [hasToken]);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setErrorMessage(null);

    void fetchOfficialRecordings({
      cursor: nextCursor,
      targetUrl: playgroundOfficialRecordingTargetUrl,
    })
      .then((result) => {
        setFetchedResult((current) => {
          const merged = sortOfficialRecordingsOldestFirst([
            ...(current?.recordings ?? cachedResult?.recordings ?? []),
            ...result.recordings,
          ]);
          return {
            recordings: merged,
            ...(result.nextCursor ? { nextCursor: result.nextCursor } : {}),
          };
        });
        setFetchState("done");
      })
      .catch((error: unknown) => {
        setErrorMessage(resolveErrorMessage(error));
        setFetchState("error");
      })
      .finally(() => setIsLoadingMore(false));
  }, [cachedResult?.recordings, isLoadingMore, nextCursor]);

  return (
    <section
      id="flowr-official-library"
      data-testid="official-library"
      aria-labelledby="flowr-official-library-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <div className="mb-6">
        <div>
          <h2
            id="flowr-official-library-heading"
            className="text-lg font-semibold text-[#201916]"
          >
            Start with a guided demo
          </h2>
          <p className="mt-1 text-sm text-[#5f5550]">
            Replay guided demos from the FlowR team so you can experience the
            FlowR walkthrough before recording one yourself.
          </p>
        </div>
      </div>

      {status === "missing-token" && (
        <div
          id="flowr-official-token-missing"
          data-testid="official-token-missing"
          className="rounded-lg border border-[#bfdbcf] bg-[#f0f7f4] p-4 text-sm text-[#365f4b]"
        >
          <p className="font-semibold">Publishable token required</p>
          <p className="mt-1 leading-relaxed">
            Set NEXT_PUBLIC_FLOWR_PUBLISHABLE_TOKEN or
            NEXT_PUBLIC_FLOWR_API_KEY, then rebuild the site to load guided
            demos.
          </p>
        </div>
      )}

      {status === "loading" && (
        <p
          id="flowr-official-loading"
          data-testid="official-loading"
          className="rounded-lg border border-[#eadfd8] bg-[#fbf8f5] p-4 text-sm text-[#5f5550]"
        >
          Loading guided demos…
        </p>
      )}

      {status === "empty" && (
        <p
          id="flowr-official-empty"
          data-testid="official-empty"
          className="rounded-lg border border-[#eadfd8] bg-[#fbf8f5] p-4 text-sm text-[#5f5550]"
        >
          No guided demos match this playground yet.
        </p>
      )}

      {status === "error" && (
        <div
          id="flowr-official-error"
          data-testid="official-error"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-semibold">Unable to load guided demos</p>
          <p className="mt-1">{errorMessage}</p>
          <button
            id="flowr-official-retry"
            data-testid="official-retry"
            type="button"
            onClick={reload}
            className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {recordings.length > 0 && (
        <>
          <ul
            id="flowr-official-library-list"
            data-testid="official-library-list"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            role="list"
          >
            {recordings.map((entry) => {
              const replayDisabled = !canReplay || entry.stepCount === 0;

              return (
                <li
                  key={entry.id}
                  id={`flowr-official-card-${entry.id}`}
                  data-testid={`official-card-${entry.id}`}
                >
                  <div className="flex h-full flex-col justify-between rounded-lg border border-[#eadfd8] bg-[#fbf8f5] p-4">
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-[#201916]">
                          {entry.title}
                        </p>
                        <span className="mt-0.5 shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                          Ready
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#5f5550]">
                        {entry.description}
                      </p>
                      <p className="mt-2 text-xs text-[#5f5550]">
                        {entry.stepCount} step{entry.stepCount === 1 ? "" : "s"}{" "}
                        · Updated {formatRecordingDate(entry.updatedAt)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <button
                        id={`flowr-official-replay-${entry.id}`}
                        data-testid={`official-replay-${entry.id}`}
                        type="button"
                        disabled={replayDisabled}
                        aria-disabled={replayDisabled}
                        title={
                          entry.stepCount === 0
                            ? "This recording has no steps"
                            : canReplay
                              ? "Replay this recording"
                              : "Recorder is not ready yet"
                        }
                        onClick={() =>
                          recorder.replayRecording(entry.recording)
                        }
                        className="w-full rounded-lg border border-[#eadfd8] bg-white px-4 py-2 text-sm font-medium text-[#201916] transition hover:bg-white disabled:cursor-not-allowed disabled:text-[#c4b3ab]"
                      >
                        ▶ Replay
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {nextCursor && (
            <div className="mt-4 flex justify-center">
              <button
                id="flowr-official-load-more"
                data-testid="official-load-more"
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="rounded-lg border border-[#eadfd8] bg-white px-4 py-2 text-sm font-semibold text-[#201916] transition hover:bg-[#fbf8f5] disabled:cursor-wait disabled:opacity-50"
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
