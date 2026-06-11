"use client"

import React from 'react'
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Contact4 } from "@/components/ui/contact-4"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />
      <main className="pt-32 pb-16">
        <Contact4 />
      </main>
      <Footer />
    </div>
  )
}