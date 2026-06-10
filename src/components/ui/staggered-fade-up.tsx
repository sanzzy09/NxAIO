"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StaggeredFadeUpProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayStep?: number;
  initialDelay?: number;
}

/**
 * StaggeredFadeUp
 * 
 * A utility component that applies a staggered fade-in-up animation to its direct children.
 * Perfect for hero sections and feature lists.
 */
export function StaggeredFadeUp({
  children,
  className,
  delayStep = 80,
  initialDelay = 0,
  ...props
}: StaggeredFadeUpProps) {
  return (
    <div className={cn("flex flex-col gap-y-4", className)} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <div
            key={index}
            className="opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${initialDelay + index * delayStep}ms`,
              animationFillMode: "forwards",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
