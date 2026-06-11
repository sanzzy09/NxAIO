"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradualSpacingProps {
  text: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
}

/**
 * GradualSpacingText
 * 
 * An interactive text animation component that reveals characters with gradual spacing.
 * Powered by framer-motion for smooth engineering-grade transitions.
 */
export function GradualSpacingText({
  text,
  duration = 0.5,
  delayMultiple = 0.04,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  className,
}: GradualSpacingProps) {
  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={framerProps}
          transition={{ duration, delay: i * delayMultiple }}
          className={cn(char === " " ? "w-[0.25em]" : "")}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
