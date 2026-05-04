"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  MousePointerClick,
  PlayCircle,
  RefreshCw,
  Share2,
} from "lucide-react";

type WorkflowStage = {
  kicker: string;
  title: string;
  body: string;
  label: string;
  progress: string;
  panelStatus: string;
  activeTarget: "name" | "instruction" | "owner" | "repair" | "share";
  target: Pick<CSSProperties, "left" | "top" | "width" | "height">;
  cursorMode: "pointer" | "caret";
  icon: LucideIcon;
};

type WorkflowActiveTarget = WorkflowStage["activeTarget"];

type CursorCoordinates = Pick<CSSProperties, "left" | "top">;

type MeasuredCursorCoordinates = {
  activeTarget: WorkflowActiveTarget;
  coordinates: CursorCoordinates;
};

type MockPanel = Pick<CSSProperties, "left" | "top" | "width" | "height"> & {
  variant: "sidebar" | "field" | "copy" | "metric" | "row" | "library";
  opacity?: CSSProperties["opacity"];
};

type PanelVariant = MockPanel["variant"];

type CalculatedPanel = {
  left: number;
  top: number;
  width: number;
  height: number;
  variant: PanelVariant;
  opacity?: CSSProperties["opacity"];
};

type LayoutRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type MeasuredMockLayout = {
  stageCardRect: LayoutRect;
  progressBadgeRect: LayoutRect;
  highlightRect: LayoutRect;
  stepRailRect: LayoutRect;
};

const stages: WorkflowStage[] = [
  {
    kicker: "01 Capture",
    title: "Record the task on the real page.",
    body: "FlowR watches the field you click, the value you type, and the page context around it.",
    label: "Recording",
    progress: "1 / 5",
    panelStatus: "Recording",
    activeTarget: "name",
    target: { left: "22%", top: "34%", width: "43%", height: "22%" },
    cursorMode: "pointer",
    icon: MousePointerClick,
  },
  {
    kicker: "02 Explain",
    title: "Attach the replay instruction.",
    body: "The note becomes guidance that appears with the right element during replay.",
    label: "Instruction saved",
    progress: "2 / 5",
    panelStatus: "Instruction saved",
    activeTarget: "instruction",
    target: { left: "49%", top: "31%", width: "40%", height: "32%" },
    cursorMode: "caret",
    icon: FileText,
  },
  {
    kicker: "03 Replay",
    title: "Guide the next person in context.",
    body: "The replay focuses the live element instead of asking someone to scrub through a video.",
    label: "Guided replay",
    progress: "3 / 5",
    panelStatus: "Replay active",
    activeTarget: "owner",
    target: { left: "20%", top: "41%", width: "52%", height: "22%" },
    cursorMode: "pointer",
    icon: PlayCircle,
  },
  {
    kicker: "04 Repair",
    title: "Repair the changed target.",
    body: "When a selector drifts, reconnect just that step and keep the rest of the workflow intact.",
    label: "Step repaired",
    progress: "4 / 5",
    panelStatus: "Repair mode",
    activeTarget: "repair",
    target: { left: "47%", top: "43%", width: "42%", height: "41%" },
    cursorMode: "pointer",
    icon: RefreshCw,
  },
  {
    kicker: "05 Share",
    title: "Send it from the workflow library.",
    body: "Share the maintained walkthrough from the library item when the process is ready for the team.",
    label: "Ready to share",
    progress: "5 / 5",
    panelStatus: "Ready to share",
    activeTarget: "share",
    target: { left: "18%", top: "43%", width: "68%", height: "28%" },
    cursorMode: "pointer",
    icon: Share2,
  },
];

const workflowMockLayoutConfig = {
  targetCanvasCoverage: 70,
  maximumSupportPanels: 16,
  supportBounds: {
    left: 5,
    top: 10,
    right: 98,
    bottom: 100,
  },
  gap: 4,
  panelGap: 2,
  stepRailGap: 2,
  minimumPanelSize: 6,
  preferredPanelWidth: 10,
  preferredPanelHeight: 8,
};

const supportBounds = workflowMockLayoutConfig.supportBounds;
const supportGap = workflowMockLayoutConfig.gap;
const panelGap = workflowMockLayoutConfig.panelGap;
const stepRailGap = workflowMockLayoutConfig.stepRailGap;
const minimumPanelSize = workflowMockLayoutConfig.minimumPanelSize;
const maximumSupportPanels = workflowMockLayoutConfig.maximumSupportPanels;
const stageCardRect: LayoutRect = { left: 5, top: 10, right: 56, bottom: 29 };
const progressBadgeRect: LayoutRect = {
  left: 88,
  top: 10,
  right: 95,
  bottom: 24,
};
const stepRailRect: LayoutRect = { left: 5, top: 92, right: 98, bottom: 98 };

