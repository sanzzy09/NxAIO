/**
 * @fileOverview Global site configuration source of truth.
 * Edit this file to change site-wide information like names, links, and descriptions.
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
  ]
};

export type SiteConfig = typeof siteConfig;
