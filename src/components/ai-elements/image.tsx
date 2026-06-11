"use client";

import NextImage, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * Basic AI-Elements compatible Image wrapper
 */
export function Image({ className, ...props }: ImageProps & { uint8Array?: Uint8Array; mediaType?: string }) {
  // Simple check for data URI in src if string
  const isDataUri = typeof props.src === 'string' && props.src.startsWith('data:');

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <NextImage
        {...props}
        className="object-cover"
        unoptimized={isDataUri}
      />
    </div>
  );
}
