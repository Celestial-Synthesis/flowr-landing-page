import { siteUrl } from "@/lib/site";

const DEFAULT_FLOWR_API_BASE_URL = "https://rfeiamxssoajeabwyean.supabase.co";
const DEFAULT_FILTERED_SCAN_PAGE_LIMIT = 50;
const RECORDINGS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OFFICIAL_RECORDINGS_STORAGE_KEY =
  "flowr-playground:official-recordings-cache:v1";

type RecordingsCacheEntry = {
  result: OfficialRecordingListResult;
  expiresAt: number;
};

type PersistedRecordingsCacheEntry = {
  cacheKey: string;
  expiresAt: number;
  result: OfficialRecordingListResult;
};

const recordingsCache = new Map<string, RecordingsCacheEntry>();

const getBrowserStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readPersistedRecordingsCache = (
  cacheKey: string,
): OfficialRecordingListResult | null => {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(OFFICIAL_RECORDINGS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedRecordingsCacheEntry;
    if (
      !parsed ||
      parsed.cacheKey !== cacheKey ||
      typeof parsed.expiresAt !== "number" ||
      Date.now() >= parsed.expiresAt ||
      !parsed.result ||
      !Array.isArray(parsed.result.recordings)
    ) {
      return null;
    }

    return parsed.result;
  } catch {
    return null;
  }
};

const writePersistedRecordingsCache = (
  cacheKey: string,
  result: OfficialRecordingListResult,
): void => {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  try {
    const payload: PersistedRecordingsCacheEntry = {
      cacheKey,
      expiresAt: Date.now() + RECORDINGS_CACHE_TTL_MS,
      result,
    };
    storage.setItem(OFFICIAL_RECORDINGS_STORAGE_KEY, JSON.stringify(payload));
    notifyOfficialRecordingsCacheListeners();
  } catch {
    /* ignore quota / privacy mode failures */
  }
};

function makeRecordingsCacheKey(
  limit: number,
  cursor: string | undefined,
  targetUrl: string | undefined,
): string {
  return JSON.stringify({
    limit,
    cursor: cursor ?? null,
    targetUrl: targetUrl ?? null,
  });
}



const officialRecordingsCacheListeners = new Set<() => void>();

const notifyOfficialRecordingsCacheListeners = (): void => {
  officialRecordingsCacheListeners.forEach((listener) => listener());
};

export const subscribeToOfficialRecordingsCache = (
  listener: () => void,
): (() => void) => {
  officialRecordingsCacheListeners.add(listener);
  return () => {
    officialRecordingsCacheListeners.delete(listener);
  };
};

export const getOfficialRecordingsCacheSnapshot = (
  targetUrl: string = playgroundOfficialRecordingTargetUrl,
): OfficialRecordingListResult | null =>
  readCachedOfficialRecordings({ targetUrl });

export const getOfficialRecordingsCacheServerSnapshot =
  (): OfficialRecordingListResult | null => null;

export function readCachedOfficialRecordings({
  limit = 12,
  cursor,
  targetUrl,
}: Pick<FetchOfficialRecordingsOptions, "limit" | "cursor" | "targetUrl"> = {}):
  | OfficialRecordingListResult
  | null {
  const cacheKey = makeRecordingsCacheKey(limit, cursor, targetUrl);
  const cached = recordingsCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }

  return readPersistedRecordingsCache(cacheKey);
}


export type FlowrSelectorInfo = {
  css: string;
  xpath?: string;
  attributes?: string[];
};

export type FlowrStep = {
  id: string;
  kind: string;
  url?: string;
  selector?: FlowrSelectorInfo;
  value?: string;
  textContent?: string;
  instruction?: string;
  localizedInstructions?: Record<string, string>;
  screenshotDataUrl?: string;
  screenshotUrl?: string;
  timestamp?: number;
  skipCondition?: unknown;
  metadata?: Record<string, unknown>;
};

export type OfficialRecording = {
  id: string;
  title: string;
  startUrl: string;
  steps: FlowrStep[];
  createdAt: number;
  updatedAt: number;
  visibility?: "private" | "public";
  ownerId?: string;
  schemaVersion?: number;
  isOverLimit?: boolean;
};

export type OfficialRecordingEntry = {
  id: string;
  title: string;
  description: string;
  stepCount: number;
  status: "available";
  targetUrl?: string;
  updatedAt: number;
  recording: OfficialRecording;
};

export type OfficialRecordingListResult = {
  recordings: OfficialRecordingEntry[];
  nextCursor?: string;
};

type FetchOfficialRecordingsOptions = {
  limit?: number;
  cursor?: string;
  targetUrl?: string;
  maxScanPages?: number;
  fetchImpl?: typeof fetch;
};

export const playgroundOfficialRecordingTargetUrl = new URL(
  "/playground",
  siteUrl,
).toString();

export const officialRecordingsConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_FLOWR_API_BASE_URL?.trim() ||
    DEFAULT_FLOWR_API_BASE_URL,
  publishableToken:
    process.env.NEXT_PUBLIC_FLOWR_PUBLISHABLE_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_FLOWR_API_KEY?.trim() ||
    "",
};

