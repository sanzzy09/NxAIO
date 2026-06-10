"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, CheckCircle2, Scissors } from "lucide-react";

export function ImageOptimizer() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <Card className="border-none shadow-sm bg-card/50">
      <CardHeader>
        <CardTitle className="font-headline">Ultra-Fast Image Optimizer</CardTitle>
        <CardDescription>Modern compression & cropping for social assets.</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`
            border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-200
            ${isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted-foreground/20'}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); setUploaded(true); }}
        >
          {uploaded ? (
            <div className="text-center animate-fade-in-up">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="font-medium mb-4">Image Processed Successfully!</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" className="gap-2">
                  <Scissors className="w-4 h-4" /> Crop (1:1)
                </Button>
                <Button size="sm">Download Optimized</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 bg-muted rounded-full mb-4">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-center">Drop your assets here</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP (Max 20MB)</p>
              <Button variant="link" className="mt-2 h-auto py-0">Or browse files</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
