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

const revealThresholds = [0, 0.005, 0.04, 0.16, 0.32, 0.5];

function getRevealConfig(isMobile: boolean) {
  return {
    enterRatio: isMobile ? 0.04 : 0.16,
    exitRatio: isMobile ? 0.005 : 0.02,
    rootMargin: isMobile ? "0px 0px 28% 0px" : "0px 0px -14% 0px",
  };
}

export function ScrollRevealController() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 767px)");
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

    let observer: IntersectionObserver | null = null;

    const connectObserver = () => {
      observer?.disconnect();
      observer = null;

      if (reducedMotion.matches) {
        targets.forEach(({ element }) => {
          element.classList.add("flowr-reveal-is-visible");
        });
        return;
      }

      const { enterRatio, exitRatio, rootMargin } = getRevealConfig(
        mobileViewport.matches,
      );

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target;

            if (entry.isIntersecting && entry.intersectionRatio >= enterRatio) {
              element.classList.add("flowr-reveal-is-visible");
              return;
            }

            if (!entry.isIntersecting || entry.intersectionRatio <= exitRatio) {
              element.classList.remove("flowr-reveal-is-visible");
            }
          });
        },
        {
          rootMargin,
          threshold: revealThresholds,
        },
      );

      targets.forEach(({ element }) => observer?.observe(element));
    };

    connectObserver();

    reducedMotion.addEventListener("change", connectObserver);
    mobileViewport.addEventListener("change", connectObserver);

    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener("change", connectObserver);
      mobileViewport.removeEventListener("change", connectObserver);
    };
  }, []);

  return null;
}
