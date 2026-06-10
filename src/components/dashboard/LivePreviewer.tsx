"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Smartphone, Monitor, Tablet, Layers } from "lucide-react";
import Image from 'next/image';

export function LivePreviewer() {
  const [device, setDevice] = useState("mobile");

  return (
    <Card className="border-none shadow-sm bg-card/50 overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline">Live Creative Previewer</CardTitle>
        <CardDescription>See your content in real-world contexts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mobile" className="w-full" onValueChange={setDevice}>
          <div className="flex justify-center mb-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="mobile" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Smartphone className="w-4 h-4" /> Mobile
              </TabsTrigger>
              <TabsTrigger value="tablet" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Tablet className="w-4 h-4" /> Tablet
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Monitor className="w-4 h-4" /> Desktop
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="relative mx-auto bg-muted rounded-3xl p-4 aspect-[4/5] max-w-[320px] shadow-2xl border-8 border-primary/5">
             {/* Mockup Frame Content */}
             <div className="w-full h-full rounded-2xl overflow-hidden bg-background relative">
                <Image 
                  src="https://picsum.photos/seed/phone/800/1200" 
                  alt="Preview" 
                  fill 
                  className="object-cover"
                  data-ai-hint="smartphone device"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-6">
                  <div className="bg-white/90 backdrop-blur p-4 rounded-xl text-center shadow-lg transform rotate-[-2deg]">
                    <p className="text-black font-headline text-lg font-bold">Your Ad Here</p>
                    <p className="text-black/60 text-xs">Modern. Fast. AI-Driven.</p>
                  </div>
                </div>
             </div>
             {/* Device Decorators */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-primary/5 rounded-b-xl" />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
