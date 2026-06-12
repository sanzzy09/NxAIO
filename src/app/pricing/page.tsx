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
import { Check, Zap, Loader2, Star, Crown, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GradualSpacingText } from "@/components/ui/gradual-spacing-text";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { siteConfig } from "@/config/site";

const plans = Object.values(siteConfig.tiers);

export default function PricingPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string, planName: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Session required",
        description: "Please sign in to select an identity tier.",
      });
      return;
    }

    if (planId === 'free') {
      toast({
        title: "Standard Identity",
        description: "You are currently operating on the foundational Starter tier.",
      });
      return;
    }

    setUpgrading(planId);
    
    try {
      // Construction of the WhatsApp order payload
      const waNumber = siteConfig.links.whatsapp.split('/').pop();
      const message = encodeURIComponent(
        `Halo Admin NxAIO, saya ingin melakukan upgrade identity ke tier *${planName}*.\n\n` +
        `*Detail Akun Logik:*\n` +
        `- Email: ${user.email}\n` +
        `- UID: ${user.uid}\n\n` +
        `Mohon instruksi selanjutnya untuk aktivasi.`
      );
      
      const waUrl = `https://wa.me/${waNumber}?text=${message}`;
      
      // Artificial delay for high-fidelity feel
      setTimeout(() => {
        window.open(waUrl, '_blank');
        setUpgrading(null);
      }, 800);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Handshake Failed",
        description: "Could not initialize secure redirection.",
      });
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-24 max-w-7xl">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-20">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              Identity Tiers
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold font-headline tracking-tight leading-tight flex flex-col items-center">
            <GradualSpacingText text="Elevate your" />
            <span className="text-muted-foreground/60">
              <GradualSpacingText text="creative power." />
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in-up [animation-delay:400ms]">
            Choose the plan that fits your workflow. Scale your daily tool identities and AI processing capacity.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up [animation-delay:600ms]">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative flex flex-col p-8 rounded-[2.5rem] bg-card border border-primary/5 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group",
                plan.popular && "border-primary/20 bg-card shadow-xl ring-1 ring-primary/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl flex items-center gap-2">
                  <Star className="size-3 fill-current" /> Most Popular
                </div>
              )}
              
              {plan.id === 'sultan' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-yellow-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl flex items-center gap-2">
                  <Crown className="size-3 fill-current" /> Elite Tier
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
                <Accordion type="multiple" defaultValue={["item-0", "item-1"]} className="space-y-3">
                  {plan.features.map((section, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`item-${idx}`} 
                      className="border-none bg-secondary/30 rounded-2xl px-4 overflow-hidden"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground group-data-[state=open]:text-primary transition-colors">
                        {section.category}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-3">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground animate-fade-in-up">
                            <Check className="w-4 h-4 text-primary/40 mt-0.5 shrink-0" />
                            <span className="text-xs font-medium leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <Button 
                onClick={() => handleUpgrade(plan.id, plan.name)}
                disabled={upgrading !== null}
                className={cn(
                  "w-full h-14 rounded-2xl mt-10 font-bold text-sm transition-all duration-300 gap-2",
                  plan.popular 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10" 
                    : plan.id === 'sultan' 
                    ? "bg-yellow-600 text-white hover:bg-yellow-700 shadow-xl shadow-yellow-500/10"
                    : "bg-secondary text-secondary-foreground border border-primary/5 hover:bg-secondary/80"
                )}
              >
                {upgrading === plan.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {plan.id !== 'free' && <MessageCircle className="size-4" />}
                    {plan.id === 'free' ? "Default Identity" : `Secure Upgrade`}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Global Benefits Info */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-in-up [animation-delay:800ms]">
           <div className="space-y-4">
              <div className="size-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Zap className="size-6" />
              </div>
              <h4 className="font-headline font-bold text-xl">Instant Redirection</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Upgrade flows are routed through our verified WhatsApp node for secure manual verification and rapid provisioning of premium logic layers.</p>
           </div>
           <div className="space-y-4">
              <div className="size-12 bg-yellow-500/10 text-yellow-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Crown className="size-6" />
              </div>
              <h4 className="font-headline font-bold text-xl">Sultan Privileges</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Unlock the elite identity frame and the highest priority in our AI processing queue, ensuring your tasks are orchestrated before standard traffic.</p>
           </div>
           <div className="space-y-4">
              <div className="size-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Check className="size-6" />
              </div>
              <h4 className="font-headline font-bold text-xl">Verified Billing</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">All transactions are handled directly with our billing team to provide a transparent, personalized upgrade experience for creators.</p>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
