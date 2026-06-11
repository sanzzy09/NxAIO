"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { HelpCircle, Mail, Music, Zap, Shield, Cloud } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from '@/lib/utils';

const faqs = [
  {
    number: "1",
    question: "What core utilities are included in NxAIO?",
    answer: "NxAIO is a comprehensive AI Utility Suite featuring: a Disposable Temp-Mail system with OTP extraction, an AI Music Generator for high-fidelity tracks, a high-precision Background Remover, Decentralized File Hosting, and various media explorers (Anime, Movieku, Vidbox). Each tool is integrated into a unified Bone White workspace.",
    icon: <Zap className="size-4" />
  },
  {
    number: "2",
    question: "How do the Tiered Identity limits work?",
    answer: "We offer three tiers: Starter (Free), Pro, and Sultan. Limits are calculated on a daily or weekly basis. For example, Starter users get 3 Temp-Mail identities and 3 Background Removals per day, plus 5 Music generations per week. Higher tiers significantly increase these quotas and unlock premium identity assets like Banners and GIF profiles.",
    icon: <Shield className="size-4" />
  },
  {
    number: "3",
    question: "Is my temporary email data secure?",
    answer: "Yes. Our Temp-Mail identities are session-based. Messages are stored in volatile memory and are cleared once you rotate to a 'New Identity' or after a period of inactivity. We prioritize anonymity, making it perfect for testing and privacy-conscious signups.",
    icon: <Mail className="size-4" />
  },
  {
    number: "4",
    question: "How long does AI Music generation take?",
    answer: "Music generation is a complex process. Once you submit a prompt or custom lyrics, our AI engine orchestrates the track in the background. Most tracks complete within 1-2 minutes. You can track progress in real-time via the 'Live Composer Sessions' area on the Music dashboard.",
    icon: <Music className="size-4" />
  },
  {
    number: "5",
    question: "How does the File Hosting expiry work?",
    answer: "When you upload files to our Hosting service, you create a 'Bucket'. You can set these buckets to expire in 1, 7, 30, or 90 days. We also offer an 'Extend on View' feature for Pro and Sultan users, which resets the expiration timer every time someone accesses the link.",
    icon: <Cloud className="size-4" />
  }
];

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 lg:pb-24 max-w-4xl">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              Utility Guide
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold font-headline tracking-tight leading-tight">
            Master the Hub.
          </h1>
          <p className="text-muted-foreground text-lg">
            Answers to your questions about tools, limits, and identity tiers.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="animate-fade-in-up [animation-delay:200ms]">
          <Accordion 
            type="single" 
            collapsible 
            value={openItem}
            onValueChange={setOpenItem}
            className="space-y-4"
          >
            {faqs.map((faq) => {
              const itemValue = `item-${faq.number}`;
              const isOpen = openItem === itemValue;
              const isBlurred = !!openItem && openItem !== "" && !isOpen;

              return (
                <AccordionItem 
                  key={faq.number} 
                  value={itemValue}
                  className={cn(
                    "border border-primary/5 bg-card/50 rounded-3xl px-2 shadow-sm transition-all duration-500 ease-in-out",
                    isBlurred ? "blur-[2px] opacity-40 scale-[0.98] grayscale-[0.5]" : "blur-0 opacity-100 scale-100 grayscale-0",
                    isOpen ? "shadow-2xl shadow-primary/10 border-primary/20 bg-card translate-y-[-4px]" : "hover:shadow-md hover:border-primary/10"
                  )}
                >
                  <AccordionTrigger className="hover:no-underline py-6 px-4 group/trigger">
                    <div className="flex items-center gap-6 text-left w-full">
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                        isOpen ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground"
                      )}>
                        {faq.icon}
                      </div>
                      <span className={cn(
                        "font-headline font-semibold text-lg md:text-xl transition-colors duration-300",
                        isOpen ? "text-primary" : "text-foreground group-hover/trigger:text-primary/70"
                      )}>
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-20 pb-8 text-muted-foreground text-base leading-relaxed">
                    <div className="animate-fade-in-up duration-500 max-w-2xl">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Support CTA */}
        <div className="mt-24 text-center p-12 border-2 border-dashed border-primary/10 rounded-[3rem] space-y-6 animate-fade-in-up [animation-delay:400ms]">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-headline text-2xl font-bold">Still have questions?</h3>
            <p className="text-muted-foreground">Our community and support engineering team are ready to assist with your custom logic chains.</p>
          </div>
          <Button size="lg" className="rounded-full px-10 h-14 text-sm font-bold shadow-xl shadow-primary/10">
            Contact Support
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
