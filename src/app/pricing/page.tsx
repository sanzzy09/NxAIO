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
import { Check, Zap, Shield, Globe, Users, Database } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    description: "For individuals",
    price: "9",
    features: [
      {
        category: "Core Features",
        items: ["5 projects", "5GB storage", "Basic analytics", "Community support"]
      }
    ]
  },
  {
    name: "Pro",
    description: "For professionals",
    price: "29",
    popular: true,
    features: [
      {
        category: "Core Features",
        items: ["Unlimited projects", "50GB storage", "Advanced analytics", "Priority email support", "Custom domains"]
      }
    ]
  },
  {
    name: "Enterprise",
    description: "For organizations",
    price: "99",
    features: [
      {
        category: "Core Features",
        items: ["Unlimited storage", "SLA guarantee", "Dedicated account manager"]
      },
      {
        category: "Collaboration",
        items: ["Unlimited members", "Role-based access", "Single Sign-On (SSO)", "Team billing"]
      }
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-24 max-w-7xl">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-20 animate-fade-in-up">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              Pricing
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold font-headline tracking-tight leading-tight">
            Explore plan details
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Expand each section to see what's included in every plan.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up [animation-delay:200ms]">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative flex flex-col p-8 rounded-[2.5rem] bg-[#141414] border border-white/5 transition-all duration-500 hover:border-white/10 group",
                plan.popular && "border-white/20 shadow-2xl shadow-white/5 ring-1 ring-white/10"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-bold font-headline">{plan.name}</h3>
                <p className="text-sm text-white/30 font-medium">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-5xl font-bold tracking-tight">${plan.price}</span>
                <span className="text-white/20 font-medium">/month</span>
              </div>

              <div className="flex-1 space-y-4">
                <Accordion type="multiple" defaultValue={["item-0"]} className="space-y-3">
                  {plan.features.map((section, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`item-${idx}`} 
                      className="border-none bg-white/[0.03] rounded-2xl px-4 overflow-hidden"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-xs font-bold uppercase tracking-[0.15em] text-white/40 group-data-[state=open]:text-white transition-colors">
                        {section.category}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-3">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-white/60 animate-fade-in-up">
                            <Check className="w-4 h-4 text-white/40 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <Button 
                className={cn(
                  "w-full h-14 rounded-2xl mt-10 font-bold text-sm transition-all duration-300",
                  plan.popular 
                    ? "bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5" 
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                )}
              >
                Get started with {plan.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Enterprise Callout */}
        <div className="mt-20 p-12 rounded-[3rem] bg-white/5 border border-white/5 text-center space-y-6 animate-fade-in-up [animation-delay:400ms]">
          <h3 className="text-2xl font-bold font-headline">Need something more custom?</h3>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            We offer custom solutions for large-scale operations requiring high-volume throughput and specialized security.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="link" className="text-white font-bold h-auto py-0">Contact Sales</Button>
            <span className="text-white/10">•</span>
            <Button variant="link" className="text-white font-bold h-auto py-0">View Enterprise Docs</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
