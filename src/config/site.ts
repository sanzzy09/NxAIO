/**
 * @fileOverview Global site configuration source of truth.
 * Edit this file to change site-wide information like names, links, descriptions, and pricing tiers.
 */

export const siteConfig = {
  name: "NxAIO",
  fullName: "NxAIO Intelligent Hub",
  description: "The high-performance utility suite for modern developers. Orchestrate AI logic, anonymous identities, and creative assets with unparalleled speed.",
  url: "https://nxaio.app",
  ogImage: "https://picsum.photos/seed/nxaio-og/1200/630",
  author: "NxAIO Labs",
  links: {
    twitter: "https://twitter.com/nxaio",
    github: "https://github.com/sanzzy09",
    linkedin: "https://linkedin.com/company/nxaio",
    instagram: "https://instagram.com/nxaio",
    whatsapp: "https://wa.me/6281234567890",
    discord: "#",
  },
  contact: {
    email: "hello@nxaio.app",
    phone: "+62 (21) 555-0123",
    address: "Jakarta, Indonesia",
    coordinates: "6.2088° S, 106.8456° E",
  },
  navigation: [
    { label: 'Tools', href: '/tools' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Changelog', href: '/changelog' },
  ],
  /**
   * Identity Tiers & Pricing
   * Controls both the Pricing UI and the actual utility limits across the app.
   */
  tiers: {
    free: {
      id: "free",
      name: "Starter",
      price: "0",
      description: "For individuals & casual trial",
      popular: false,
      limits: {
        aiTokens: 64000,
        tempMail: 3,
        remover: 3,
        music: 5,
      },
      features: [
        {
          category: "Daily & Weekly Quotas",
          items: ["64K AI Agent Tokens / day", "3 Temp-Mail IDs / day", "3 AI BG Removals / day", "5 AI Music Tracks / week"]
        },
        {
          category: "Core Features",
          items: ["Standard AI tools access", "5GB file hosting storage", "Public identity profile"]
        }
      ]
    },
    pro: {
      id: "pro",
      name: "Pro",
      price: "29",
      description: "For creators & frequent builders",
      popular: true,
      limits: {
        aiTokens: 256000,
        tempMail: 25,
        remover: 10,
        music: 15,
      },
      features: [
        {
          category: "Enhanced Quotas",
          items: ["256K AI Agent Tokens / day", "25 Temp-Mail IDs / day", "10 AI BG Removals / day", "15 AI Music Tracks / week"]
        },
        {
          category: "Premium Identity",
          items: ["Profile Banners enabled", "GIF profile photos support", "Unlock Premium Frames"]
        }
      ]
    },
    sultan: {
      id: "sultan",
      name: "Sultan",
      price: "99",
      description: "For power users & agencies",
      popular: false,
      limits: {
        aiTokens: 1000000,
        tempMail: 50,
        remover: 20,
        music: 30,
      },
      features: [
        {
          category: "Maximum Quotas",
          items: ["1M AI Agent Tokens / day", "50 Temp-Mail IDs / day", "20 AI BG Removals / day", "30 AI Music Tracks / week"]
        },
        {
          category: "Elite Identity",
          items: ["Exclusive Sultan Frames", "Official 'Sultanate' Badge", "Animated identity assets"]
        }
      ]
    }
  }
};

export type SiteConfig = typeof siteConfig;
export type TierId = keyof typeof siteConfig.tiers;
