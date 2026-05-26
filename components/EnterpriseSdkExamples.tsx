"use client";

import { useState } from "react";

type SdkExampleTab = {
  id: "recorder" | "replay";
  label: string;
  summary: string;
  badge: string;
  code: string;
  note: string;
};

const sdkExampleTabs: SdkExampleTab[] = [
  {
    id: "recorder",
    label: "Recorder SDK",
    summary:
      "Open the recorder from your own product controls while keeping the FlowR recorder handle in app code.",
    badge: "Host-controlled",
    code: `<button id="openRecorder">Open recorder</button>

<script type="module">
  import { recorder } from "https://cdn.jsdelivr.net/gh/Celestial-Synthesis/flowr-web-sdk@sdk_v0.1.0/sdk-recorder/dist/index.js";

  const recorderHandle = recorder({
    baseUrl: "https://flowr-api-demo.example",
    apiKey: "flowr_pk_live_...",
    screenshots: false,
  });

  document.querySelector("#openRecorder")?.addEventListener("click", () => {
    recorderHandle.open();
  });
</script>`,
    note: "Use the recorder entrypoint when your app decides when recording starts and how the launcher fits into your own onboarding or support UI.",
  },
  {
    id: "replay",
    label: "Replay SDK",
    summary:
      "Look up a recording with a title filter, set it on the replay handle, and start replay from your own UI.",
    badge: "Search filter",
    code: `<button id="startReplay">Start replay</button>

<script type="module">
  import { replay } from "https://cdn.jsdelivr.net/gh/Celestial-Synthesis/flowr-web-sdk@sdk_v0.1.0/sdk-replay/dist/index.js";

  const replayHandle = replay({
    baseUrl: "https://flowr-api-demo.example",
    apiKey: "flowr_pk_live_...",
    uiMode: "custom",
    lazy: true,
  });

  document.querySelector("#startReplay")?.addEventListener("click", async () => {
    const firstPage = await replayHandle.listRecordings({
      limit: 10,
      title: "checkout",
    });

    const recording = firstPage.recordings[0];

    if (recording) {
      replayHandle.setRecording(recording);
      await replayHandle.start();
    }
  });
</script>`,
    note: "Use title filters when your host app already knows the workflow family it wants to surface and needs a quick public-recording lookup.",
  },
];

export function EnterpriseSdkExamples() {
  const [activeTab, setActiveTab] = useState<SdkExampleTab["id"]>("recorder");
  const activeExample =
    sdkExampleTabs.find((tab) => tab.id === activeTab) ?? sdkExampleTabs[0];

  return (
    <div
      id="flowr-enterprise-sdk-example"
      className="flowr-enterprise-sdk-example overflow-hidden rounded-[32px] border border-[#201916]/10 bg-[#201916] text-white shadow-[0_24px_80px_rgba(32,25,22,0.18)]"
    >
      <div className="flowr-enterprise-sdk-example-header flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f2b9ca]">
            Public SDK examples
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Separate recorder and replay examples based on the public FlowR web
            SDK docs.
          </p>
        </div>
        <div className="inline-flex min-h-11 items-center justify-center self-start whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase leading-none tracking-[0.1em] text-white/75 sm:self-auto">
          Enterprise
        </div>
      </div>

      <div className="flowr-enterprise-sdk-example-body px-5 py-5 sm:px-6">
        <div className="inline-flex w-full rounded-2xl border border-white/10 bg-white/5 p-1 sm:w-auto">
          {sdkExampleTabs.map((tab) => {
            const isActive = tab.id === activeExample.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-10 flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  isActive
                    ? "bg-white text-[#201916] shadow-sm"
                    : "text-white/72 hover:bg-white/8 hover:text-white"
                }`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {activeExample.label}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                {activeExample.summary}
              </p>
            </div>
            <div className="inline-flex min-h-11 shrink-0 items-center justify-center self-start whitespace-nowrap rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase leading-none tracking-[0.1em] text-[#f2b9ca]">
              {activeExample.badge}
            </div>
          </div>

          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/8 bg-black/30 p-4 text-[13px] leading-6 text-[#f8efe9] sm:p-5 sm:text-sm">
            <code>{activeExample.code}</code>
          </pre>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/75 sm:px-5">
          {activeExample.note}
        </div>
      </div>
    </div>
  );
}