const normalizeTimestamp = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return Math.round(numeric);
    }

    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const parseHttpUrl = (value: string, base?: string): URL | null => {
  try {
    const url = base ? new URL(value, base) : new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

const normalizePathname = (pathname: string): string => {
  const normalized = pathname.replace(/\/+$/g, "");
  return normalized || "/";
};

export const isOfficialRecordingForTargetUrl = (
  recording: Pick<OfficialRecording, "startUrl">,
  targetUrl: string,
): boolean => {
  if (!recording.startUrl) return false;

  const target = parseHttpUrl(targetUrl);
  if (!target) return false;

  const recordingUrl = parseHttpUrl(recording.startUrl, target.href);
  if (!recordingUrl) return false;

  return (
    recordingUrl.origin === target.origin &&
    normalizePathname(recordingUrl.pathname) ===
      normalizePathname(target.pathname)
  );
};

const normalizeRecording = (candidate: unknown): OfficialRecording | null => {
  const row = asRecord(candidate);
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;

  const createdAt = normalizeTimestamp(
    row.createdAt ?? row.created_at,
    Date.now(),
  );
  const updatedAt = normalizeTimestamp(
    row.updatedAt ?? row.updated_at,
    createdAt,
  );
  const ownerId =
    typeof row.ownerId === "string"
      ? row.ownerId
      : typeof row.user_id === "string"
        ? row.user_id
        : undefined;
  const schemaVersion =
    typeof row.schemaVersion === "number"
      ? row.schemaVersion
      : typeof row.schema_version === "number"
        ? row.schema_version
        : undefined;

  return {
    id,
    title: typeof row.title === "string" ? row.title : "Untitled walkthrough",
    startUrl:
      typeof row.startUrl === "string"
        ? row.startUrl
        : typeof row.start_url === "string"
          ? row.start_url
          : "",
    steps: Array.isArray(row.steps) ? (row.steps as FlowrStep[]) : [],
    createdAt,
    updatedAt,
    visibility: row.visibility === "public" ? "public" : "private",
    ...(ownerId ? { ownerId } : {}),
    ...(schemaVersion !== undefined ? { schemaVersion } : {}),
    ...(typeof row.isOverLimit === "boolean"
      ? { isOverLimit: row.isOverLimit }
      : typeof row.is_over_limit === "boolean"
        ? { isOverLimit: row.is_over_limit }
        : {}),
  };
};

const describeRecording = (recording: OfficialRecording): string => {
  if (!recording.startUrl) {
    return "Published public FlowR recording.";
  }

  try {
    return `Published public recording for ${new URL(recording.startUrl).hostname}.`;
  } catch {
    return "Published public FlowR recording.";
  }
};

const toOfficialRecordingEntry = (
  recording: OfficialRecording,
): OfficialRecordingEntry => ({
  id: recording.id,
  title: recording.title || "Untitled walkthrough",
  description: describeRecording(recording),
  stepCount: recording.steps.length,
  status: "available",
  targetUrl: recording.startUrl || undefined,
  updatedAt: recording.updatedAt,
  recording,
});

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as {
      error?: string;
      message?: string;
    };
    return body.message || body.error || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

export async function fetchOfficialRecordings({
  limit = 12,
  cursor,
  targetUrl,
  maxScanPages = DEFAULT_FILTERED_SCAN_PAGE_LIMIT,
  fetchImpl = fetch,
}: FetchOfficialRecordingsOptions = {}): Promise<OfficialRecordingListResult> {
  const publishableToken = officialRecordingsConfig.publishableToken;
  if (!publishableToken) {
    throw new Error("FlowR publishable token is not configured.");
  }

  const cacheKey = makeRecordingsCacheKey(limit, cursor, targetUrl);
  const cached = recordingsCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }

  const persisted = readPersistedRecordingsCache(cacheKey);
  if (persisted) {
    recordingsCache.set(cacheKey, {
      result: persisted,
      expiresAt: Date.now() + RECORDINGS_CACHE_TTL_MS,
    });
    return persisted;
  }

  const recordings: OfficialRecordingEntry[] = [];
  let nextCursor: string | undefined = cursor;
  let scannedPageCount = 0;

  do {
    const url = new URL(
      "/functions/v1/sdk-recording-list",
      officialRecordingsConfig.baseUrl,
    );
    url.searchParams.set("visibility", "public");
    url.searchParams.set("limit", String(limit));
    if (targetUrl) {
      url.searchParams.set("url", targetUrl);
    }
    if (nextCursor) {
      url.searchParams.set("cursor", nextCursor);
    }

    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-flowr-api-key": publishableToken,
        "x-flowr-sdk": "1",
      },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const body = (await response.json()) as {
      recordings?: unknown[];
      nextCursor?: string;
      next_cursor?: string;
    };

    const pageRecordings = Array.isArray(body.recordings)
      ? body.recordings
          .map(normalizeRecording)
          .filter((recording): recording is OfficialRecording => {
            if (!recording) return false;
            return (
              !targetUrl ||
              isOfficialRecordingForTargetUrl(recording, targetUrl)
            );
          })
          .map(toOfficialRecordingEntry)
      : [];

    recordings.push(...pageRecordings);
    nextCursor =
      typeof body.nextCursor === "string"
        ? body.nextCursor
        : typeof body.next_cursor === "string"
          ? body.next_cursor
          : undefined;
    scannedPageCount += 1;
  } while (
    targetUrl &&
    recordings.length === 0 &&
    nextCursor &&
    scannedPageCount < maxScanPages
  );

  const result: OfficialRecordingListResult = {
    recordings,
    ...(nextCursor ? { nextCursor } : {}),
  };

  recordingsCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + RECORDINGS_CACHE_TTL_MS,
  });
  writePersistedRecordingsCache(cacheKey, result);

  return result;
}
