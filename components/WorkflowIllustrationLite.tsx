import {
  FileText,
  MousePointerClick,
  PlayCircle,
  Share2,
  Wrench,
} from "lucide-react";

const steps = [
  {
    id: "capture",
    label: "01 Capture",
    title: "Record the browser workflow once",
    body: "FlowR captures clicks, text input, navigation context, and the structure of each step.",
    icon: MousePointerClick,
  },
  {
    id: "explain",
    label: "02 Explain",
    title: "Attach clear guidance",
    body: "Each step can include instruction copy that appears next to the target element during replay.",
    icon: FileText,
  },
  {
    id: "replay",
    label: "03 Replay",
    title: "Guide people on the live page",
    body: "Instead of scrubbing a video, users follow highlighted steps in the exact interface they use.",
    icon: PlayCircle,
  },
  {
    id: "repair",
    label: "04 Repair",
    title: "Fix only what changed",
    body: "When selectors drift, repair the affected step without rebuilding the entire walkthrough.",
    icon: Wrench,
  },
  {
    id: "share",
    label: "05 Share",
    title: "Publish for your team",
    body: "Share the maintained workflow from your library so onboarding and support stay consistent.",
    icon: Share2,
  },
];

export function WorkflowIllustrationLite() {
  return (
    <section
      id="workflow"
      className="flowr-workflow-lite-section bg-[#fffaf7] py-24 sm:py-28"
    >
      <div className="flowr-workflow-lite-container mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flowr-workflow-lite-header mx-auto max-w-3xl text-center">
          <p className="flowr-section-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
            Record and replay
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl">
            One workflow, from first capture to team handoff.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#675f59]">
            FlowR stores the process as structured steps, so teams can replay,
            maintain, and share guidance without rerecording a full demo video.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.id}
                className="flowr-workflow-lite-card rounded-lg border border-[#eadfd8] bg-white p-5 shadow-sm"
              >
                <div className="mb-7 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#7a263f]">
                    {step.label}
                  </p>
                  <div className="grid size-10 place-items-center rounded-md bg-[#fff0ea] text-[#7a263f]">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-[#201916]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#675f59]">
                  {step.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
