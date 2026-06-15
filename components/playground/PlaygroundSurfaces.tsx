"use client";

/**
 * PlaygroundSurfaces
 *
 * A rich set of interactive DOM elements for practicing workflow recording and
 * replay. Every interactive element has a stable `id` and `data-testid` attribute
 * so FlowR can build high-quality selectors.
 */

import {
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function SectionHeading({
  id,
  number,
  title,
  hint,
}: {
  id?: string;
  number: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#7a263f] text-xs font-bold text-white">
          {number}
        </span>
        <h3 id={id} className="text-base font-semibold text-[#201916]">
          {title}
        </h3>
      </div>
      <p className="text-sm text-[#5f5550]">{hint}</p>
    </div>
  );
}

function InstructionHint({ id, children }: { id?: string; children: string }) {
  return (
    <p
      id={id}
      className="mt-2 rounded-lg border border-[#bfdbcf] bg-[#f0f7f4] px-3 py-2 text-xs leading-relaxed text-[#365f4b]"
    >
      {children}
    </p>
  );
}

const clampNumber = (value: number, min: number, max: number) =>
  max <= min ? min : Math.min(Math.max(value, min), max);

const CONDITIONAL_PANEL_STORAGE_KEY =
  "flowr-playground:conditional-panel-visible";
const CONDITIONAL_PANEL_STORAGE_EVENT =
  "flowr-playground:conditional-panel-visible-change";

let conditionalPanelVisibilityFallback = false;

const readConditionalPanelVisibility = () => {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(CONDITIONAL_PANEL_STORAGE_KEY) === "true"
    );
  } catch {
    return conditionalPanelVisibilityFallback;
  }
};

const subscribeToConditionalPanelVisibility = (listener: () => void) => {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONDITIONAL_PANEL_STORAGE_KEY) listener();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CONDITIONAL_PANEL_STORAGE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CONDITIONAL_PANEL_STORAGE_EVENT, listener);
  };
};

const writeConditionalPanelVisibility = (isVisible: boolean) => {
  conditionalPanelVisibilityFallback = isVisible;

  try {
    window.localStorage.setItem(
      CONDITIONAL_PANEL_STORAGE_KEY,
      String(isVisible),
    );
  } catch {}

  window.dispatchEvent(new Event(CONDITIONAL_PANEL_STORAGE_EVENT));
};

/* ─── 1. Button bank ───────────────────────────────────────────────────────── */

