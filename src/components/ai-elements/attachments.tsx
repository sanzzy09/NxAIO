"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, FileText, ImageIcon } from "lucide-react";
import Image from "next/image";

export function Attachments({
  children,
  variant = "inline",
  className,
  ...props
}: React.ComponentProps<"div"> & { variant?: "inline" | "grid" }) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 px-4 pb-2",
        variant === "grid" && "grid grid-cols-2 sm:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Attachment({
  data,
  onRemove,
  children,
  className,
  ...props
}: {
  data: any;
  onRemove?: () => void;
  children: React.ReactNode;
} & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group relative flex h-16 w-32 items-center gap-2 rounded-2xl bg-background border border-primary/5 p-2 pr-8 shadow-sm transition-all hover:border-primary/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AttachmentPreview() {
  // In a real implementation, this would use a context to get data
  return (
    <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground overflow-hidden">
      <FileText className="size-6" />
    </div>
  );
}

export function AttachmentRemove() {
  // Logic handled by the parent Attachment onRemove call usually
  return (
    <button className="absolute right-1 top-1 size-6 rounded-full bg-secondary text-muted-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-white group-hover:opacity-100">
      <X className="size-3 mx-auto" />
    </button>
  );
}
