"use client"

import React from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LegalAccordion } from "@/components/legal/LegalAccordion";
import { Badge } from "@/components/ui/badge";

const privacySections = [
  {
    title: "Information We Collect",
    content: "We collect information required to facilitate our utility suite. This includes account credentials, profile settings (Banners, GIFs, Frames), and transient metadata for our AI services such as music prompts and image source URLs."
  },
  {
    title: "Disposable Identity Privacy",
    content: "Our Temp-Mail tool is designed for maximum privacy. Email contents are stored in volatile memory and are purged once you request a 'New Identity' or clear your session. We do not maintain logs of messages received by temporary mailboxes."
  },
  {
    title: "File Hosting Protocols",
    content: "Files uploaded to our decentralized hosting service are stored in 'Buckets' for a user-specified duration (1-90 days). After the expiration period, files are permanently deleted from our primary storage layer. Pro users may choose to extend this via the 'Extend on View' protocol."
  },
  {
    title: "AI Processing Data",
    content: "When using the Music Generator or Background Remover, your inputs are processed in isolated, GPU-accelerated environments. Source images for background removal are not stored beyond the duration of the removal task unless saved to your history."
  },
  {
    title: "Data Security & Tiered Access",
    content: "We use industry-standard encryption to secure your account data and transaction history. Usage counts for daily and weekly utility limits are stored in our secure Firestore infrastructure and are only accessible by you."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 lg:py-24 max-w-5xl">
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
            Identity Protection
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold font-headline tracking-tight leading-tight">
            Safe Creative <br />
            <span className="text-muted-foreground/60">Engineering.</span>
          </h1>
        </div>

        <div className="animate-fade-in-up [animation-delay:200ms]">
          <LegalAccordion 
            title="Privacy Protocol"
            lastUpdated="March 01, 2025"
            sections={privacySections}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