function ButtonBank() {
  const [counts, setCounts] = useState({ primary: 0, secondary: 0, danger: 0 });

  return (
    <section
      id="flowr-surface-buttons"
      data-testid="surface-buttons"
      aria-labelledby="flowr-surface-buttons-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-buttons-heading"
        number="A"
        title="Button interactions"
        hint="Click each button and watch the counter update. Replay should reproduce the clicks in the same order."
      />
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex flex-col items-center gap-1">
          <button
            id="flowr-btn-primary"
            data-testid="btn-primary"
            onClick={() => setCounts((c) => ({ ...c, primary: c.primary + 1 }))}
            className="rounded-lg bg-[#7a263f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#681f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
          >
            Primary action
          </button>
          {counts.primary > 0 && (
            <span
              data-testid="btn-primary-count"
              className="text-xs text-[#5f5550]"
            >
              ×{counts.primary}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            id="flowr-btn-secondary"
            data-testid="btn-secondary"
            onClick={() =>
              setCounts((c) => ({ ...c, secondary: c.secondary + 1 }))
            }
            className="rounded-lg border border-[#eadfd8] bg-white px-5 py-2.5 text-sm font-medium text-[#201916] transition hover:bg-[#fbf8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
          >
            Secondary action
          </button>
          {counts.secondary > 0 && (
            <span
              data-testid="btn-secondary-count"
              className="text-xs text-[#5f5550]"
            >
              ×{counts.secondary}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            id="flowr-btn-danger"
            data-testid="btn-danger"
            onClick={() => setCounts((c) => ({ ...c, danger: c.danger + 1 }))}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Danger zone
          </button>
          {counts.danger > 0 && (
            <span
              data-testid="btn-danger-count"
              className="text-xs text-[#5f5550]"
            >
              ×{counts.danger}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── 2. Form lab ─────────────────────────────────────────────────────────── */

type FormValues = {
  name: string;
  email: string;
  role: string;
  subscribe: boolean;
  plan: string;
  notes: string;
};

const DEFAULT_FORM: FormValues = {
  name: "",
  email: "",
  role: "",
  subscribe: false,
  plan: "free",
  notes: "",
};

function FormLab() {
  const [values, setValues] = useState<FormValues>(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormValues>(key: K, val: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setValues(DEFAULT_FORM);
    setSubmitted(false);
  };

  return (
    <section
      id="flowr-surface-form"
      data-testid="surface-form"
      aria-labelledby="flowr-surface-form-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-form-heading"
        number="B"
        title="Form lab"
        hint="Fill in the fields, choose options, and submit. Use the Reset button to restore the blank state for a clean replay."
      />

      {submitted ? (
        <div
          id="flowr-form-success"
          data-testid="form-success"
          className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800"
        >
          <p className="font-semibold mb-1">Form submitted ✓</p>
          <p>
            Name: <strong>{values.name || "(empty)"}</strong> · Email:{" "}
            <strong>{values.email || "(empty)"}</strong> · Plan:{" "}
            <strong>{values.plan}</strong>
          </p>
          <button
            id="flowr-form-reset-success"
            data-testid="form-reset-success"
            onClick={handleReset}
            className="mt-3 text-xs underline text-emerald-700 hover:text-emerald-900"
          >
            Reset form
          </button>
        </div>
      ) : (
        <form
          id="flowr-form"
          data-testid="form"
          onSubmit={handleSubmit}
          onReset={handleReset}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="flowr-input-name"
              className="text-xs font-medium text-[#5f5550]"
            >
              Full name
            </label>
            <input
              id="flowr-input-name"
              data-testid="input-name"
              type="text"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jane Smith"
              className="rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] placeholder:text-[#c4b3ab] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="flowr-input-email"
              className="text-xs font-medium text-[#5f5550]"
            >
              Email address
            </label>
            <input
              id="flowr-input-email"
              data-testid="input-email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@example.com"
              className="rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] placeholder:text-[#c4b3ab] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30"
            />
          </div>

          {/* Role select */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="flowr-input-role"
              className="text-xs font-medium text-[#5f5550]"
            >
              Role
            </label>
            <select
              id="flowr-input-role"
              data-testid="input-role"
              aria-describedby="flowr-role-instruction-hint"
              value={values.role}
              onChange={(e) => set("role", e.target.value)}
              className="rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30"
            >
              <option value="">Choose a role…</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="qa">QA / Tester</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </select>
            <InstructionHint id="flowr-role-instruction-hint">
              While recording, right-click this dropdown and choose Add
              instruction to explain which role should be selected.
            </InstructionHint>
          </div>

          {/* Textarea */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label
              htmlFor="flowr-input-notes"
              className="text-xs font-medium text-[#5f5550]"
            >
              Notes
            </label>
            <textarea
              id="flowr-input-notes"
              data-testid="input-notes"
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything you'd like to say…"
              className="rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] placeholder:text-[#c4b3ab] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30 resize-y"
            />
          </div>

          {/* Radio plan */}
          <fieldset
            className="flex flex-col gap-2 sm:col-span-2"
            aria-describedby="flowr-plan-instruction-hint"
          >
            <legend className="text-xs font-medium text-[#5f5550]">Plan</legend>
            <div className="flex flex-wrap gap-4">
              {(["free", "pro", "team"] as const).map((plan) => (
                <label
                  key={plan}
                  htmlFor={`flowr-radio-plan-${plan}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    id={`flowr-radio-plan-${plan}`}
                    data-testid={`radio-plan-${plan}`}
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={values.plan === plan}
                    onChange={() => set("plan", plan)}
                    className="accent-[#7a263f]"
                  />
                  <span className="text-sm capitalize text-[#201916]">
                    {plan}
                  </span>
                </label>
              ))}
            </div>
            <InstructionHint id="flowr-plan-instruction-hint">
              Right-click a radio option while recording to add an instruction
              before selecting the plan.
            </InstructionHint>
          </fieldset>

          {/* Checkbox */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <input
                id="flowr-input-subscribe"
                data-testid="input-subscribe"
                aria-describedby="flowr-subscribe-instruction-hint"
                type="checkbox"
                checked={values.subscribe}
                onChange={(e) => set("subscribe", e.target.checked)}
                className="accent-[#7a263f] h-4 w-4"
              />
              <label
                htmlFor="flowr-input-subscribe"
                className="text-sm text-[#201916]"
              >
                Subscribe to FlowR updates
              </label>
            </div>
            <InstructionHint id="flowr-subscribe-instruction-hint">
              Right-click the checkbox while recording to add context before
              toggling it.
            </InstructionHint>
          </div>

          {/* Actions */}
          <div className="flex gap-3 sm:col-span-2">
            <button
              id="flowr-form-submit"
              data-testid="form-submit"
              type="submit"
              className="rounded-lg bg-[#7a263f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#681f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
            >
              Submit
            </button>
            <button
              id="flowr-form-reset"
              data-testid="form-reset"
              type="reset"
              className="rounded-lg border border-[#eadfd8] bg-white px-5 py-2.5 text-sm font-medium text-[#201916] transition hover:bg-[#fbf8f5]"
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/* ─── 3. Keyboard and secure inputs ───────────────────────────────────────── */

type KeyboardValues = {
  username: string;
  password: string;
  accessCode: string;
};

const DEFAULT_KEYBOARD_VALUES: KeyboardValues = {
  username: "",
  password: "",
  accessCode: "",
};

function KeyboardPasswordLab() {
  const [values, setValues] = useState<KeyboardValues>(DEFAULT_KEYBOARD_VALUES);
  const [lastKeyboardStep, setLastKeyboardStep] = useState(
    "No keyboard step yet",
  );
  const [submitted, setSubmitted] = useState(false);

  const setKeyboardValue = <K extends keyof KeyboardValues>(
    key: K,
    value: KeyboardValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Tab" && event.shiftKey) {
      setLastKeyboardStep("Shift+Tab moved focus backward");
      return;
    }
    if (event.key === "Tab") {
      setLastKeyboardStep("Tab moved focus forward");
      return;
    }
    if (event.key === "Enter") {
      setLastKeyboardStep("Enter committed the current field");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setLastKeyboardStep("Enter submitted the keyboard lab");
  };

  const handleReset = () => {
    setValues(DEFAULT_KEYBOARD_VALUES);
    setSubmitted(false);
    setLastKeyboardStep("No keyboard step yet");
  };

  return (
    <section
      id="flowr-surface-keyboard"
      data-testid="surface-keyboard"
      aria-labelledby="flowr-surface-keyboard-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-keyboard-heading"
        number="C"
        title="Keyboard and secure inputs"
        hint="Move through the fields with Tab or Shift+Tab, type into the password field, then press Enter to submit."
      />

      <form
        id="flowr-keyboard-form"
        data-testid="keyboard-form"
        onSubmit={handleSubmit}
        onReset={handleReset}
        onKeyDownCapture={handleKeyDown}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="flowr-keyboard-username"
            className="text-xs font-medium text-[#5f5550]"
          >
            Username
          </label>
          <input
            id="flowr-keyboard-username"
            data-testid="keyboard-username"
            type="text"
            value={values.username}
            onChange={(event) =>
              setKeyboardValue("username", event.target.value)
            }
            placeholder="flowr-user"
            className="rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] placeholder:text-[#c4b3ab] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="flowr-keyboard-password"
            className="text-xs font-medium text-[#5f5550]"
          >
            Demo password
          </label>
          <input
            id="flowr-keyboard-password"
            data-testid="keyboard-password"
            aria-describedby="flowr-password-recording-hint"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) =>
              setKeyboardValue("password", event.target.value)
            }
            placeholder="Type anything"
            className="rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] placeholder:text-[#c4b3ab] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="flowr-keyboard-code"
            className="text-xs font-medium text-[#5f5550]"
          >
            Access code
          </label>
          <input
            id="flowr-keyboard-code"
            data-testid="keyboard-code"
            type="text"
            inputMode="numeric"
            value={values.accessCode}
            onChange={(event) =>
              setKeyboardValue("accessCode", event.target.value)
            }
            placeholder="123456"
            className="rounded-lg border border-[#eadfd8] px-3 py-2 text-sm text-[#201916] placeholder:text-[#c4b3ab] focus:outline-none focus:ring-2 focus:ring-[#7a263f]/30"
          />
        </div>

        <InstructionHint id="flowr-password-recording-hint">
          Password input is recorded as a protected password step; the replay
          flow does not store the typed password value.
        </InstructionHint>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <button
            id="flowr-keyboard-submit"
            data-testid="keyboard-submit"
            type="submit"
            className="rounded-lg bg-[#7a263f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#681f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
          >
            Complete keyboard run
          </button>
          <button
            id="flowr-keyboard-reset"
            data-testid="keyboard-reset"
            type="reset"
            className="rounded-lg border border-[#eadfd8] bg-white px-5 py-2.5 text-sm font-medium text-[#201916] transition hover:bg-[#fbf8f5]"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <p
          id="flowr-keyboard-last-step"
          data-testid="keyboard-last-step"
          className="rounded-lg border border-[#eadfd8] bg-[#fbf8f5] px-3 py-2 text-sm text-[#5f5550]"
        >
          Last keyboard event: <strong>{lastKeyboardStep}</strong>
        </p>
        <p
          id="flowr-keyboard-status"
          data-testid="keyboard-status"
          className="rounded-lg border border-[#eadfd8] bg-[#fbf8f5] px-3 py-2 text-sm text-[#5f5550]"
        >
          Status: <strong>{submitted ? "Submitted" : "Ready"}</strong>
        </p>
      </div>
    </section>
  );
}

/* ─── 4. Scroll lane ──────────────────────────────────────────────────────── */

const CHECKPOINTS = [
  {
    id: "cp-1",
    label: "Start marker",
    detail: "First visible card",
    color: "bg-[#f7f3ff]",
    width: "w-40",
  },
  {
    id: "cp-2",
    label: "Config step",
    detail: "Short target",
    color: "bg-[#fff7e8]",
    width: "w-48",
  },
  {
    id: "cp-3",
    label: "Form review",
    detail: "Medium target",
    color: "bg-[#ecfbf3]",
    width: "w-56",
  },
  {
    id: "cp-4",
    label: "Deep scroll",
    detail: "Replay scroll anchor",
    color: "bg-[#eef8ff]",
    width: "w-64",
  },
  {
    id: "cp-5",
    label: "Approval gate",
    detail: "Wide target",
    color: "bg-[#fff0f4]",
    width: "w-72",
  },
  {
    id: "cp-6",
    label: "Hidden middle",
    detail: "Past the fold",
    color: "bg-[#f4fbe8]",
    width: "w-52",
  },
  {
    id: "cp-7",
    label: "Review note",
    detail: "Narrow target",
    color: "bg-[#ecfbfb]",
    width: "w-44",
  },
  {
    id: "cp-8",
    label: "Owner handoff",
    detail: "Far checkpoint",
    color: "bg-[#fff3e7]",
    width: "w-60",
  },
  {
    id: "cp-9",
    label: "QA marker",
    detail: "Late sequence",
    color: "bg-[#fff1fb]",
    width: "w-48",
  },
  {
    id: "cp-10",
    label: "Release note",
    detail: "Wide late target",
    color: "bg-[#ecfbf8]",
    width: "w-72",
  },
  {
    id: "cp-11",
    label: "Final verify",
    detail: "Almost done",
    color: "bg-[#f1f3ff]",
    width: "w-56",
  },
  {
    id: "cp-12",
    label: "Finish flag",
    detail: "Last checkpoint",
    color: "bg-[#f6f4f2]",
    width: "w-44",
  },
];

function ScrollLane() {
  const [visited, setVisited] = useState<Set<string>>(new Set());

  return (
    <section
      id="flowr-surface-scroll"
      data-testid="surface-scroll"
      aria-labelledby="flowr-surface-scroll-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-scroll-heading"
        number="D"
        title="Scroll lane"
        hint="Scroll horizontally through the checkpoints and click targets across the full lane. Replay verifies long-distance scrolling and click recovery."
      />
      <div
        id="flowr-scroll-lane"
        data-testid="scroll-lane"
        className="flex gap-4 overflow-x-auto px-1 py-2 pb-4 scroll-px-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {CHECKPOINTS.map((cp, index) => {
          const isVisited = visited.has(cp.id);

          return (
            <button
              key={cp.id}
              id={`flowr-${cp.id}`}
              data-testid={cp.id}
              onClick={() => setVisited((v) => new Set([...v, cp.id]))}
              className={`group flex h-36 flex-none flex-col items-start justify-between rounded-lg border-2 p-4 text-left text-sm transition ${cp.width} ${cp.color} ${
                isVisited
                  ? "border-[#7a263f] shadow-[inset_0_0_0_1px_#7a263f]"
                  : "border-transparent shadow-[inset_0_0_0_1px_#eadfd8] hover:border-[#d4c6bf]"
              } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]`}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-[#7a263f] shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isVisited ? "bg-[#7a263f]" : "bg-[#d8cac2]"
                  }`}
                />
              </span>
              <span>
                <span className="block text-base font-semibold text-[#201916]">
                  {cp.label}
                </span>
                <span className="mt-1 block text-xs font-normal leading-relaxed text-[#5f5550]">
                  {cp.detail}
                </span>
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isVisited
                    ? "bg-[#7a263f] text-white"
                    : "bg-white/85 text-[#7a263f] group-hover:bg-white"
                }`}
              >
                {isVisited ? "Visited" : "Click to mark"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ─── 5. Hover effects ────────────────────────────────────────────────────── */

const HOVER_TARGETS = [
  {
    id: "preview-card",
    title: "Preview card",
    detail: "Reveals a detail badge on hover.",
    badge: "Preview ready",
  },
  {
    id: "approval-button",
    title: "Approval button",
    detail: "Changes tone while the pointer is over it.",
    badge: "Approval visible",
  },
  {
    id: "status-chip",
    title: "Status chip",
    detail: "Shows secondary copy only during hover.",
    badge: "Details shown",
  },
] as const;

function HoverEffectsSection() {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const activeTargetLabel =
    HOVER_TARGETS.find((target) => target.id === activeTarget)?.title ?? "None";

  return (
    <section
      id="flowr-surface-hover"
      data-testid="surface-hover"
      aria-labelledby="flowr-surface-hover-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-hover-heading"
        number="E"
        title="Hover targets"
        hint="Right-click a target while recording and choose Record hover, then hover the same target to capture the hover step."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {HOVER_TARGETS.map((target) => (
          <button
            key={target.id}
            id={`flowr-hover-${target.id}`}
            data-testid={`hover-${target.id}`}
            type="button"
            onMouseEnter={() => setActiveTarget(target.id)}
            onMouseLeave={() => setActiveTarget(null)}
            onFocus={() => setActiveTarget(target.id)}
            onBlur={() => setActiveTarget(null)}
            className="group relative min-h-36 rounded-lg border border-[#eadfd8] bg-[#fbf8f5] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#7a263f]/40 hover:bg-white hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
          >
            <span className="block pr-24 text-sm font-semibold text-[#201916]">
              {target.title}
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-[#5f5550]">
              {target.detail}
            </span>
            <span className="absolute right-4 top-4 rounded-full bg-[#7a263f] px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {target.badge}
            </span>
            <span className="mt-5 inline-flex rounded-full border border-[#eadfd8] bg-white px-3 py-1 text-xs font-medium text-[#7a263f]">
              Hover practice target
            </span>
          </button>
        ))}
      </div>

      <p
        id="flowr-hover-active-target"
        data-testid="hover-active-target"
        className="mt-4 rounded-lg border border-[#eadfd8] bg-[#fbf8f5] px-3 py-2 text-sm text-[#5f5550]"
      >
        Active hover target: <strong>{activeTargetLabel}</strong>
      </p>
    </section>
  );
}

/* ─── 6. Context menu ─────────────────────────────────────────────────────── */

type ContextMenuPosition = {
  left: number;
  top: number;
};

const CONTEXT_ACTIONS = [
  {
    id: "assign-reviewer",
    label: "Assign reviewer",
    result: "Reviewer assigned from custom menu",
  },
  {
    id: "copy-link",
    label: "Copy workflow link",
    result: "Workflow link copied from custom menu",
  },
  {
    id: "archive-step",
    label: "Archive step",
    result: "Step archived from custom menu",
  },
] as const;

function ContextMenuSection() {
  const [menuPosition, setMenuPosition] = useState<ContextMenuPosition | null>(
    null,
  );
  const [lastAction, setLastAction] = useState("No custom action selected");

  const openCustomMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      left: clampNumber(event.clientX - bounds.left, 12, bounds.width - 220),
      top: clampNumber(event.clientY - bounds.top, 12, bounds.height - 148),
    });
  };

  const chooseContextAction = (result: string) => {
    setLastAction(result);
    setMenuPosition(null);
  };

  return (
    <section
      id="flowr-surface-context-menu"
      data-testid="surface-context-menu"
      aria-labelledby="flowr-surface-context-menu-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-context-menu-heading"
        number="F"
        title="Custom context menu"
        hint="Right-click the surface to open the page menu. While recording, choose Record right click from the FlowR right-click menu to capture a context-click step."
      />

      <InstructionHint>
        The page menu and FlowR menu can both appear during recording; use the
        FlowR Record right click action for the workflow step.
      </InstructionHint>

      <div
        id="flowr-context-menu-zone"
        data-testid="context-menu-zone"
        role="region"
        aria-label="Custom context menu practice surface"
        tabIndex={0}
        onContextMenu={openCustomMenu}
        onClick={() => setMenuPosition(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setMenuPosition(null);
        }}
        className="relative mt-4 min-h-56 overflow-hidden rounded-lg border border-dashed border-[#cdbeb6] bg-[#fbf8f5] p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
      >
        <div className="flex h-full min-h-44 flex-col justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-[#201916]">
              Workflow row: onboarding checklist
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5f5550]">
              Right-click inside this area to open a custom menu with actions
              that resemble a dense app surface.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-[#5f5550]">
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#eadfd8]">
              Owner: Product
            </span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#eadfd8]">
              Status: Draft
            </span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#eadfd8]">
              Priority: Medium
            </span>
          </div>
        </div>

        {menuPosition && (
          <div
            id="flowr-custom-context-menu"
            data-testid="custom-context-menu"
            role="menu"
            aria-label="Workflow actions"
            onClick={(event) => event.stopPropagation()}
            className="absolute z-10 w-52 rounded-lg border border-[#eadfd8] bg-white p-2 shadow-lg"
            style={{ left: menuPosition.left, top: menuPosition.top }}
          >
            {CONTEXT_ACTIONS.map((action) => (
              <button
                key={action.id}
                id={`flowr-context-action-${action.id}`}
                data-testid={`context-action-${action.id}`}
                type="button"
                role="menuitem"
                onClick={() => chooseContextAction(action.result)}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-[#201916] transition hover:bg-[#fbf8f5] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7a263f]"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p
        id="flowr-context-menu-last-action"
        data-testid="context-menu-last-action"
        className="mt-4 rounded-lg border border-[#eadfd8] bg-[#fbf8f5] px-3 py-2 text-sm text-[#5f5550]"
      >
        Last custom menu action: <strong>{lastAction}</strong>
      </p>
    </section>
  );
}

/* ─── 7. Conditional visibility ───────────────────────────────────────────── */

function ConditionalSection() {
  const show = useSyncExternalStore(
    subscribeToConditionalPanelVisibility,
    readConditionalPanelVisibility,
    () => false,
  );
  const [choice, setChoice] = useState<"A" | "B" | null>(null);

  const togglePanelVisibility = () => {
    const nextShow = !show;
    writeConditionalPanelVisibility(nextShow);
    if (!nextShow) setChoice(null);
  };

  return (
    <section
      id="flowr-surface-conditional"
      data-testid="surface-conditional"
      aria-labelledby="flowr-surface-conditional-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-conditional-heading"
        number="G"
        title="Conditional visibility"
        hint="Use the visible and fallback panels to practice advanced skip conditions for elements that appear and disappear."
      />
      <InstructionHint>
        To add an advanced condition, record a step in one panel, open the FlowR
        panel, expand Advanced for that step, choose element-visible or
        element-not-visible, pick a target element, then choose a later step to
        jump to.
      </InstructionHint>
      <div className="mt-4 mb-4 flex items-center gap-3">
        <button
          id="flowr-conditional-toggle"
          data-testid="conditional-toggle"
          aria-pressed={show}
          aria-controls="flowr-conditional-panel flowr-conditional-fallback-panel"
          onClick={togglePanelVisibility}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            show ? "bg-[#7a263f]" : "bg-[#eadfd8]"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              show ? "translate-x-6" : "translate-x-1"
            }`}
          />
          <span className="sr-only">{show ? "Hide panel" : "Show panel"}</span>
        </button>
        <span className="text-sm text-[#5f5550]">
          {show ? "Panel visible" : "Panel hidden"}
        </span>
      </div>

      {!show && (
        <div
          id="flowr-conditional-fallback-panel"
          data-testid="conditional-fallback-panel"
          className="rounded-lg border border-[#eadfd8] bg-[#fbf8f5] p-4"
        >
          <p className="text-sm font-semibold text-[#201916]">
            Fallback panel is visible
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#5f5550]">
            Use this as the target for an element-visible condition when the
            optional panel is closed.
          </p>
        </div>
      )}

      {show && (
        <div
          id="flowr-conditional-panel"
          data-testid="conditional-panel"
          className="rounded-lg border border-[#eadfd8] bg-[#fbf8f5] p-4"
        >
          <p className="text-sm text-[#5f5550] mb-3">
            Pick an option while the panel is visible:
          </p>
          <div className="flex gap-3">
            {(["A", "B"] as const).map((opt) => (
              <button
                key={opt}
                id={`flowr-conditional-option-${opt.toLowerCase()}`}
                data-testid={`conditional-option-${opt.toLowerCase()}`}
                onClick={() => setChoice(opt)}
                className={`rounded-lg border px-6 py-2.5 text-sm font-medium transition ${
                  choice === opt
                    ? "bg-[#7a263f] text-white border-[#7a263f]"
                    : "bg-white text-[#201916] border-[#eadfd8] hover:bg-[#fbf8f5]"
                }`}
              >
                Option {opt}
              </button>
            ))}
          </div>
          {choice && (
            <div
              id="flowr-conditional-success-panel"
              data-testid="conditional-success-panel"
              className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            >
              Success panel: <strong>Option {choice}</strong> is active.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ─── 8. Dynamic targets ──────────────────────────────────────────────────── */

const DYNAMIC_TARGETS = [
  {
    id: "request-access",
    title: "Request access",
    detail: "A primary action that keeps its id while layout changes.",
  },
  {
    id: "review-policy",
    title: "Review policy",
    detail: "A secondary target used after reordering cards.",
  },
  {
    id: "confirm-owner",
    title: "Confirm owner",
    detail: "A stable target with changing visual position.",
  },
  {
    id: "publish-change",
    title: "Publish change",
    detail: "A final target for replay after density changes.",
  },
] as const;

function DynamicTargetsSection() {
  const [isReversed, setIsReversed] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState("None");
  const orderedTargets = isReversed
    ? [...DYNAMIC_TARGETS].reverse()
    : DYNAMIC_TARGETS;

  return (
    <section
      id="flowr-surface-dynamic-targets"
      data-testid="surface-dynamic-targets"
      aria-labelledby="flowr-surface-dynamic-targets-heading"
      className="rounded-xl border border-[#eadfd8] bg-white p-6"
    >
      <SectionHeading
        id="flowr-surface-dynamic-targets-heading"
        number="H"
        title="Moving targets"
        hint="Record clicks, change the order or density, then replay to check that stable selectors still find the intended targets."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          id="flowr-dynamic-reorder"
          data-testid="dynamic-reorder"
          type="button"
          onClick={() => setIsReversed((current) => !current)}
          className="rounded-lg border border-[#eadfd8] bg-white px-4 py-2 text-sm font-medium text-[#201916] transition hover:bg-[#fbf8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
        >
          Reorder cards
        </button>
        <button
          id="flowr-dynamic-density"
          data-testid="dynamic-density"
          type="button"
          onClick={() => setIsCompact((current) => !current)}
          className="rounded-lg border border-[#eadfd8] bg-white px-4 py-2 text-sm font-medium text-[#201916] transition hover:bg-[#fbf8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
        >
          Toggle density
        </button>
      </div>

      <div
        id="flowr-dynamic-target-grid"
        data-testid="dynamic-target-grid"
        className={`grid grid-cols-1 gap-3 transition-all sm:grid-cols-2 ${
          isCompact ? "text-xs" : "text-sm"
        }`}
      >
        {orderedTargets.map((target) => (
          <button
            key={target.id}
            id={`flowr-dynamic-target-${target.id}`}
            data-testid={`dynamic-target-${target.id}`}
            type="button"
            onClick={() => setSelectedTarget(target.title)}
            className={`rounded-lg border border-[#eadfd8] bg-[#fbf8f5] text-left transition hover:border-[#7a263f]/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f] ${
              isCompact ? "min-h-20 p-3" : "min-h-32 p-5"
            }`}
          >
            <span className="block font-semibold text-[#201916]">
              {target.title}
            </span>
            <span className="mt-2 block leading-relaxed text-[#5f5550]">
              {target.detail}
            </span>
          </button>
        ))}
      </div>

      <p
        id="flowr-dynamic-selected-target"
        data-testid="dynamic-selected-target"
        className="mt-4 rounded-lg border border-[#eadfd8] bg-[#fbf8f5] px-3 py-2 text-sm text-[#5f5550]"
      >
        Selected moving target: <strong>{selectedTarget}</strong>
      </p>
    </section>
  );
}

/* ─── Root export ──────────────────────────────────────────────────────────── */

export default function PlaygroundSurfaces() {
  return (
    <div
      id="flowr-playground-surfaces"
      data-testid="playground-surfaces"
      className="flex flex-col gap-6"
    >
      <ButtonBank />
      <FormLab />
      <KeyboardPasswordLab />
      <ScrollLane />
      <HoverEffectsSection />
      <ContextMenuSection />
      <ConditionalSection />
      <DynamicTargetsSection />
    </div>
  );
}
