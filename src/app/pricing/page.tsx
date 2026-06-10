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
import { Check } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-24 max-w-7xl">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-20 animate-fade-in-up">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              Pricing
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold font-headline tracking-tight leading-tight">
            Transparent <br />
            <span className="text-muted-foreground/60">value scales.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose the plan that fits your creative workflow.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up [animation-delay:200ms]">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative flex flex-col p-8 rounded-[2.5rem] bg-card border border-primary/5 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group",
                plan.popular && "border-primary/20 bg-card shadow-xl ring-1 ring-primary/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-bold font-headline">{plan.name}</h3>
                <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-5xl font-bold tracking-tight text-primary">${plan.price}</span>
                <span className="text-muted-foreground/40 font-medium">/month</span>
              </div>

              <div className="flex-1 space-y-4">
                <Accordion type="multiple" defaultValue={["item-0"]} className="space-y-3">
                  {plan.features.map((section, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`item-${idx}`} 
                      className="border-none bg-secondary/30 rounded-2xl px-4 overflow-hidden"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground group-data-[state=open]:text-primary transition-colors">
                        {section.category}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-3">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground animate-fade-in-up">
                            <Check className="w-4 h-4 text-primary/40 mt-0.5" />
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
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10" 
                    : "bg-secondary text-secondary-foreground border border-primary/5 hover:bg-secondary/80"
                )}
              >
                {plan.popular ? "Start free trial" : `Join ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        {/* Enterprise Callout */}
        <div className="mt-20 p-12 rounded-[3rem] bg-primary text-primary-foreground text-center space-y-6 animate-fade-in-up [animation-delay:400ms]">
          <h3 className="text-2xl font-bold font-headline">Need a custom scale?</h3>
          <p className="text-primary-foreground/60 text-sm max-w-md mx-auto">
            We provide bespoke infrastructure for high-throughput studios and enterprise teams.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="link" className="text-primary-foreground font-bold h-auto py-0">Talk to Sales</Button>
            <span className="text-primary-foreground/10">•</span>
            <Button variant="link" className="text-primary-foreground font-bold h-auto py-0">Custom API Pricing</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
