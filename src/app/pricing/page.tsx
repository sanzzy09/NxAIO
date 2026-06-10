
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
import { Check, Mail, Zap, Shield, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activity";

const plans = [
  {
    id: "free",
    name: "Starter",
    description: "For individuals & trial",
    price: "0",
    features: [
      {
        category: "Daily Limits",
        items: ["3 Temp-Mail Identities", "3 AI Background Removals", "5 AI Music Tracks / week"]
      },
      {
        category: "Core Features",
        items: ["Basic AI tools access", "5GB hosting storage", "Community support"]
      }
    ]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For frequent explorers",
    price: "29",
    popular: true,
    features: [
      {
        category: "Enhanced Quotas",
        items: ["25 Temp-Mail Identities", "10 AI Background Removals", "15 AI Music Tracks / week"]
      },
      {
        category: "Premium Identity",
        items: ["Profile Banners enabled", "Avatar Frames enabled", "GIF profile photos support"]
      },
      {
        category: "Advanced Features",
        items: ["Full AI suite access", "50GB hosting storage", "Priority email support"]
      }
    ]
  },
  {
    id: "sultan",
    name: "Sultan",
    description: "For power users",
    price: "99",
    features: [
      {
        category: "Max Quotas",
        items: ["50 Temp-Mail Identities", "20 AI Background Removals", "30 AI Music Tracks / week"]
      },
      {
        category: "Elite Identity",
        items: ["Exclusive Avatar Frames", "Badge of Sultanate", "Priority Beta Access"]
      },
      {
        category: "Exclusive Access",
        items: ["Unlimited hosting storage", "Beta tool early access", "Dedicated account manager"]
      }
    ]
  }
];

export default function PricingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Session required",
        description: "Please sign in to select an identity tier.",
      });
      return;
    }

    setUpgrading(planId);
    try {
      const userRef = doc(db, "users", user.uid);
      // Simulate subscription end 1 year from now for Pro/Sultan
      const subEnd = planId === 'free' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      await updateDoc(userRef, {
        role: planId,
        subscriptionEnd: subEnd,
        updatedAt: serverTimestamp()
      });

      logActivity(db, user.uid, 'profile_update', `Identity upgraded to ${planId.toUpperCase()} tier.`);

      toast({
        title: "Identity Refreshed",
        description: `Your identity has been successfully upgraded to ${planId.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upgrade Failed",
        description: error.message,
      });
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-24 max-w-7xl">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-20 animate-fade-in-up">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              Pricing & Tiers
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold font-headline tracking-tight leading-tight">
            Choose your <br />
            <span className="text-muted-foreground/60">power level.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Scale your daily identities and tool capabilities based on your needs.
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
                <Accordion type="multiple" defaultValue={["item-0", "item-1"]} className="space-y-3">
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
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgrading !== null}
                className={cn(
                  "w-full h-14 rounded-2xl mt-10 font-bold text-sm transition-all duration-300",
                  plan.popular 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10" 
                    : "bg-secondary text-secondary-foreground border border-primary/5 hover:bg-secondary/80"
                )}
              >
                {upgrading === plan.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  plan.name === "Starter" ? "Get Started" : `Upgrade to ${plan.name}`
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center text-center gap-4">
              <Mail className="size-8 text-indigo-600" />
              <h4 className="font-headline font-bold text-lg">Identity Freedom</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Scale up to 50 identities per day with our Sultan package for maximum workflow efficiency.</p>
           </div>
           <div className="p-8 rounded-[2rem] bg-yellow-500/5 border border-yellow-500/10 flex flex-col items-center text-center gap-4">
              <Zap className="size-8 text-yellow-600" />
              <h4 className="font-headline font-bold text-lg">Instant Logic</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Our premium tiers include higher AI quotas and faster processing for all logic chains.</p>
           </div>
           <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center text-center gap-4">
              <Shield className="size-8 text-emerald-600" />
              <h4 className="font-headline font-bold text-lg">Pro Security</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Encrypted data processing and private nodes ensure your creative work remains yours.</p>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
