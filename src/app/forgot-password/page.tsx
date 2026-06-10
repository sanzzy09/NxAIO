"use client";

import React from "react";
import { Key, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-[#e5e5e5] flex flex-col items-center justify-center px-4 selection:bg-white/10">
      <div className="w-full max-w-md space-y-10">
        {/* Centered Content */}
        <div className="text-center space-y-6">
          {/* Circular Key Icon */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
              <Key className="w-6 h-6 text-white/40" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-headline tracking-tight text-white">
              Forgot your password?
            </h1>
            <p className="text-[#888888] text-sm md:text-base leading-relaxed max-w-[320px] mx-auto">
              Enter the email linked to your account and we'll send you a link to reset your password.
            </p>
          </div>
        </div>

        {/* Dark Form Card */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <Field>
              <FieldLabel className="text-[#888888] font-semibold text-xs uppercase tracking-wider mb-2 block">
                Email
              </FieldLabel>
              <Input 
                type="email" 
                placeholder="you@example.com" 
                className="bg-[#222222] border-none text-white h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-white/20 placeholder:text-white/20"
              />
            </Field>

            <Button className="w-full h-12 bg-[#e5e5e5] hover:bg-white text-black font-bold rounded-xl transition-all shadow-lg shadow-black/20">
              Send reset link
            </Button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#888888] hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
