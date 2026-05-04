import { CircleHelp } from "lucide-react";

export const faqItems = [
  {
    question: "What is FlowR?",
    answer:
      "FlowR is a browser extension for recording website walkthroughs and turning them into guided, replayable experiences that other people can follow on the live page.",
  },
  {
    question: "How does FlowR work?",
    answer:
      "Start a recording, move through the browser workflow you want to teach, and FlowR captures each step. The walkthrough can then be replayed with on-page highlights, tooltips, and step instructions.",
  },
  {
    question: "Who is FlowR for?",
    answer:
      "FlowR is built for product, customer success, support, operations, onboarding, and training teams that need to explain repeatable browser tasks clearly.",
  },
  {
    question: "What actions can FlowR record?",
    answer:
      "FlowR records common website interactions such as clicks, text input, page navigation, hover states, scrolling, and keyboard-driven steps.",
  },
  {
    question: "Can I replay walkthroughs on a live website?",
    answer:
      "Yes. FlowR replays the steps directly in the browser so guidance stays anchored to the actual interface people are using.",
  },
  {
    question: "Can I edit a walkthrough after recording it?",
    answer:
      "Yes. You can revise instructions, adjust steps, insert new ones, and keep a walkthrough current as the product or process changes.",
  },
  {
    question: "What happens when a website changes?",
    answer:
      "FlowR is designed for changing interfaces. You can repair or re-record individual steps instead of rebuilding the full walkthrough from the beginning.",
  },
  {
    question: "Can I share walkthroughs with my team?",
    answer:
      "Yes. Walkthroughs can be shared with teammates so they can be reviewed, reused, and distributed without repeating the explanation manually each time.",
  },
  {
    question: "Does FlowR support screenshots and exports?",
    answer:
      "Yes. FlowR supports optional screenshots for extra visual context and can export walkthrough material for handoffs or documentation.",
  },
  {
    question: "How does FlowR handle password fields?",
    answer:
      "FlowR treats password steps separately and avoids storing the actual password value, helping keep sensitive inputs out of recorded workflow data.",
  },
];

function elementId(prefix: string, value: string) {
  return `${prefix}-${value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export function Faq() {
  return (
    <section id="faq" className="flowr-faq-section bg-white py-24 sm:py-28">
      <div
        id="flowr-faq-container"
        className="flowr-faq-container mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div id="flowr-faq-copy" className="flowr-faq-copy">
          <p className="flowr-section-eyebrow flowr-faq-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
            FAQ
          </p>
          <h2
            id="flowr-faq-title"
            className="flowr-faq-title mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl"
          >
            Practical answers for browser workflow teams.
          </h2>
          <p
            id="flowr-faq-description"
            className="flowr-faq-description mt-5 text-lg leading-8 text-[#675f59]"
          >
            The short version: FlowR captures the work once, keeps the
            instructions on the real page, and gives teams a way to update the
            guide when the process changes.
          </p>
        </div>

        <div
          id="flowr-faq-list"
          className="flowr-faq-list divide-y divide-[#eadfd8] rounded-lg border border-[#eadfd8] bg-[#fffaf7]"
        >
          {faqItems.map((item) => (
            <details
              id={elementId("flowr-faq-item", item.question)}
              key={item.question}
              className="flowr-faq-item group p-5 open:bg-white"
            >
              <summary className="flowr-faq-question flex cursor-pointer list-none items-start justify-between gap-5 text-left text-base font-semibold text-[#201916] marker:hidden">
                <span className="flowr-faq-question-text flex gap-3">
                  <CircleHelp
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-[#7a263f]"
                  />
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className="flowr-faq-toggle mt-1 grid size-5 shrink-0 place-items-center text-[#7a263f] transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="flowr-faq-answer ml-8 mt-4 text-base leading-7 text-[#675f59]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
