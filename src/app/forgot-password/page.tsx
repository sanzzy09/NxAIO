"use client";

import React, { useState } from "react";
import { Lock, ChevronLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

/**
 * ForgotPasswordPage
 * 
 * Aligned with NxAIO Bone White / Deep Shadow Grey theme.
 */
export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-primary/10">
      <div className="w-full max-w-[440px] space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-card border border-primary/10 flex items-center justify-center shadow-2xl backdrop-blur-sm group hover:rotate-6 transition-all duration-500">
              <Lock className="w-7 h-7 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="space-y-3 px-4">
            <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight text-primary">
              Restore access.
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[320px] mx-auto">
              Enter your email and we'll send a secure link to reset your account.
            </p>
          </div>
        </div>

        {/* Interactive Form Card */}
        <div className="bg-card border border-primary/5 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <Field>
                <FieldLabel className="text-muted-foreground font-bold text-[11px] uppercase tracking-[0.2em] mb-4 block">
                  Registered Email
                </FieldLabel>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within/input:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    required
                    placeholder="you@example.com" 
                    className="bg-secondary/30 border-primary/5 text-foreground h-14 pl-12 rounded-2xl focus-visible:ring-primary/20 placeholder:text-muted-foreground/30 transition-all hover:bg-secondary/50"
                  />
                </div>
              </Field>

              <Button 
                disabled={loading}
                className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl transition-all shadow-xl shadow-primary/10 text-base"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send reset link"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6 relative z-10 animate-fade-in-up">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary font-headline">Email dispatched</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A reset link has been sent to your inbox. Please check your email to continue.
                </p>
              </div>
              <Button 
                onClick={() => setSubmitted(false)}
                variant="outline" 
                className="w-full h-12 rounded-xl text-primary font-semibold hover:bg-secondary"
              >
                Try another email
              </Button>
            </div>
          )}
        </div>

        {/* Back Navigation */}
        <div className="text-center pt-4">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group px-6 py-2 rounded-full hover:bg-secondary/50"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
