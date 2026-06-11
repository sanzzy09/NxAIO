"use client"

import React from "react"
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function Contact4() {
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Inquiry Dispatched",
        description: "Your message has been sent to our engineering team.",
      })
      ;(e.target as HTMLFormElement).reset()
    }, 1500)
  }

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                Get in Touch
              </Badge>
              <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl md:text-6xl">
                Let's Build the <br /> 
                <span className="text-muted-foreground/60">Future Together.</span>
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have questions about our AI utilities or identity tiers? Our engineering team is ready to help you optimize your workflow.
              </p>
            </div>
            
            <div className="grid gap-6">
              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-all group">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail className="size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Email Us</p>
                  <p className="text-lg font-bold font-headline">hello@nxaio.app</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-all group">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                  <MapPin className="size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Our Lab</p>
                  <p className="text-lg font-bold font-headline">Jakarta, Indonesia</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-all group">
                <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Phone className="size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Call Center</p>
                  <p className="text-lg font-bold font-headline">+62 (21) 555-0123</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
            <div className="relative p-8 sm:p-10 rounded-[3rem] bg-card border border-primary/5 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Full Name</label>
                    <Input 
                      required 
                      placeholder="Jane Cooper" 
                      className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Email Address</label>
                    <Input 
                      required 
                      type="email" 
                      placeholder="jane@example.com" 
                      className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Subject</label>
                  <Input 
                    required 
                    placeholder="General Inquiry" 
                    className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Your Message</label>
                  <Textarea 
                    required 
                    placeholder="How can we help you..." 
                    className="min-h-[150px] rounded-[1.5rem] bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/10 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="size-5" />
                      <span>Dispatch Message</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}