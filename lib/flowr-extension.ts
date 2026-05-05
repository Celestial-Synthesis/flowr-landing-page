/**
 * Playground-side extension detection.
 *
 * Uses chrome.runtime.sendMessage with the known Chrome Web Store extension ID
 * to probe whether FlowR is installed in the current browser. Responds with a
 * structured status rather than throwing so callers can degrade gracefully.
 *
 * Chrome-compatible browsers only for now: Firefox and Safari do not expose the
 * same web-page-to-extension messaging channel here without additional setup.
 */

export type ExtensionProbeBrowser = "chrome" | "firefox" | "safari" | "other";

export type ExtensionDetectionStatus =
  | "installed"
  | "not-installed"
  | "unsupported"
  | "unknown";

export type ExtensionDetectionResult = {
  status: ExtensionDetectionStatus;
  browser: ExtensionProbeBrowser;
  version?: string;
  capabilities?: string[];
};

/**
 * Chrome extension ID derived from the Chrome Web Store URL.
 * "kajjcogpdapfeigbkcaoeihljpihjlie"
 */
const CHROME_EXTENSION_ID = "kajjcogpdapfeigbkcaoeihljpihjlie";
const PING_TIMEOUT_MS = 1_500;

export const detectExtensionProbeBrowser = (
  userAgent: string,
): ExtensionProbeBrowser => {
  if (/firefox|fxios/i.test(userAgent)) {
    return "firefox";
  }

  if (
    /safari/i.test(userAgent) &&
    !/chrome|chromium|crios|edg|opr|opera|fxios/i.test(userAgent)
  ) {
    return "safari";
  }

  if (/chrome|chromium|crios|edg|opr|opera/i.test(userAgent)) {
    return "chrome";
  }

  return "other";
};

const isChromeRuntimeAvailable = (): boolean => {
  return (
    typeof window !== "undefined" &&
    typeof (window as Window & { chrome?: { runtime?: unknown } }).chrome
      ?.runtime === "object" &&
    typeof (
      window as Window & { chrome?: { runtime?: { sendMessage?: unknown } } }
    ).chrome?.runtime?.sendMessage === "function"
  );
};

export async function detectFlowrExtension(): Promise<ExtensionDetectionResult> {
  if (typeof window === "undefined") {
    return { status: "unknown", browser: "other" };
  }

  const browser = detectExtensionProbeBrowser(window.navigator.userAgent);

  if (browser !== "chrome") {
    return { status: "unsupported", browser };
  }

  if (!isChromeRuntimeAvailable()) {
    return { status: "not-installed", browser };
  }

  const chromeRuntime = (
    window as unknown as {
      chrome: {
        runtime: {
          sendMessage: (
            extensionId: string,
            message: unknown,
            callback: (response: unknown) => void,
          ) => void;
          lastError?: { message?: string };
        };
      };
    }
  ).chrome.runtime;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ status: "unknown", browser });
    }, PING_TIMEOUT_MS);

    try {
      chromeRuntime.sendMessage(
        CHROME_EXTENSION_ID,
        { type: "flowr:ping" },
        (response) => {
          clearTimeout(timeout);

          // Chrome sets lastError when no extension responded.
          if (chromeRuntime.lastError || !response) {
            resolve({ status: "not-installed", browser });
            return;
          }

          const typed = response as {
            ok?: boolean;
            version?: string;
            capabilities?: string[];
          };

          if (!typed.ok) {
            resolve({ status: "not-installed", browser });
            return;
          }

          resolve({
            status: "installed",
            browser,
            version: typed.version,
            capabilities: typed.capabilities,
          });
        },
      );
    } catch {
      clearTimeout(timeout);
      resolve({ status: "not-installed", browser });
    }
  });
}
