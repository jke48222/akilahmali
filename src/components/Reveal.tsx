"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, fade, staggerParent, inView } from "@/lib/motion";

type Props = {
  children: ReactNode;
  variant?: "fadeUp" | "fade" | "stagger";
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
};

const variants = { fadeUp, fade, stagger: staggerParent };

/** Scroll-reveal wrapper. Use variant="stagger" on a parent with <Reveal> children. */
export default function Reveal({
  children,
  variant = "fadeUp",
  className,
  delay = 0,
  as = "div",
}: Props) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}
