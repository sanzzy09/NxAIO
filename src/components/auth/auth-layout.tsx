"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SocialProvider {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface AuthField {
  label: string;
  placeholder: string;
  type?: string;
}

export interface AuthLayoutProps {
  heading?: string;
  description?: string;
  socialProviders?: SocialProvider[];
  fields?: AuthField[];
  alternatePrompt?: {
    text: string;
    linkLabel: string;
    href: string;
  };
  forgotPasswordHref?: string;
  labels?: {
    divider?: string;
    terms?: string;
    submit?: string;
    passwordToggle?: string;
  };
  showcase?: {
    image: {
      src: string;
      alt: string;
    };
    quote?: string;
    author?: {
      name: string;
      title: string;
      avatar?: {
        src: string;
        alt: string;
      };
    };
  };
  mediaPosition?: "left" | "right";
  className?: string;
  loading?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

export function AuthLayout({
  heading,
  description,
  socialProviders = [],
  fields = [],
  alternatePrompt,
  forgotPasswordHref,
  labels = {},
  showcase,
  mediaPosition = "right",
  className,
  loading = false,
  onSubmit,
}: AuthLayoutProps) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = useId();

  const {
    divider: dividerLabel,
    terms: termsLabel,
    submit: submitLabel,
    passwordToggle: passwordToggleLabel,
  } = labels;

  return (
    <section className={cn("min-h-screen bg-background text-foreground selection:bg-primary/10 overflow-hidden", className)}>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div
          className={cn(
            "flex items-center justify-center px-6 py-12 md:px-12 md:py-24 animate-fade-in-up",
            mediaPosition === "left" ? "lg:order-2" : "lg:order-1"
          )}
        >
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-3">
              {heading && <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight leading-tight">{heading}</h1>}
              {description && <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{description}</p>}
            </div>

            <div className="space-y-6">
              {socialProviders.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {socialProviders.map((provider, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="lg" 
                      asChild={!!provider.href} 
                      className="rounded-2xl border-primary/5 hover:bg-secondary/50 h-12 transition-all font-semibold"
                      onClick={provider.onClick}
                    >
                      {provider.href ? (
                        <Link href={provider.href}>
                          {provider.icon}
                          <span className="ml-2">{provider.label}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {provider.icon}
                          <span>{provider.label}</span>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {dividerLabel && <FieldSeparator className="text-[10px] text-muted-foreground/50">{dividerLabel}</FieldSeparator>}

              <form onSubmit={onSubmit || ((e) => e.preventDefault())} className="space-y-5">
                <FieldGroup className="space-y-4">
                  {fields.map((field, index) => {
                    const isPassword = field.type === "password";
                    const inputId = `${fieldId}-${index}`;
                    return (
                      <Field key={index} className="space-y-2">
                        <FieldLabel htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">{field.label}</FieldLabel>
                        {isPassword ? (
                          <div className="space-y-2">
                            <div className="relative group/input">
                              <Input
                                id={inputId}
                                type={showPassword ? "text" : "password"}
                                placeholder={field.placeholder}
                                className="h-12 pr-11 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30 transition-all hover:bg-secondary/50"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={passwordToggleLabel}
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute right-1 top-1/2 size-10 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </Button>
                            </div>
                            {forgotPasswordHref && (
                              <div className="flex justify-end">
                                <Link 
                                  href={forgotPasswordHref} 
                                  className="text-[11px] font-bold uppercase tracking-wider text-primary/40 hover:text-primary transition-colors"
                                >
                                  Forgot password?
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input
                            id={inputId}
                            type={field.type ?? "text"}
                            placeholder={field.placeholder}
                            className="h-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30 transition-all hover:bg-secondary/50"
                          />
                        )}
                      </Field>
                    );
                  })}

                  {termsLabel && (
                    <Field orientation="horizontal" className="items-center gap-3 pt-2">
                      <Checkbox id={`${fieldId}-terms`} className="rounded-md border-primary/20" />
                      <FieldLabel
                        htmlFor={`${fieldId}-terms`}
                        className="font-medium text-[11px] text-muted-foreground leading-snug [&_a]:text-primary [&_a]:underline underline-offset-4"
                        dangerouslySetInnerHTML={{ __html: termsLabel }}
                      />
                    </Field>
                  )}

                  {submitLabel && (
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={loading}
                      className="w-full h-12 rounded-2xl text-sm font-bold shadow-xl shadow-primary/10 mt-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
                    </Button>
                  )}
                </FieldGroup>
              </form>
            </div>

            {alternatePrompt && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  {alternatePrompt.text}{" "}
                  <Link href={alternatePrompt.href} className="font-bold text-primary hover:underline underline-offset-4 transition-all">
                    {alternatePrompt.linkLabel}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {showcase && (
          <div
            className={cn(
              "relative hidden lg:block overflow-hidden",
              mediaPosition === "left" ? "lg:order-1" : "lg:order-2"
            )}
          >
            <Image
              src={showcase.image.src}
              alt={showcase.image.alt}
              fill
              className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
              priority
            />
            {/* Subtle Overlay Gradients */}
            <div className="absolute inset-0 bg-primary/30 backdrop-blur-[1px] mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/20 to-transparent opacity-80" />
            
            <div className="absolute inset-x-0 bottom-0 p-16 xl:p-24 space-y-8 animate-fade-in-up">
              {showcase.quote && (
                <blockquote className="text-3xl xl:text-4xl font-bold font-headline text-foreground leading-[1.15] tracking-tight">
                  “{showcase.quote}”
                </blockquote>
              )}
              {showcase.author && (
                <div className="flex items-center gap-5">
                  {showcase.author.avatar && (
                    <Avatar className="size-14 border-2 border-primary/10 shadow-2xl">
                      <AvatarImage
                        src={showcase.author.avatar.src}
                        alt={showcase.author.avatar.alt}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/5">
                        {showcase.author.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-bold text-foreground text-lg tracking-tight">{showcase.author.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{showcase.author.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
