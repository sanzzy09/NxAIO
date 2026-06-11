"use client"

import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Shield, FileText, ChevronDown } from "lucide-react";
import { GradualSpacingText } from "@/components/ui/gradual-spacing-text";
import { cn } from "@/lib/utils";

interface PolicySection {
  title: string;
  content: string;
}

interface LegalAccordionProps {
  title: string;
  lastUpdated: string;
  sections: PolicySection[];
  className?: string;
}

export function LegalAccordion({ title, lastUpdated, sections, className }: LegalAccordionProps) {
  return (
    <div className={cn(
      "w-full max-w-3xl mx-auto bg-primary text-primary-foreground rounded-[2rem] overflow-hidden shadow-2xl border border-white/5",
      className
    )}>
      {/* Header */}
      <div className="p-8 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-headline font-bold">
            <GradualSpacingText text={title} className="justify-start" />
          </h1>
        </div>
        <p className="text-sm text-primary-foreground/40 font-medium animate-fade-in-up [animation-delay:400ms]">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Accordion */}
      <Accordion type="single" collapsible className="w-full animate-fade-in-up [animation-delay:600ms]">
        {sections.map((section, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border-white/5 px-4 last:border-0"
          >
            <AccordionTrigger className="hover:no-underline py-6 px-4 group">
              <div className="flex items-center gap-4 text-left">
                <FileText className="w-4 h-4 text-primary-foreground/40 group-data-[state=open]:text-primary-foreground transition-colors" />
                <span className="font-headline font-semibold text-base">
                  {section.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-12 pb-6 text-primary-foreground/60 leading-relaxed text-sm">
              <div className="animate-fade-in-up">
                {section.content}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Footer */}
      <div className="p-8 text-center border-t border-white/5 animate-fade-in-up [animation-delay:800ms]">
        <p className="text-xs text-primary-foreground/30">
          If you have questions about this policy, please <a href="#" className="text-primary-foreground underline hover:text-primary-foreground/80 transition-colors font-semibold">contact us</a>.
        </p>
      </div>
    </div>
  );
}