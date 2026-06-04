"use client";

import { createElement, useEffect, useRef, type ElementType, type ReactNode, type Ref } from "react";

type RevealProps = {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
};

/**
 * Fade-and-rise on first viewport entry. Honors prefers-reduced-motion via
 * the global CSS killswitch in globals.css.
 */
export function Reveal({
  as: As = "div",
  className = "",
  delay = 0,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-in");
          io.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // createElement (not JSX) so the polymorphic `as` tag doesn't collapse its
  // children prop type to `never` under strict JSX inference.
  return createElement(
    As,
    {
      ref: ref as Ref<HTMLElement>,
      className: `reveal ${className}`.trim(),
      style: { transitionDelay: `${delay}ms` },
    },
    children,
  );
}