function getPercentValue(value: CSSProperties["left"]) {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(value: number) {
  return `${Number(value.toFixed(2))}%`;
}

function addCalculatedPanel(
  panels: CalculatedPanel[],
  panel: Omit<CalculatedPanel, "variant">,
  variant: PanelVariant,
  minimumSize = minimumPanelSize,
) {
  if (panel.width < minimumSize || panel.height < minimumSize) return;

  panels.push({ ...panel, variant });
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function inflateRect(rect: LayoutRect, amount: number) {
  return {
    left: clamp(rect.left - amount, 0, 100),
    top: clamp(rect.top - amount, 0, 100),
    right: clamp(rect.right + amount, 0, 100),
    bottom: clamp(rect.bottom + amount, 0, 100),
  };
}

function rectsOverlap(first: LayoutRect, second: LayoutRect) {
  return !(
    first.right <= second.left ||
    first.left >= second.right ||
    first.bottom <= second.top ||
    first.top >= second.bottom
  );
}

function getRectArea(rect: LayoutRect) {
  return (
    Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top)
  );
}

function hasRectArea(rect: LayoutRect) {
  return rect.right - rect.left > 0.1 && rect.bottom - rect.top > 0.1;
}

function panelToRect(
  panel: Pick<CalculatedPanel, "left" | "top" | "width" | "height">,
) {
  return {
    left: panel.left,
    top: panel.top,
    right: panel.left + panel.width,
    bottom: panel.top + panel.height,
  };
}

function panelOverlapsSelectedPanels(
  candidateRect: LayoutRect,
  panels: CalculatedPanel[],
) {
  return panels.some((panel) =>
    rectsOverlap(candidateRect, inflateRect(panelToRect(panel), panelGap)),
  );
}

function getMockCoverageRatio(
  reservedRects: LayoutRect[],
  panels: CalculatedPanel[],
) {
  const reservedArea = reservedRects.reduce(
    (total, rect) => total + getRectArea(rect),
    0,
  );
  const panelArea = panels.reduce(
    (total, panel) => total + getRectArea(panelToRect(panel)),
    0,
  );

  return (reservedArea + panelArea) / 10000;
}

function getTargetCanvasCoverageRatio() {
  const configuredCoverage = workflowMockLayoutConfig.targetCanvasCoverage;

  return configuredCoverage > 1 ? configuredCoverage / 100 : configuredCoverage;
}

function getTargetRect(stage: WorkflowStage): LayoutRect {
  const targetLeft = getPercentValue(stage.target.left);
  const targetTop = getPercentValue(stage.target.top);
  const targetWidth = getPercentValue(stage.target.width);
  const targetHeight = getPercentValue(stage.target.height);

  return {
    left: targetLeft,
    top: targetTop,
    right: targetLeft + targetWidth,
    bottom: targetTop + targetHeight,
  };
}

function getTargetCursor(stage: WorkflowStage) {
  const targetRect = getTargetRect(stage);
  const coordinates = {
    name: { left: targetRect.right - 5, top: targetRect.top + 13 },
    instruction: { left: targetRect.right - 4.5, top: targetRect.top + 21 },
    owner: { left: targetRect.right - 5, top: targetRect.top + 14 },
    repair: { left: targetRect.right - 7, top: targetRect.top + 28 },
    share: { left: targetRect.right - 4.5, top: targetRect.top + 17 },
  }[stage.activeTarget];

  return {
    left: toPercent(clamp(coordinates.left, 4, 94)),
    top: toPercent(clamp(coordinates.top, 8, 92)),
  };
}

function getMeasuredCursorCoordinates(
  activeTarget: WorkflowActiveTarget,
  targetElement: HTMLElement,
  canvasElement: HTMLElement,
): CursorCoordinates {
  const targetRect = targetElement.getBoundingClientRect();
  const canvasRect = canvasElement.getBoundingClientRect();
  const targetWidth = targetRect.width;
  const targetHeight = targetRect.height;
  const rightInset = Math.min(16, Math.max(8, targetWidth * 0.22));

  const anchor =
    activeTarget === "instruction"
      ? {
          left: targetRect.right - rightInset,
          top: targetRect.top + clamp((targetHeight - 50) / 2, 8, 24),
        }
      : {
          left: targetRect.right - rightInset,
          top: targetRect.top + targetHeight / 2,
        };

  return {
    left: toPercent(
      clamp(((anchor.left - canvasRect.left) / canvasRect.width) * 100, 2, 96),
    ),
    top: toPercent(
      clamp(((anchor.top - canvasRect.top) / canvasRect.height) * 100, 4, 94),
    ),
  };
}

function getCursorStyle(
  stage: WorkflowStage,
  measuredCursorCoordinates: MeasuredCursorCoordinates | null | undefined,
): CSSProperties {
  const targetCursor =
    measuredCursorCoordinates?.activeTarget === stage.activeTarget
      ? measuredCursorCoordinates.coordinates
      : getTargetCursor(stage);

  return {
    "--flowr-mock-cursor-left": targetCursor.left,
    "--flowr-mock-cursor-top": targetCursor.top,
    "--flowr-mock-cursor-mobile-left": targetCursor.left,
    "--flowr-mock-cursor-mobile-top": targetCursor.top,
  } as CSSProperties;
}

function toCanvasPercentRect(rect: DOMRect, canvasRect: DOMRect): LayoutRect {
  return {
    left: ((rect.left - canvasRect.left) / canvasRect.width) * 100,
    top: ((rect.top - canvasRect.top) / canvasRect.height) * 100,
    right: ((rect.right - canvasRect.left) / canvasRect.width) * 100,
    bottom: ((rect.bottom - canvasRect.top) / canvasRect.height) * 100,
  };
}

function areRectsClose(first: LayoutRect, second: LayoutRect) {
  return (
    Math.abs(first.left - second.left) < 0.1 &&
    Math.abs(first.top - second.top) < 0.1 &&
    Math.abs(first.right - second.right) < 0.1 &&
    Math.abs(first.bottom - second.bottom) < 0.1
  );
}

function areMeasuredLayoutsClose(
  first: MeasuredMockLayout | null | undefined,
  second: MeasuredMockLayout | null | undefined,
) {
  if (!first || !second) return first === second;

  return (
    areRectsClose(first.stageCardRect, second.stageCardRect) &&
    areRectsClose(first.progressBadgeRect, second.progressBadgeRect) &&
    areRectsClose(first.highlightRect, second.highlightRect) &&
    areRectsClose(first.stepRailRect, second.stepRailRect)
  );
}

function areMeasuredLayoutSetsClose(
  first: Array<MeasuredMockLayout | null>,
  second: Array<MeasuredMockLayout | null>,
) {
  if (first.length !== second.length) return false;

  return first.every((layout, index) =>
    areMeasuredLayoutsClose(layout, second[index]),
  );
}

function areMeasuredCursorCoordinatesClose(
  first: MeasuredCursorCoordinates | null | undefined,
  second: MeasuredCursorCoordinates | null | undefined,
) {
  if (!first || !second) return first === second;

  return (
    first.activeTarget === second.activeTarget &&
    first.coordinates.left === second.coordinates.left &&
    first.coordinates.top === second.coordinates.top
  );
}

function areMeasuredCursorCoordinateSetsClose(
  first: Array<MeasuredCursorCoordinates | null>,
  second: Array<MeasuredCursorCoordinates | null>,
) {
  if (first.length !== second.length) return false;

  return first.every((coordinates, index) =>
    areMeasuredCursorCoordinatesClose(coordinates, second[index]),
  );
}

function getPanelVariant(
  panel: Omit<CalculatedPanel, "variant">,
  stage: WorkflowStage,
) {
  const aspectRatio = panel.width / panel.height;

  if (panel.height < 13)
    return stage.activeTarget === "share" ? "library" : "metric";
  if (aspectRatio < 0.7) return "sidebar";
  if (aspectRatio > 2.2)
    return stage.activeTarget === "share" ? "library" : "row";
  if (stage.activeTarget === "share") return "library";
  if (stage.activeTarget === "repair") return "field";

  return panel.top < 30 ? "copy" : "field";
}

function addCoveragePanels(
  panels: CalculatedPanel[],
  stage: WorkflowStage,
  coverageRects: LayoutRect[],
  reservedRects: LayoutRect[],
) {
  const addCut = (cuts: Set<number>, value: number) => {
    cuts.add(clamp(value, 0, 100));
  };
  const xCuts = new Set<number>();
  const yCuts = new Set<number>();

  [supportBounds.left, supportBounds.right].forEach((value) =>
    addCut(xCuts, value),
  );
  [supportBounds.top, supportBounds.bottom].forEach((value) =>
    addCut(yCuts, value),
  );

  [...coverageRects, ...reservedRects].forEach((rect) => {
    [
      rect.left,
      rect.right,
      rect.left - supportGap,
      rect.right + supportGap,
    ].forEach((value) => addCut(xCuts, value));
    [
      rect.top,
      rect.bottom,
      rect.top - supportGap,
      rect.bottom + supportGap,
    ].forEach((value) => addCut(yCuts, value));
  });

  const xValues = [...xCuts].sort((first, second) => first - second);
  const yValues = [...yCuts].sort((first, second) => first - second);
  const candidates: Array<
    Omit<CalculatedPanel, "variant"> & { score: number }
  > = [];

  for (let leftIndex = 0; leftIndex < xValues.length - 1; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < xValues.length;
      rightIndex += 1
    ) {
      for (let topIndex = 0; topIndex < yValues.length - 1; topIndex += 1) {
        for (
          let bottomIndex = topIndex + 1;
          bottomIndex < yValues.length;
          bottomIndex += 1
        ) {
          const candidate = {
            left: xValues[leftIndex],
            top: yValues[topIndex],
            width: xValues[rightIndex] - xValues[leftIndex],
            height: yValues[bottomIndex] - yValues[topIndex],
          };

          if (
            candidate.width < workflowMockLayoutConfig.preferredPanelWidth ||
            candidate.height < workflowMockLayoutConfig.preferredPanelHeight
          ) {
            continue;
          }

          const candidateRect = panelToRect(candidate);
          const overlapsReserved = reservedRects.some((rect) =>
            rectsOverlap(candidateRect, rect),
          );
          const overlapsPanels = panelOverlapsSelectedPanels(
            candidateRect,
            panels,
          );

          if (overlapsReserved || overlapsPanels) continue;

          const directEdgeMatches = coverageRects.reduce((matches, rect) => {
            return (
              matches +
              Number(Math.abs(candidateRect.left - rect.left) < 0.1) +
              Number(Math.abs(candidateRect.right - rect.right) < 0.1) +
              Number(Math.abs(candidateRect.top - rect.top) < 0.1) +
              Number(Math.abs(candidateRect.bottom - rect.bottom) < 0.1)
            );
          }, 0);
          const area = candidate.width * candidate.height;

          candidates.push({
            ...candidate,
            score: area + directEdgeMatches * 400,
          });
        }
      }
    }
  }

  candidates
    .sort((first, second) => second.score - first.score)
    .forEach((candidate) => {
      if (panels.length >= maximumSupportPanels) return;
      if (
        getMockCoverageRatio(coverageRects, panels) >=
        getTargetCanvasCoverageRatio()
      ) {
        return;
      }

      const candidateRect = panelToRect(candidate);
      const overlapsPanels = panelOverlapsSelectedPanels(candidateRect, panels);

      if (!overlapsPanels) {
        addCalculatedPanel(
          panels,
          candidate,
          getPanelVariant(candidate, stage),
        );
      }
    });
}

