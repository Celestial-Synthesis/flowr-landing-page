"use client";

import { useEffect } from "react";

const revealGroups = [
  {
    selector: "#flowr-features-grid",
    variant: "grid",
    childSelector: ".flowr-capability-card",
  },
  {
    selector: "#flowr-comparison-table-frame",
    variant: "panel",
  },
  {
    selector: "#flowr-use-cases-grid",
    variant: "grid",
    childSelector: ".flowr-use-case-card",
  },
  {
    selector: "#flowr-action-illustration",
    variant: "panel",
  },
  {
    selector: "#flowr-action-benefit-list",
    variant: "list",
    childSelector: ".flowr-action-benefit",
  },
  {
    selector: ".flowr-pricing-plan-card",
    variant: "card",
  },
];

export function ScrollRevealController() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = revealGroups.flatMap((group) =>
      Array.from(document.querySelectorAll<HTMLElement>(group.selector)).map(
        (element, index) => ({ ...group, element, index }),
      ),
    );

    targets.forEach(({ element, variant, childSelector, index }) => {
      element.classList.add("flowr-reveal-target", `flowr-reveal--${variant}`);
      element.style.setProperty("--flowr-reveal-index", String(index));

      if (childSelector) {
        element
          .querySelectorAll<HTMLElement>(childSelector)
          .forEach((child, childIndex) => {
            child.classList.add("flowr-reveal-child");
            child.style.setProperty(
              "--flowr-reveal-child-index",
              String(childIndex),
            );
          });
      }
    });

    if (reducedMotion.matches) {
      targets.forEach(({ element }) => {
        element.classList.add("flowr-reveal-is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.16) {
            element.classList.add("flowr-reveal-is-visible");
            return;
          }

          if (!entry.isIntersecting || entry.intersectionRatio <= 0.02) {
            element.classList.remove("flowr-reveal-is-visible");
          }
        });
      },
      {
        rootMargin: "0px 0px -14% 0px",
        threshold: [0, 0.02, 0.16, 0.32, 0.5],
      },
    );

    targets.forEach(({ element }) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return null;
}
