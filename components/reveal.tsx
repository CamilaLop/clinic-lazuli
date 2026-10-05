"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const viewport = { once: true, amount: 0.12, margin: "0px 0px -24px 0px" } as const;

type RevealTag = "div" | "p" | "h1" | "h2" | "h3" | "figure" | "address" | "footer";
type RevealProps = {
  children: ReactNode;
  as?: RevealTag;
  className?: string;
  delay?: number;
};

/** A short, one-time entrance that preserves the element's semantic tag. */
export function Reveal({ children, as = "div", className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Element = motion[as];

  return (
    <Element
      className={className}
      data-reveal="text"
      initial={reduceMotion ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : delay, ease }}
    >
      {children}
    </Element>
  );
}

/** The crop opens while the photo gently settles into its frame. */
export function ImageReveal({ children, className = "", delay = 0 }: Omit<RevealProps, "as">) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`image-reveal ${className}`.trim()}
      data-reveal="image"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={viewport}
      variants={{
        hidden: { opacity: 0, clipPath: "inset(12% 0% 12% 0%)" },
        visible: {
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          transition: { duration: reduceMotion ? 0 : 1.1, delay: reduceMotion ? 0 : delay, ease },
        },
      }}
    >
      <motion.div
        className="image-reveal-content"
        variants={{
          hidden: { scale: 1.07 },
          visible: { scale: 1, transition: { duration: reduceMotion ? 0 : 1.35, delay: reduceMotion ? 0 : delay, ease } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