function createSupportPanels(
  stage: WorkflowStage,
  measuredLayout?: MeasuredMockLayout | null,
) {
  const targetRect = measuredLayout?.highlightRect ?? getTargetRect(stage);
  const currentStageCardRect = measuredLayout?.stageCardRect ?? stageCardRect;
  const currentProgressBadgeRect =
    measuredLayout?.progressBadgeRect ?? progressBadgeRect;
  const hasProgressBadge = hasRectArea(currentProgressBadgeRect);
  const currentStepRailRect = measuredLayout?.stepRailRect ?? stepRailRect;
  const reservedSourceRects = hasProgressBadge
    ? [targetRect, currentStageCardRect, currentProgressBadgeRect]
    : [targetRect, currentStageCardRect];
  const coverageRects = [...reservedSourceRects, currentStepRailRect];
  const reservedRects = reservedSourceRects.map((rect) =>
    inflateRect(rect, supportGap),
  );
  reservedRects.push(inflateRect(currentStepRailRect, stepRailGap));
  const panels: CalculatedPanel[] = [];
  const targetWidth = targetRect.right - targetRect.left;
  const targetHeight = targetRect.bottom - targetRect.top;
  const leftBoundary = currentStageCardRect.left;
  const leftWidth = targetRect.left - leftBoundary - supportGap;
  const rightWidth = supportBounds.right - targetRect.right - supportGap;
  const sideTop = Math.max(
    targetRect.top,
    currentStageCardRect.bottom + supportGap,
  );
  const sideHeight = targetRect.bottom - sideTop;
  const belowBoundary = Math.min(
    supportBounds.bottom,
    currentStepRailRect.top - stepRailGap,
  );
  const belowHeight = Math.max(
    0,
    belowBoundary - targetRect.bottom - supportGap,
  );
  const aboveHeight = Math.min(
    targetHeight,
    targetRect.top - supportBounds.top - supportGap,
  );
  const headerHeight = Math.min(
    currentStageCardRect.bottom - currentStageCardRect.top,
    Math.max(0, targetRect.top - supportGap - currentStageCardRect.top),
  );

  const addPanel = (
    panel: Omit<CalculatedPanel, "variant">,
    variant?: PanelVariant,
    minimumSize = minimumPanelSize,
  ) => {
    if (panels.length >= maximumSupportPanels) return;
    if (panel.width < minimumSize || panel.height < minimumSize) return;

    const panelRect = {
      left: panel.left,
      top: panel.top,
      right: panel.left + panel.width,
      bottom: panel.top + panel.height,
    };
    const overlapsReserved = reservedRects.some((rect) =>
      rectsOverlap(panelRect, rect),
    );
    const overlapsPanels = panelOverlapsSelectedPanels(panelRect, panels);

    if (overlapsReserved || overlapsPanels) return;

    addCalculatedPanel(
      panels,
      panel,
      variant ?? getPanelVariant(panel, stage),
      minimumSize,
    );
  };

  if (hasProgressBadge) {
    addPanel(
      {
        left: currentStageCardRect.right + supportGap,
        top: currentStageCardRect.top,
        width:
          currentProgressBadgeRect.left -
          currentStageCardRect.right -
          supportGap * 2,
        height: headerHeight,
      },
      "metric",
    );

    addPanel(
      {
        left: currentProgressBadgeRect.left - supportGap - 18,
        top: currentProgressBadgeRect.bottom + supportGap,
        width: 18,
        height: Math.min(
          targetHeight,
          targetRect.top - currentProgressBadgeRect.bottom - supportGap * 2,
        ),
      },
      "metric",
    );

    addPanel(
      {
        left: currentProgressBadgeRect.left - supportGap - 18,
        top: currentProgressBadgeRect.top,
        width: 18,
        height: currentProgressBadgeRect.bottom - currentProgressBadgeRect.top,
      },
      "metric",
    );
  }

  addPanel(
    {
      left: currentStageCardRect.left,
      top: currentStageCardRect.bottom + supportGap,
      width: currentStageCardRect.right - currentStageCardRect.left,
      height: targetRect.top - currentStageCardRect.bottom - supportGap * 2,
    },
    "copy",
  );

  if (hasProgressBadge) {
    addPanel(
      {
        left: currentProgressBadgeRect.left,
        top: currentProgressBadgeRect.bottom + supportGap,
        width: currentProgressBadgeRect.right - currentProgressBadgeRect.left,
        height:
          targetRect.top - currentProgressBadgeRect.bottom - supportGap * 2,
      },
      "metric",
      4,
    );
  }

  addPanel(
    {
      left: targetRect.right + supportGap,
      top: Math.max(targetRect.top, currentStageCardRect.bottom + supportGap),
      width: rightWidth,
      height: Math.max(
        0,
        Math.min(
          targetHeight,
          supportBounds.bottom -
            Math.max(targetRect.top, currentStageCardRect.bottom + supportGap),
        ),
      ),
    },
    rightWidth < 14 ? "sidebar" : "row",
    4,
  );

  addPanel(
    {
      left: leftBoundary,
      top: targetRect.bottom + supportGap,
      width: supportBounds.right - leftBoundary,
      height: belowHeight,
    },
    stage.activeTarget === "share" ? "library" : "row",
    4,
  );

  addPanel(
    {
      left: leftBoundary,
      top: sideTop,
      width: leftWidth,
      height: sideHeight,
    },
    leftWidth < 14 ? "sidebar" : "field",
  );

  addPanel(
    {
      left: targetRect.right + supportGap,
      top: sideTop,
      width: rightWidth,
      height: sideHeight,
    },
    rightWidth < 14 ? "sidebar" : "row",
  );

  addPanel(
    {
      left: targetRect.left,
      top: targetRect.bottom + supportGap,
      width: targetWidth,
      height: belowHeight,
    },
    stage.activeTarget === "share" ? "library" : "row",
  );

  addPanel(
    {
      left: targetRect.left,
      top: targetRect.top - supportGap - aboveHeight,
      width: targetWidth,
      height: aboveHeight,
    },
    aboveHeight < 13 ? "metric" : "copy",
  );

  addPanel(
    {
      left: leftBoundary,
      top: targetRect.bottom + supportGap,
      width: leftWidth,
      height: belowHeight,
    },
    leftWidth < 14 ? "sidebar" : "field",
  );

  addPanel(
    {
      left: targetRect.right + supportGap,
      top: targetRect.bottom + supportGap,
      width: rightWidth,
      height: belowHeight,
    },
    rightWidth < 14 ? "sidebar" : "row",
  );

  addPanel(
    {
      left: leftBoundary,
      top: targetRect.top - supportGap - aboveHeight,
      width: leftWidth,
      height: aboveHeight,
    },
    aboveHeight < 13 ? "metric" : "field",
  );

  addPanel(
    {
      left: targetRect.right + supportGap,
      top: targetRect.top - supportGap - aboveHeight,
      width: rightWidth,
      height: aboveHeight,
    },
    aboveHeight < 13 ? "metric" : "row",
  );

  addPanel(
    {
      left: Math.max(targetRect.left, currentStageCardRect.right + supportGap),
      top: currentStageCardRect.bottom + supportGap,
      width:
        targetRect.right -
        Math.max(targetRect.left, currentStageCardRect.right + supportGap),
      height: targetRect.top - currentStageCardRect.bottom - supportGap * 2,
    },
    "metric",
  );

  addCoveragePanels(panels, stage, coverageRects, reservedRects);

  return panels.slice(0, maximumSupportPanels).map(
    (panel): MockPanel => ({
      left: toPercent(panel.left),
      top: toPercent(panel.top),
      width: toPercent(panel.width),
      height: toPercent(panel.height),
      variant: panel.variant,
      opacity: panel.opacity,
    }),
  );
}

