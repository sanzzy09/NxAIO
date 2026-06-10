"use client";

import { Eye, EyeOff } from "lucide-react";
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
    <section className={cn("min-h-screen", className)}>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div
          className={cn(
            "flex items-center justify-center px-4 py-16 md:px-6 md:py-24",
            mediaPosition === "left" ? "lg:order-2" : "lg:order-1"
          )}
        >
          <div className="w-full max-w-md">
            <div className="mb-8">
              {heading && <h1 className="text-3xl font-bold font-headline">{heading}</h1>}
              {description && <p className="mt-2 text-base text-muted-foreground">{description}</p>}
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <FieldGroup>
                {socialProviders.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {socialProviders.map((provider, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="lg" 
                        asChild={!!provider.href} 
                        className="rounded-xl"
                        onClick={provider.onClick}
                      >
                        {provider.href ? (
                          <Link href={provider.href}>
                            {provider.icon}
                            {provider.label}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2">
                            {provider.icon}
                            {provider.label}
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                )}

                {dividerLabel && <FieldSeparator>{dividerLabel}</FieldSeparator>}

                {fields.map((field, index) => {
                  const isPassword = field.type === "password";
                  const inputId = `${fieldId}-${index}`;
                  return (
                    <Field key={index}>
                      <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
                      {isPassword ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              id={inputId}
                              type={showPassword ? "text" : "password"}
                              placeholder={field.placeholder}
                              className="h-12 pr-11 rounded-xl"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={passwordToggleLabel}
                              onClick={() => setShowPassword((value) => !value)}
                              className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-muted-foreground"
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
                                className="text-xs font-semibold text-primary/60 hover:text-primary transition-colors"
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
                          className="h-12 rounded-xl"
                        />
                      )}
                    </Field>
                  );
                })}

                {termsLabel && (
                  <Field orientation="horizontal">
                    <Checkbox id={`${fieldId}-terms`} className="mt-0.5" />
                    <FieldLabel
                      htmlFor={`${fieldId}-terms`}
                      className="font-normal text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: termsLabel }}
                    />
                  </Field>
                )}

                {submitLabel && (
                  <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/10">
                    {submitLabel}
                  </Button>
                )}
              </FieldGroup>
            </form>

            {alternatePrompt && (
              <FieldDescription className="!mt-8 text-center text-base">
                {alternatePrompt.text}{" "}
                <Link href={alternatePrompt.href} className="font-semibold text-primary hover:underline">
                  {alternatePrompt.linkLabel}
                </Link>
              </FieldDescription>
            )}
          </div>
        </div>

        {showcase && (
          <div
            className={cn(
              "relative hidden overflow-hidden lg:block",
              mediaPosition === "left" ? "lg:order-1" : "lg:order-2"
            )}
          >
            <Image
              src={showcase.image.src}
              alt={showcase.image.alt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

            {(showcase.quote || showcase.author) && (
              <div className="absolute inset-x-0 bottom-0 p-12 xl:p-20">
                {showcase.quote && (
                  <blockquote className="text-2xl font-semibold font-headline text-foreground xl:text-3xl leading-tight">
                    “{showcase.quote}”
                  </blockquote>
                )}
                {showcase.author && (
                  <div className="mt-8 flex items-center gap-4">
                    {showcase.author.avatar && (
                      <Avatar className="size-14 border-2 border-primary/20">
                        <AvatarImage
                          src={showcase.author.avatar.src}
                          alt={showcase.author.avatar.alt}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {showcase.author.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="font-bold text-foreground text-lg">{showcase.author.name}</p>
                      <p className="text-sm text-muted-foreground font-medium">{showcase.author.title}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
