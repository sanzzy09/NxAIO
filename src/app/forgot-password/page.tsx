"use client";

import React, { useState } from "react";
import { Key, ChevronLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

/**
 * ForgotPasswordPage
 * 
 * A responsive, centered forgot password interface.
 * Aligned with the NxAIO dark premium theme.
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
    <div className="min-h-screen bg-primary text-primary-foreground flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-white/10">
      <div className="w-full max-w-[440px] space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm group hover:rotate-6 transition-all duration-500">
              <Key className="w-7 h-7 text-primary-foreground/40 group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>

          <div className="space-y-2 px-4">
            <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight text-white">
              Forgot password?
            </h1>
            <p className="text-primary-foreground/40 text-sm sm:text-base leading-relaxed max-w-[300px] mx-auto">
              No worries, we'll send you reset instructions to your inbox.
            </p>
          </div>
        </div>

        {/* Interactive Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden group">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <Field>
                <FieldLabel className="text-primary-foreground/30 font-bold text-[10px] uppercase tracking-[0.2em] mb-3 block">
                  Email Address
                </FieldLabel>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/20 group-focus-within/input:text-primary-foreground/60 transition-colors" />
                  <Input 
                    type="email" 
                    required
                    placeholder="name@company.com" 
                    className="bg-white/5 border-white/10 text-white h-14 pl-12 rounded-2xl focus-visible:ring-primary-foreground/20 placeholder:text-white/10 transition-all hover:bg-white/[0.08]"
                  />
                </div>
              </Field>

              <Button 
                disabled={loading}
                className="w-full h-14 bg-white hover:bg-white/90 text-primary font-bold rounded-2xl transition-all shadow-xl shadow-black/20 text-base"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset password"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6 relative z-10 animate-fade-in-up">
              <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto mb-2 border border-white/10">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white font-headline">Check your email</h3>
                <p className="text-primary-foreground/40 text-sm leading-relaxed">
                  We've sent a password reset link to your email address. Please follow the instructions to reset your account.
                </p>
              </div>
              <Button 
                onClick={() => setSubmitted(false)}
                variant="ghost" 
                className="w-full h-12 rounded-xl text-primary-foreground/60 hover:text-white hover:bg-white/5 font-semibold"
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
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-foreground/40 hover:text-white transition-colors group px-6 py-2 rounded-full hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
