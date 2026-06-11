"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CornerDownLeft, Loader2, Paperclip, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PromptInputContextType {
  files: any[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
}

const PromptInputContext = React.createContext<PromptInputContextType | null>(null);

export function usePromptInputAttachments() {
  const context = React.useContext(PromptInputContext);
  if (!context) throw new Error("usePromptInputAttachments must be used within PromptInputProvider");
  return {
    files: context.files,
    remove: context.removeFile,
  };
}

export function PromptInputProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = React.useState<any[]>([]);

  const addFiles = (newFiles: File[]) => {
    const mapped = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      type: "file",
      filename: f.name,
      mediaType: f.type,
      url: URL.createObjectURL(f),
    }));
    setFiles(prev => [...prev, ...mapped]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <PromptInputContext.Provider value={{ files, addFiles, removeFile }}>
      {children}
    </PromptInputContext.Provider>
  );
}

export type PromptInputMessage = {
  text: string;
  files?: any[];
};

export function PromptInput({
  children,
  onSubmit,
  className,
  ...props
}: React.ComponentProps<"div"> & { onSubmit?: (msg: PromptInputMessage) => void }) {
  return (
    <div
      className={cn(
        "relative rounded-[2rem] border border-primary/10 bg-secondary/20 p-2 shadow-inner transition-all focus-within:border-primary/20 focus-within:bg-secondary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PromptInputBody({ children, className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-4 py-2", className)} {...props}>{children}</div>;
}

export function PromptInputTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn(
        "min-h-[60px] w-full resize-none border-none bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40",
        className
      )}
      placeholder="What would you like to know?"
      {...props}
    />
  );
}

export function PromptInputFooter({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center justify-between gap-2 px-2 pb-1", className)} {...props}>
      {children}
    </div>
  );
}

export function PromptInputTools({ children, className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-1.5", className)} {...props}>{children}</div>;
}

export function PromptInputButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-9 rounded-full px-3 gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-background/50 hover:text-foreground transition-all",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function PromptInputActionMenu({ children }: { children: React.ReactNode }) {
  return <DropdownMenu>{children}</DropdownMenu>;
}

export function PromptInputActionMenuTrigger() {
  return (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
        <Plus className="size-4" />
      </Button>
    </DropdownMenuTrigger>
  );
}

export function PromptInputActionMenuContent({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuContent align="start" className="w-56 rounded-2xl border-primary/5 bg-card shadow-2xl">
      {children}
    </DropdownMenuContent>
  );
}

export function PromptInputActionAddAttachments() {
  return (
    <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer">
      <Paperclip className="size-4 opacity-40" />
      <span className="text-xs font-bold uppercase tracking-widest">Add Attachments</span>
    </DropdownMenuItem>
  );
}

export function PromptInputActionAddScreenshot() {
  return (
    <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer">
      <Monitor className="size-4 opacity-40" />
      <span className="text-xs font-bold uppercase tracking-widest">Add Screenshot</span>
    </DropdownMenuItem>
  );
}

export function PromptInputSubmit({
  status = "ready",
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { status?: "submitted" | "streaming" | "ready" | "error" }) {
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <Button
      size="icon"
      disabled={disabled || isLoading}
      className={cn(
        "h-10 w-10 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 transition-all active:scale-90 hover:scale-105",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <CornerDownLeft className="size-5" />
      )}
    </Button>
  );
}
