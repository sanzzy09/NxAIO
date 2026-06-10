
"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Boxes, ChevronLeft, HelpCircle } from "lucide-react";
import Link from 'next/link';

const faqs = [
  {
    number: "1",
    question: "What tools are included in the NxAIO Hub?",
    answer: "NxAIO currently features four core modules: the Ultra-Fast Image Optimizer, the Live Creative Previewer, the Interactive Snippet Manager, and the Logic Command Center. Each is designed to streamline a specific part of the creative engineering workflow."
  },
  {
    number: "2",
    question: "How does the Logic Command Center work?",
    answer: "Our Command Center uses Genkit-powered AI to interpret natural language instructions. It can chain multiple tools together—for example, it can optimize an image and then immediately generate a React component snippet that uses that image's dimensions."
  },
  {
    number: "3",
    question: "Is my data secure during image optimization?",
    answer: "Absolutely. All image processing happens in volatile memory and is never permanently stored on our servers unless you specifically choose to save an asset to your Snippet Manager. We prioritize your privacy and data sovereignty."
  },
  {
    number: "4",
    question: "How fast is the processing engine?",
    answer: "Our infrastructure is built on high-performance GPU nodes. Image optimization typically completes in under 400ms, and AI logic inference takes only a few seconds, even for complex multi-step chains."
  },
  {
    number: "5",
    question: "Can teams collaborate on snippets?",
    answer: "Yes, our Enterprise tier includes real-time collaborative snippet libraries and shared command history, allowing your entire team to build on each other's logic chains effortlessly."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-primary/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground group-hover:rotate-12 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">NxAIO</span>
          </Link>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary rounded-full">
               <Link href="/">Back to Dashboard</Link>
             </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 lg:py-24 max-w-4xl">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              FAQ
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold font-headline tracking-tight leading-tight">
            Explore the answers
          </h1>
          <p className="text-muted-foreground text-lg">
            Click on a question to reveal its answer.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="animate-fade-in-up [animation-delay:200ms]">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.number} 
                value={`item-${faq.number}`}
                className="border border-primary/5 bg-card/50 rounded-2xl px-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline py-6 px-4">
                  <div className="flex items-center gap-6 text-left">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold font-mono text-muted-foreground">
                      {faq.number}
                    </div>
                    <span className="font-headline font-semibold text-lg md:text-xl">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-14 pb-6 text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions? */}
        <div className="mt-24 text-center p-12 border-2 border-dashed border-primary/10 rounded-[3rem] space-y-6 animate-fade-in-up [animation-delay:400ms]">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-headline text-2xl font-bold">Still have questions?</h3>
            <p className="text-muted-foreground">We're here to help you get the most out of your engineering workflow.</p>
          </div>
          <Button size="lg" className="rounded-full px-8 h-12 text-sm font-bold shadow-lg shadow-primary/10">
            Contact Support
          </Button>
        </div>
      </main>

      <footer className="border-t border-primary/5 py-12 bg-secondary/10 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-xs gap-4">
          <p>© 2025 NxAIO Engineering Studio.</p>
          <div className="flex gap-8 font-medium">
             <Link href="/" className="hover:text-primary transition-colors">Home</Link>
             <Link href="/faq" className="text-primary">FAQ</Link>
             <Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
