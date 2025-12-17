"use client"
import { HoverEffect } from "@/components/home/CardGrid"
import type React from "react"

import { HeroParallax } from "@/components/home/HeroParallax"
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/home/Navbar"
import { Spotlight } from "@/components/home/spotlight"
import { useState } from "react"
import { Box, Lock, Search, Settings, Sparkles, Github, Twitter, DiscIcon as Discord, Mail } from "lucide-react"
import { GlowingEffect } from "@/components/home/gloweffectcards"

export default function Home() {
  const imageURLs = [
    "https://i.pinimg.com/474x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg",
    "https://i.pinimg.com/236x/72/c6/d4/72c6d49b635ae7866dce3cc60b0300b4.jpg",
    "https://i.pinimg.com/736x/15/67/5e/15675e632c5699aa7989ba48b52b9b19.jpg",
    "https://i.pinimg.com/236x/2d/da/d2/2ddad2d98db2561c5f5be3202f1abaf8.jpg",
  ]

  const navItems = [
    {
      name: "Dashboard",
      link: "dashboard",
    },
    {
      name: "Explore",
      link: "explore",
    },
    {
      name: "IDE",
      link: "ide",
    },
  ]

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen overflow-x-hidden">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
        }
        
        *:hover::-webkit-scrollbar-thumb {
          opacity: 1;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
      `}</style>

      {/* Navbar - Uncommented and Enhanced */}
      <div className="relative z-50">
        <Navbar>
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton
                variant="secondary"
                className="border-purple-500/30 text-gray-300 hover:border-purple-400 hover:text-white transition-all duration-300"
              >
                Login
              </NavbarButton>
              <NavbarButton
                variant="primary"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-500/25 transition-all duration-300"
              >
                Book a call
              </NavbarButton>
            </div>
          </NavBody>

          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            </MobileNavHeader>

            <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-gray-300 hover:text-purple-400 transition-colors duration-300"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="secondary"
                  className="w-full border-purple-500/30 text-gray-300 hover:border-purple-400"
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
                >
                  Book a call
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>

      {/* Hero Section - Enhanced */}
      <section className="relative flex min-h-screen items-center justify-center px-6 sm:px-12 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-purple-800/5"></div>

        {/* Spotlight with enhanced positioning */}
        <div className="absolute inset-0">
          <Spotlight />
        </div>

        <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-12 sm:grid-cols-2">
          {/* Left Side: Text - Enhanced */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                <span className="text-sm text-purple-300">Next-gen Web3 Development</span>
              </div>

              <h1 className="text-5xl font-bold sm:text-7xl lg:text-8xl leading-tight">
                Welcome to <br />
                <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                  Web3 IDE
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Build, deploy, and collaborate on decentralized projects with ease. The future of blockchain development
                is here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 font-semibold text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">Get Started</span>
              </button>

              <button className="px-8 py-4 rounded-xl border border-purple-500/30 font-semibold text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-500/10 transition-all duration-300 backdrop-blur-sm">
                View Demo
              </button>
            </div>
          </div>

          {/* Right Side: Enhanced 3D Placeholder */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative h-[500px] w-full overflow-hidden border-2 border-purple-500/30 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-purple-900/10 to-transparent hover:border-purple-400/50 transition-all duration-500 group-hover:scale-105">
              <img
                src="https://i.pinimg.com/736x/3c/53/99/3c5399ef4a7b2f6575361c0935c61170.jpg"
                alt="Web3 Development"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-purple-900/20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Parallax Section - Enhanced */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
        <HeroParallax products={products} />
      </div>

      {/* 3D Marquee Section - Enhanced */}
      <section className="relative z-10 min-h-[600px] overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-purple-900/5"></div>
        <div className="relative max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by <span className="text-purple-400">Innovators</span>
            </h2>
            <p className="text-gray-400 text-lg">Join the ecosystem of next-generation builders</p>
          </div>
          <HoverEffect items={projects} />
        </div>
      </section>

      {/* Grid Section - Enhanced */}
      <section className="relative py-20 px-6 sm:px-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="text-purple-400">Web3 IDE</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the next generation of blockchain development with our cutting-edge features
            </p>
          </div>

          <ul className="grid grid-cols-1 grid-rows-none gap-6 md:grid-cols-12 md:grid-rows-3 lg:gap-6 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
              area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
              icon={<Box className="h-5 w-5 text-purple-400" />}
              title="Smart Contract Studio"
              description="Build and deploy smart contracts with our intuitive visual editor and real-time compilation."
            />

            <GridItem
              area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
              icon={<Settings className="h-5 w-5 text-purple-400" />}
              title="AI-Powered Development"
              description="Leverage AI assistance for code generation, optimization, and security auditing."
            />

            <GridItem
              area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
              icon={<Lock className="h-5 w-5 text-purple-400" />}
              title="Enterprise Security"
              description="Bank-grade security with multi-signature wallets and advanced encryption protocols."
            />

            <GridItem
              area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
              icon={<Sparkles className="h-5 w-5 text-purple-400" />}
              title="Real-time Collaboration"
              description="Work together seamlessly with live code sharing and integrated communication tools."
            />

            <GridItem
              area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
              icon={<Search className="h-5 w-5 text-purple-400" />}
              title="Multi-chain Support"
              description="Deploy across Ethereum, Polygon, Solana, and 20+ other blockchain networks."
            />
          </ul>
        </div>
      </section>

      {/* Footer - New Addition */}
      <footer className="relative border-t border-purple-500/20 bg-gradient-to-b from-transparent to-purple-900/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Web3 IDE</span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Empowering developers to build the decentralized future with cutting-edge tools, AI assistance, and
                seamless blockchain integration.
              </p>
              <div className="flex space-x-4">
                <SocialLink href="#" icon={<Github className="w-5 h-5" />} />
                <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                <SocialLink href="#" icon={<Discord className="w-5 h-5" />} />
                <SocialLink href="#" icon={<Mail className="w-5 h-5" />} />
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-purple-400">Platform</h3>
              <ul className="space-y-3">
                <FooterLink href="#" text="Dashboard" />
                <FooterLink href="#" text="IDE" />
                <FooterLink href="#" text="Templates" />
                <FooterLink href="#" text="Marketplace" />
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-purple-400">Resources</h3>
              <ul className="space-y-3">
                <FooterLink href="#" text="Documentation" />
                <FooterLink href="#" text="Tutorials" />
                <FooterLink href="#" text="Community" />
                <FooterLink href="#" text="Support" />
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-purple-500/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">© 2024 Web3 IDE. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <FooterLink href="#" text="Privacy Policy" />
              <FooterLink href="#" text="Terms of Service" />
              <FooterLink href="#" text="Cookie Policy" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Enhanced Grid Item Component
interface GridItemProps {
  area: string
  icon: React.ReactNode
  title: string
  description: React.ReactNode
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[16rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-purple-500/20 p-2 md:rounded-3xl md:p-3 group hover:border-purple-400/40 transition-all duration-500">
        <GlowingEffect spread={60} glow={true} disabled={false} proximity={80} inactiveZone={0.01} />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-8 bg-gradient-to-br from-purple-900/10 to-transparent backdrop-blur-sm group-hover:from-purple-900/20 transition-all duration-500">
          <div className="relative flex flex-1 flex-col justify-between gap-4">
            <div className="w-fit rounded-xl border border-purple-500/30 p-3 bg-purple-500/10 group-hover:border-purple-400/50 group-hover:bg-purple-500/20 transition-all duration-300">
              {icon}
            </div>
            <div className="space-y-4">
              <h3 className="font-sans text-xl/[1.375rem] font-semibold text-balance text-white md:text-2xl/[1.875rem] group-hover:text-purple-100 transition-colors duration-300">
                {title}
              </h3>
              <p className="font-sans text-sm/[1.125rem] text-gray-400 md:text-base/[1.375rem] group-hover:text-gray-300 transition-colors duration-300">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

// Footer Components
const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a
    href={href}
    className="w-10 h-10 rounded-lg border border-purple-500/30 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all duration-300"
  >
    {icon}
  </a>
)

const FooterLink = ({ href, text }: { href: string; text: string }) => (
  <li>
    <a href={href} className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
      {text}
    </a>
  </li>
)

// Data Arrays
export const projects = [
  {
    title: "DeFi Protocol",
    description: "A decentralized finance protocol enabling seamless yield farming and liquidity provision.",
    link: "https://stripe.com",
  },
  {
    title: "NFT Marketplace",
    description: "A next-generation NFT marketplace with advanced trading features and creator tools.",
    link: "https://netflix.com",
  },
  {
    title: "DAO Governance",
    description: "Decentralized autonomous organization platform for community-driven decision making.",
    link: "https://google.com",
  },
  {
    title: "Web3 Social",
    description: "A blockchain-based social network prioritizing user privacy and data ownership.",
    link: "https://meta.com",
  },
  {
    title: "Cross-chain Bridge",
    description: "Secure and efficient bridge protocol for seamless asset transfers across blockchains.",
    link: "https://amazon.com",
  },
  {
    title: "Smart Wallet",
    description: "Advanced multi-signature wallet with built-in DeFi integrations and security features.",
    link: "https://microsoft.com",
  },
]

export const products = [
  {
    title: "Moonbeam",
    link: "https://gomoonbeam.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/moonbeam.png",
  },
  {
    title: "Cursor",
    link: "https://cursor.so",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/cursor.png",
  },
  {
    title: "Rogue",
    link: "https://userogue.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/rogue.png",
  },
  {
    title: "Editorially",
    link: "https://editorially.org",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/editorially.png",
  },
  {
    title: "Editrix AI",
    link: "https://editrix.ai",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/editrix.png",
  },
  {
    title: "Pixel Perfect",
    link: "https://app.pixelperfect.quest",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/pixelperfect.png",
  },
  {
    title: "Algochurn",
    link: "https://algochurn.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/algochurn.png",
  },
  {
    title: "Aceternity UI",
    link: "https://ui.aceternity.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/aceternityui.png",
  },
  {
    title: "Tailwind Master Kit",
    link: "https://tailwindmasterkit.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png",
  },
  {
    title: "SmartBridge",
    link: "https://smartbridgetech.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/smartbridge.png",
  },
  {
    title: "Renderwork Studio",
    link: "https://renderwork.studio",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/renderwork.png",
  },
  {
    title: "Creme Digital",
    link: "https://cremedigital.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/cremedigital.png",
  },
  {
    title: "Golden Bells Academy",
    link: "https://goldenbellsacademy.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/goldenbellsacademy.png",
  },
  {
    title: "Invoker Labs",
    link: "https://invoker.lol",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/invoker.png",
  },
  {
    title: "E Free Invoice",
    link: "https://efreeinvoice.com",
    thumbnail: "https://aceternity.com/images/products/thumbnails/new/efreeinvoice.png",
  },
]