function MorphingPanel({
  panel,
  index,
  stageId,
}: {
  panel: MockPanel;
  index: number;
  stageId: WorkflowStage["activeTarget"];
}) {
  const panelWidth = getPercentValue(panel.width);
  const panelHeight = getPercentValue(panel.height);
  const isCompact = panelWidth < 16 || panelHeight < 20;
  const isTall = panelHeight >= 26;
  const panelStyle: CSSProperties = {
    left: panel.left,
    top: panel.top,
    width: panel.width,
    height: panel.height,
    opacity: panel.opacity ?? 0.68,
  };

  return (
    <div
      id={`flowr-mock-filler-${stageId}-${index + 1}`}
      className={`flowr-mock-filler flowr-mock-filler--${panel.variant} absolute z-0 overflow-hidden rounded-lg border border-[#eadfd8] bg-white/75 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isCompact ? "flowr-mock-filler--compact p-1.5" : "p-3"
      }`}
      style={panelStyle}
      data-flowr-support-panel={index}
      data-flowr-support-variant={panel.variant}
      data-flowr-support-stage={stageId}
    >
      {isCompact ? (
        <div className="flowr-mock-filler-content flowr-mock-filler-content--compact flex h-full min-h-0 items-center gap-2">
          {panelWidth >= 12 && panelHeight >= 8 ? (
            <div className="flowr-mock-filler-icon size-4 shrink-0 rounded-md bg-[#efe8e4]" />
          ) : null}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div
              className={`flowr-mock-filler-line flowr-mock-filler-line--primary ${panelHeight < 8 ? "h-1.5" : "h-2"} w-4/5 rounded-sm bg-[#d8cbc4]`}
            />
            {panelHeight >= 9 ? (
              <div className="flowr-mock-filler-line flowr-mock-filler-line--secondary h-1.5 w-3/5 rounded-sm bg-[#efe8e4]" />
            ) : null}
          </div>
        </div>
      ) : null}

      {!isCompact && panel.variant === "sidebar" ? (
        <div className="flowr-mock-filler-content flowr-mock-filler-content--sidebar flex h-full min-h-0 flex-col">
          <div className="flowr-mock-filler-line flowr-mock-filler-line--primary h-3 max-w-full w-2/3 shrink-0 rounded-sm bg-[#d8cbc4]" />
          <div className="flowr-mock-filler-stack mt-4 grid min-h-0 flex-1 grid-rows-4 gap-3">
            <div className="flowr-mock-filler-block min-h-0 rounded-md bg-[#efe8e4]" />
            <div className="flowr-mock-filler-block min-h-0 rounded-md bg-[#efe8e4]" />
            <div className="flowr-mock-filler-block min-h-0 rounded-md bg-[#efe8e4]" />
            <div className="flowr-mock-filler-block min-h-0 rounded-md bg-[#efe8e4]" />
          </div>
        </div>
      ) : null}

      {!isCompact && panel.variant === "field" ? (
        <div className="flowr-mock-filler-content flowr-mock-filler-content--field flex h-full min-h-0 flex-col">
          <div className="flowr-mock-filler-line flowr-mock-filler-line--primary h-3 max-w-full w-24 shrink-0 rounded-sm bg-[#d8cbc4]" />
          <div
            className={`flowr-mock-filler-stack mt-3 grid min-h-0 flex-1 gap-3 ${isTall ? "grid-rows-3" : "grid-rows-2"}`}
          >
            <div className="flowr-mock-filler-block min-h-0 rounded-md bg-[#efe8e4]" />
            <div className="flowr-mock-filler-block min-h-0 rounded-md bg-[#efe8e4]" />
            {isTall ? (
              <div className="flowr-mock-filler-block min-h-0 rounded-md bg-[#efe8e4]" />
            ) : null}
          </div>
        </div>
      ) : null}

      {!isCompact && panel.variant === "copy" ? (
        <div className="flowr-mock-filler-content flowr-mock-filler-content--copy flex h-full min-h-0 flex-col">
          <div className="flowr-mock-filler-line flowr-mock-filler-line--primary h-3 max-w-full w-28 shrink-0 rounded-sm bg-[#d8cbc4]" />
          <div className="flowr-mock-filler-copy-lines mt-4 space-y-3">
            <div className="flowr-mock-filler-line h-2 rounded-sm bg-[#efe8e4]" />
            <div className="flowr-mock-filler-line h-2 w-4/5 rounded-sm bg-[#efe8e4]" />
            <div className="flowr-mock-filler-line h-2 w-2/3 rounded-sm bg-[#efe8e4]" />
          </div>
          {isTall ? (
            <div className="flowr-mock-filler-block-grid mt-auto grid grid-cols-2 gap-3 pt-4">
              <div className="flowr-mock-filler-block h-8 rounded-md bg-[#efe8e4]" />
              <div className="flowr-mock-filler-block h-8 rounded-md bg-[#efe8e4]" />
            </div>
          ) : null}
        </div>
      ) : null}

      {!isCompact && panel.variant === "metric" ? (
        <div className="flowr-mock-filler-content flowr-mock-filler-content--metric flex h-full min-h-0 flex-col justify-between">
          <div className="flowr-mock-filler-line flowr-mock-filler-line--primary h-2 max-w-full w-12 rounded-sm bg-[#d8cbc4]" />
          <div className="flowr-mock-filler-block h-7 max-w-full w-16 rounded-md bg-[#efe8e4]" />
          <div className="flowr-mock-filler-copy-lines space-y-2">
            <div className="flowr-mock-filler-line h-2 w-full rounded-sm bg-[#efe8e4]" />
            <div className="flowr-mock-filler-line h-2 w-2/3 rounded-sm bg-[#efe8e4]" />
          </div>
        </div>
      ) : null}

      {!isCompact &&
      (panel.variant === "row" || panel.variant === "library") ? (
        <div className="flowr-mock-filler-content flowr-mock-filler-content--row flex h-full min-h-0 items-center gap-3">
          <div className="flowr-mock-filler-icon size-8 shrink-0 rounded-md bg-[#efe8e4]" />
          <div className="min-w-0 flex-1">
            <div className="flowr-mock-filler-line flowr-mock-filler-line--primary h-2.5 w-4/5 rounded-sm bg-[#d8cbc4]" />
            <div className="flowr-mock-filler-line flowr-mock-filler-line--secondary mt-2 h-2 w-2/3 rounded-sm bg-[#efe8e4]" />
          </div>
          {panel.variant === "library" ? (
            <div className="flowr-mock-filler-action size-7 shrink-0 rounded-md bg-[#efe8e4]" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StageTargetContent({
  isMeasurement = false,
  stage,
  targetRef,
}: {
  isMeasurement?: boolean;
  stage: WorkflowStage;
  targetRef?: (element: HTMLElement | null) => void;
}) {
  const stageContentClassName = isMeasurement ? "" : "flowr-stage-content";

  if (stage.activeTarget === "instruction") {
    return (
      <div
        id={isMeasurement ? undefined : "flowr-mock-target-content-instruction"}
        className={`flowr-mock-target-content flowr-mock-target-content--instruction ${stageContentClassName} flex h-full min-h-0 w-full flex-col p-2 sm:p-5`}
      >
        <p className="flowr-mock-target-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a263f] sm:text-xs sm:tracking-[0.14em]">
          Replay instruction
        </p>
        <div
          id={isMeasurement ? undefined : "flowr-mock-instruction-field"}
          ref={(element) => {
            targetRef?.(element);
          }}
          className="flowr-mock-target-field flowr-mock-instruction-field mt-1.5 min-h-0 flex-1 overflow-visible rounded-md border border-[#e5c6d1] bg-white px-3 py-2 text-xs leading-5 text-[#201916] break-words sm:mt-3 sm:px-4 sm:py-3 sm:text-sm sm:leading-6"
          data-flowr-instruction-text="true"
        >
          Name this onboarding workflow before assigning an owner.
        </div>
      </div>
    );
  }

  if (stage.activeTarget === "repair") {
    return (
      <div
        id={isMeasurement ? undefined : "flowr-mock-target-content-repair"}
        className={`flowr-mock-target-content flowr-mock-target-content--repair ${stageContentClassName} w-full p-2 sm:p-4`}
      >
        <p className="flowr-mock-target-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a263f] sm:text-xs sm:tracking-[0.14em]">
          Changed selector
        </p>
        <div
          id={isMeasurement ? undefined : "flowr-mock-repair-card"}
          className="flowr-mock-target-card flowr-mock-repair-card mt-1.5 rounded-md border border-[#eadfd8] bg-white p-2 sm:mt-2 sm:p-3"
        >
          <p className="flowr-mock-repair-title text-xs font-semibold text-[#201916] sm:text-sm">
            Owner field moved
          </p>
          <div className="flowr-mock-repair-line mt-2 h-1.5 w-full rounded-sm bg-[#e7ddd7] sm:mt-3 sm:h-2" />
          <div className="flowr-mock-repair-line mt-1.5 h-1.5 w-2/3 rounded-sm bg-[#e7ddd7] sm:mt-2 sm:h-2" />
          <button
            id={isMeasurement ? undefined : "flowr-mock-repair-button"}
            ref={(element) => {
              targetRef?.(element);
            }}
            className="flowr-mock-repair-button ml-auto mt-2 block rounded-md bg-[#7a263f] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm sm:mt-4 sm:px-3 sm:py-2 sm:text-sm"
            type="button"
          >
            Reconnect target
          </button>
        </div>
      </div>
    );
  }

  if (stage.activeTarget === "share") {
    return (
      <div
        id={isMeasurement ? undefined : "flowr-mock-target-content-share"}
        className={`flowr-mock-target-content flowr-mock-target-content--share ${stageContentClassName} w-full p-2 sm:p-5`}
      >
        <p className="flowr-mock-target-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a263f] sm:text-xs sm:tracking-[0.14em]">
          Workflow library
        </p>
        <div
          id={isMeasurement ? undefined : "flowr-mock-share-item"}
          className="flowr-mock-target-card flowr-mock-share-item mt-1.5 flex items-center gap-2 overflow-visible rounded-md border border-[#e5c6d1] bg-white p-2 sm:mt-3 sm:gap-4 sm:p-4"
        >
          <div className="flowr-mock-share-copy min-w-0 flex-1 basis-0">
            <p className="flowr-mock-share-title text-xs font-semibold leading-4 text-[#201916] break-words min-[380px]:text-[13px] sm:text-base sm:leading-5">
              Customer setup walkthrough
            </p>
            <p className="flowr-mock-share-meta mt-1 text-[10px] font-medium leading-3 text-[#675f59] break-words min-[380px]:text-[11px] sm:mt-2 sm:text-sm sm:leading-5">
              5 steps - Updated today
            </p>
          </div>
          <button
            id={isMeasurement ? undefined : "flowr-mock-share-button"}
            ref={(element) => {
              targetRef?.(element);
            }}
            className="flowr-mock-share-button ml-auto grid size-8 shrink-0 place-items-center rounded-md bg-[#7a263f] text-white shadow-lg shadow-[#7a263f]/25 min-[380px]:size-9 sm:size-11"
            type="button"
            data-flowr-share-focus="true"
            aria-label="Share workflow"
          >
            <Share2 aria-hidden="true" className="size-4 sm:size-5" />
          </button>
        </div>
      </div>
    );
  }

  if (stage.activeTarget === "owner") {
    return (
      <div
        id={isMeasurement ? undefined : "flowr-mock-target-content-owner"}
        className={`flowr-mock-target-content flowr-mock-target-content--owner ${stageContentClassName} relative w-full overflow-visible p-2 sm:p-4`}
      >
        <p className="flowr-mock-target-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a263f] sm:text-xs sm:tracking-[0.14em]">
          Owner email
        </p>
        <div
          id={isMeasurement ? undefined : "flowr-mock-owner-field"}
          ref={(element) => {
            targetRef?.(element);
          }}
          className="flowr-mock-target-field flowr-mock-owner-field mt-1.5 flex h-10 items-center rounded-md border border-[#e5c6d1] bg-white px-4 text-sm font-semibold text-[#201916] sm:mt-2 sm:h-11 sm:text-base"
          data-flowr-owner-field="true"
        >
          maya@company.com
        </div>
        <div
          id={isMeasurement ? undefined : "flowr-mock-replay-tooltip"}
          className="flowr-mock-replay-tooltip absolute left-3 top-[5.5rem] w-[min(310px,calc(100%-1.5rem))] rounded-lg border border-[#7a263f]/20 bg-white p-3 shadow-xl shadow-[#7a263f]/10 sm:left-4 sm:top-24 sm:w-[310px]"
          data-flowr-replay-tooltip="true"
        >
          <span className="flowr-mock-replay-tooltip-arrow absolute -top-2 left-8 size-4 rotate-45 border-l border-t border-[#7a263f]/20 bg-white" />
          <p className="flowr-mock-replay-tooltip-kicker text-xs font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
            Step 3 of 5
          </p>
          <p className="flowr-mock-replay-tooltip-copy mt-1 text-sm font-semibold text-[#201916]">
            Choose the owner field.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id={isMeasurement ? undefined : "flowr-mock-target-content-name"}
      className={`flowr-mock-target-content flowr-mock-target-content--name ${stageContentClassName} w-full p-2 sm:p-4`}
    >
      <p className="flowr-mock-target-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a263f] sm:text-xs sm:tracking-[0.14em]">
        Workflow name
      </p>
      <div
        id={isMeasurement ? undefined : "flowr-mock-name-field"}
        ref={(element) => {
          targetRef?.(element);
        }}
        className="flowr-mock-target-field flowr-mock-name-field mt-1.5 flex h-10 items-center rounded-md border border-[#e5c6d1] bg-white px-4 text-sm font-semibold text-[#201916] sm:mt-2 sm:h-11 sm:text-base"
        data-flowr-name-field="true"
      >
        Customer setup walkthrough
      </div>
    </div>
  );
}

export function ScrollReplayIllustration() {
  const [activeStage, setActiveStage] = useState(0);
  const [measuredLayouts, setMeasuredLayouts] = useState<
    Array<MeasuredMockLayout | null>
  >([]);
  const [measuredCursorCoordinates, setMeasuredCursorCoordinates] = useState<
    Array<MeasuredCursorCoordinates | null>
  >([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stepRailRef = useRef<HTMLDivElement>(null);
  const measuredStageCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const measuredProgressBadgeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const measuredHighlightRefs = useRef<Array<HTMLDivElement | null>>([]);
  const measuredCursorTargetRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const measureFrameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateActiveStage = () => {
      frameRef.current = null;
      const rootRect = root.getBoundingClientRect();

      if (rootRect.top > window.innerHeight) {
        setActiveStage(0);
        return;
      }

      if (rootRect.bottom < 0) {
        setActiveStage(stages.length - 1);
        return;
      }

      const scrollableDistance = Math.max(
        rootRect.height - window.innerHeight,
        1,
      );
      const progress = Math.min(
        1,
        Math.max(0, -rootRect.top / scrollableDistance),
      );
      const stageProgress = Math.min(1, progress / 0.82);
      const nextStage = Math.round(stageProgress * (stages.length - 1));
      setActiveStage((current) =>
        current === nextStage ? current : nextStage,
      );
    };

    const requestUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateActiveStage);
    };

    updateActiveStage();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useLayoutEffect(() => {
    const updateMeasuredLayouts = () => {
      measureFrameRef.current = null;
      const canvas = canvasRef.current;
      const stepRail = stepRailRef.current;

      if (!canvas || !stepRail) return;

      const canvasRect = canvas.getBoundingClientRect();
      const nextStepRailRect = toCanvasPercentRect(
        stepRail.getBoundingClientRect(),
        canvasRect,
      );
      const nextLayouts = stages.map((_, index) => {
        const stageCard = measuredStageCardRefs.current[index];
        const progressBadge = measuredProgressBadgeRefs.current[index];
        const highlight = measuredHighlightRefs.current[index];

        if (!stageCard || !progressBadge || !highlight) return null;

        return {
          stageCardRect: toCanvasPercentRect(
            stageCard.getBoundingClientRect(),
            canvasRect,
          ),
          progressBadgeRect: toCanvasPercentRect(
            progressBadge.getBoundingClientRect(),
            canvasRect,
          ),
          highlightRect: toCanvasPercentRect(
            highlight.getBoundingClientRect(),
            canvasRect,
          ),
          stepRailRect: nextStepRailRect,
        };
      });
      const nextCursorCoordinates = stages.map((workflowStage, index) => {
        const targetElement = measuredCursorTargetRefs.current[index];

        if (!targetElement) return null;

        return {
          activeTarget: workflowStage.activeTarget,
          coordinates: getMeasuredCursorCoordinates(
            workflowStage.activeTarget,
            targetElement,
            canvas,
          ),
        };
      });

      setMeasuredLayouts((currentLayouts) => {
        if (areMeasuredLayoutSetsClose(currentLayouts, nextLayouts)) {
          return currentLayouts;
        }

        return nextLayouts;
      });
      setMeasuredCursorCoordinates((currentCoordinates) => {
        if (
          areMeasuredCursorCoordinateSetsClose(
            currentCoordinates,
            nextCursorCoordinates,
          )
        ) {
          return currentCoordinates;
        }

        return nextCursorCoordinates;
      });
    };

    const requestMeasure = () => {
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
      }

      measureFrameRef.current = window.requestAnimationFrame(
        updateMeasuredLayouts,
      );
    };

    requestMeasure();
    const followUpFrame = window.requestAnimationFrame(requestMeasure);
    const resizeObserver = new ResizeObserver(requestMeasure);

    if (canvasRef.current) resizeObserver.observe(canvasRef.current);
    if (stepRailRef.current) resizeObserver.observe(stepRailRef.current);
    measuredStageCardRefs.current.forEach((element) => {
      if (element) resizeObserver.observe(element);
    });
    measuredProgressBadgeRefs.current.forEach((element) => {
      if (element) resizeObserver.observe(element);
    });
    measuredHighlightRefs.current.forEach((element) => {
      if (element) resizeObserver.observe(element);
    });
    measuredCursorTargetRefs.current.forEach((element) => {
      if (element) resizeObserver.observe(element);
    });
    window.addEventListener("resize", requestMeasure);

    return () => {
      window.cancelAnimationFrame(followUpFrame);

      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
      }

      resizeObserver.disconnect();
      window.removeEventListener("resize", requestMeasure);
    };
  }, []);

  const stage = stages[activeStage];
  const StageIcon = stage.icon;
  const supportPanelsByStage = useMemo(
    () =>
      stages.map((workflowStage, index) =>
        createSupportPanels(workflowStage, measuredLayouts[index]),
      ),
    [measuredLayouts],
  );
  const supportPanels = supportPanelsByStage[activeStage];

  return (
    <section
      id="workflow"
      ref={rootRef}
      className="flowr-workflow-section relative h-[620svh] bg-[#fffaf7] text-[#201916]"
    >
      <div className="flowr-mock-sticky-stage sticky top-0 flex min-h-svh items-center overflow-hidden py-4 sm:py-6">
        <div className="flowr-mock-stage-shell mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div
            id="flowr-mock-heading"
            className="flowr-mock-heading mx-auto max-w-3xl text-center"
          >
            <p className="flowr-mock-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
              Record and replay
            </p>
            <h2 className="flowr-mock-title mt-3 text-3xl font-semibold tracking-normal sm:text-4xl lg:text-5xl">
              One browser surface, morphing with each step.
            </h2>
          </div>

          <div
            id="flowr-mock-browser"
            className="flowr-mock-browser mx-auto mt-4 max-w-6xl overflow-hidden rounded-lg border border-[#eadfd8] bg-white shadow-2xl shadow-[#7a263f]/10 sm:mt-6"
          >
            <div
              id="flowr-mock-toolbar"
              className="flowr-mock-toolbar flex items-center justify-between border-b border-[#eadfd8] bg-[#f7f1ed] px-4 py-3"
            >
              <div className="flowr-mock-window-dots flex items-center gap-2">
                <span className="flowr-mock-window-dot flowr-mock-window-dot--close size-2.5 rounded-full bg-[#ff7a70]" />
                <span className="flowr-mock-window-dot flowr-mock-window-dot--minimize size-2.5 rounded-full bg-[#ffc24a]" />
                <span className="flowr-mock-window-dot flowr-mock-window-dot--zoom size-2.5 rounded-full bg-[#4fc3a1]" />
              </div>
              <div
                id="flowr-mock-url"
                className="flowr-mock-url max-w-[180px] truncate rounded-md bg-white px-3 py-1 text-xs font-medium text-[#675f59] sm:max-w-none"
              >
                app.example.com/onboarding
              </div>
            </div>

            <div
              id="flowr-mock-canvas"
              ref={canvasRef}
              className="flowr-mock-canvas relative h-[min(56svh,560px)] min-h-[350px] overflow-hidden bg-[#fbf8f5] p-4 md:min-h-[360px] lg:min-h-[500px] sm:p-6"
            >
              <div
                id="flowr-mock-stage-card"
                className="flowr-mock-stage-card absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] items-start gap-3 rounded-lg border border-[#eadfd8] bg-white/92 p-3 shadow-lg shadow-[#7a263f]/5 backdrop-blur sm:left-6 sm:top-6 sm:max-w-xl"
                data-flowr-stage-card="true"
              >
                <div className="flowr-mock-stage-icon grid size-10 shrink-0 place-items-center rounded-md bg-[#7a263f] text-white">
                  <StageIcon aria-hidden="true" className="size-5" />
                </div>
                <div className="flowr-mock-stage-copy">
                  <p className="flowr-mock-stage-kicker text-xs font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                    {stage.kicker}
                  </p>
                  <p className="flowr-mock-stage-title mt-1 text-sm font-semibold leading-5 text-[#201916] sm:text-base">
                    {stage.title}
                  </p>
                  <p className="flowr-mock-stage-body mt-1 hidden max-w-lg text-sm leading-5 text-[#675f59] lg:block">
                    {stage.body}
                  </p>
                </div>
              </div>

              <div
                id="flowr-mock-progress-badge"
                className="flowr-mock-progress-badge absolute right-4 top-4 z-10 hidden rounded-lg border border-[#eadfd8] bg-white/92 px-3 py-2 text-sm font-semibold text-[#7a263f] shadow-lg shadow-[#7a263f]/5 backdrop-blur sm:right-6 sm:top-6 sm:block"
                data-flowr-progress-badge="true"
              >
                {stage.progress}
              </div>

              <div
                className="flowr-mock-measure-layer invisible pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                {stages.map((item, index) => {
                  const MeasureIcon = item.icon;

                  return (
                    <div
                      key={`measure-${item.activeTarget}`}
                      className="contents"
                    >
                      <div
                        ref={(element) => {
                          measuredStageCardRefs.current[index] = element;
                        }}
                        className="flowr-mock-stage-card absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] items-start gap-3 rounded-lg border border-[#eadfd8] bg-white/92 p-3 shadow-lg shadow-[#7a263f]/5 backdrop-blur sm:left-6 sm:top-6 sm:max-w-xl"
                      >
                        <div className="flowr-mock-stage-icon grid size-10 shrink-0 place-items-center rounded-md bg-[#7a263f] text-white">
                          <MeasureIcon aria-hidden="true" className="size-5" />
                        </div>
                        <div className="flowr-mock-stage-copy">
                          <p className="flowr-mock-stage-kicker text-xs font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                            {item.kicker}
                          </p>
                          <p className="flowr-mock-stage-title mt-1 text-sm font-semibold leading-5 text-[#201916] sm:text-base">
                            {item.title}
                          </p>
                          <p className="flowr-mock-stage-body mt-1 hidden max-w-lg text-sm leading-5 text-[#675f59] lg:block">
                            {item.body}
                          </p>
                        </div>
                      </div>

                      <div
                        ref={(element) => {
                          measuredProgressBadgeRefs.current[index] = element;
                        }}
                        className="flowr-mock-progress-badge absolute right-4 top-4 z-10 hidden rounded-lg border border-[#eadfd8] bg-white/92 px-3 py-2 text-sm font-semibold text-[#7a263f] shadow-lg shadow-[#7a263f]/5 backdrop-blur sm:right-6 sm:top-6 sm:block"
                      >
                        {item.progress}
                      </div>

                      <div
                        ref={(element) => {
                          measuredHighlightRefs.current[index] = element;
                        }}
                        className={`flowr-mock-highlight flowr-mock-highlight--${item.activeTarget} absolute z-20 min-h-[112px] min-w-[220px] max-sm:!left-4 max-sm:!right-4 max-sm:!h-auto max-sm:!min-h-0 max-sm:!w-auto rounded-lg border-2 border-[#7a263f] bg-[#fff3ee] shadow-[0_0_0_8px_rgba(122,38,63,0.12)] ${
                          item.activeTarget === "owner" ||
                          item.activeTarget === "instruction" ||
                          item.activeTarget === "share"
                            ? "overflow-visible"
                            : "overflow-hidden"
                        }`}
                        style={item.target}
                      >
                        <StageTargetContent
                          isMeasurement
                          stage={item}
                          targetRef={(element) => {
                            measuredCursorTargetRefs.current[index] = element;
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                id="flowr-mock-step-rail"
                ref={stepRailRef}
                className="flowr-mock-step-rail absolute bottom-4 left-4 right-4 z-10 grid grid-cols-5 gap-2 sm:bottom-6 sm:left-6 sm:right-6"
                aria-hidden="true"
              >
                {stages.map((item, index) => (
                  <div
                    key={item.kicker}
                    id={`flowr-mock-step-rail-segment-${index + 1}`}
                    className={`flowr-mock-step-rail-segment h-1.5 rounded-full transition-colors duration-500 ${
                      index <= activeStage
                        ? "flowr-mock-step-rail-segment--active bg-[#7a263f]"
                        : "flowr-mock-step-rail-segment--inactive bg-[#eadfd8]"
                    }`}
                  />
                ))}
              </div>

              {supportPanels.map((panel, index) => (
                <MorphingPanel
                  key={`${stage.activeTarget}-${index}`}
                  panel={panel}
                  index={index}
                  stageId={stage.activeTarget}
                />
              ))}

              <div
                id={`flowr-mock-highlight-${stage.activeTarget}`}
                className={`flowr-mock-highlight flowr-mock-highlight--${stage.activeTarget} absolute z-20 min-h-[112px] min-w-[220px] max-sm:!left-4 max-sm:!right-4 max-sm:!h-auto max-sm:!min-h-0 max-sm:!w-auto rounded-lg border-2 border-[#7a263f] bg-[#fff3ee] shadow-[0_0_0_8px_rgba(122,38,63,0.12)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  stage.activeTarget === "owner" ||
                  stage.activeTarget === "instruction" ||
                  stage.activeTarget === "share"
                    ? "overflow-visible"
                    : "overflow-hidden"
                }`}
                style={stage.target}
                data-flowr-active-target={stage.activeTarget}
                data-flowr-highlight-stage={stage.activeTarget}
              >
                <StageTargetContent key={stage.activeTarget} stage={stage} />
              </div>

              <div
                id="flowr-mock-cursor"
                className={`flowr-mock-cursor flowr-mock-cursor--${stage.cursorMode} flowr-pointer-cursor absolute z-30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  stage.cursorMode === "caret"
                    ? "flowr-pointer-cursor--caret"
                    : ""
                }`}
                style={getCursorStyle(
                  stage,
                  measuredCursorCoordinates[activeStage],
                )}
                data-flowr-cursor="true"
                data-flowr-cursor-mode={stage.cursorMode}
                data-flowr-cursor-stage={stage.activeTarget}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
