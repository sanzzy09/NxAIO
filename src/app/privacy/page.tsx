"use client"

import React from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LegalAccordion } from "@/components/legal/LegalAccordion";
import { Badge } from "@/components/ui/badge";

const privacySections = [
  {
    title: "Information We Collect",
    content: "We collect information you provide directly to us, such as when you create an account, use our AI tools, or communicate with our support team. This may include your name, email address, and the creative prompts you input into our system."
  },
  {
    title: "How We Use Your Information",
    content: "We use the information we collect to provide, maintain, and improve our services. This includes processing your images, generating code snippets, and personalizing your dashboard experience. We do not sell your data to third parties."
  },
  {
    title: "Information Sharing",
    content: "We may share information with service providers who perform services for us, such as cloud hosting and AI model inference. We ensure all partners adhere to strict data protection standards."
  },
  {
    title: "Data Security",
    content: "We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction. Your assets are processed in secure, isolated environments."
  },
  {
    title: "Your Rights",
    content: "You have the right to access, update, or delete your personal information at any time through your dashboard. If you need assistance, our support team is ready to help."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 lg:py-24 max-w-5xl">
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Security & Trust
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold font-headline tracking-tight leading-tight">
            Our Commitment to <br />
            <span className="text-muted-foreground/60">Your Privacy.</span>
          </h1>
        </div>

        <div className="animate-fade-in-up [animation-delay:200ms]">
          <LegalAccordion 
            title="Privacy Policy"
            lastUpdated="December 15, 2024"
            sections={privacySections}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
