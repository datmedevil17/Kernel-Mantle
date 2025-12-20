"use client"
import { useEffect } from "react"
import { Spotlight } from "@/components/home/spotlight"
import { cn } from "@/lib/utils"
import { MarqueeCards } from "@/components/ui/MarqueeCards"
import { FeaturesSectionDemo } from "@/components/FeatureSection"
import { HeroParallax } from "@/components/home/HeroParallax"
import Footer from "@/components/home/Footer"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"


export default function Home() {
  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      
      {/* Hero Section - Enhanced with uniform background */}
      <section className="relative flex h-[100vh] w-full overflow-hidden antialiased md:items-center md:justify-center bg-[#0a0a0a]">
        {/* Subtle grid pattern */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 [background-size:60px_60px] select-none opacity-[0.15]",
            "[background-image:linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)]",
          )}
        />

        {/* Enhanced spotlight with better positioning */}
        <div className="absolute inset-0">
          <Spotlight />
        </div>

        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/5 via-transparent to-transparent opacity-50" />

        <motion.div
          className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-center text-4xl font-bold text-transparent md:text-8xl leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          >
            Welcome to Web3 IDE.
          </motion.h1>
          <motion.p
            className="mx-auto mt-8 max-w-2xl text-center text-xl font-light text-neutral-400 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Build, deploy, and collaborate on decentralized projects with ease. The future of blockchain development is
            here.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row justify-center gap-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {/* Primary CTA Button */}
            <a
              href="/drag-drop"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 ease-out bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl border border-purple-500/20 hover:border-purple-400/40 shadow-lg hover:shadow-purple-500/10 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>

            {/* Secondary Button */}
            <a
              href="#features"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-neutral-300 transition-all duration-300 ease-out bg-gray-900/50 hover:bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-gray-600/60 backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* Smooth transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      {/* Hero Parallax Section - Uniform background */}
      <div id="explore" className="relative py-24 bg-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
        >
          <HeroParallax products={products} />
        </motion.div>
      </div>

      {/* Features Section - Enhanced with uniform styling */}
      <div id="features" className="relative py-24 bg-[#0a0a0a]">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
              Web3 IDE
            </span>
          </h2>
          <p className="text-neutral-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of blockchain development with our cutting-edge features
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
        >
          <FeaturesSectionDemo />
        </motion.div>
      </div>

      {/* Contracts Section - Enhanced with better spacing */}
      <section className="relative py-32 px-6 sm:px-12 overflow-hidden bg-[#0a0a0a]">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-transparent to-indigo-500" />
        </div>

        <motion.div
          className="relative z-10 w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Explore Our Contracts
          </h2>
          <MarqueeCards />
        </motion.div>
      </section>

      {/* CTA Section - Enhanced with modern styling */}
      <section className="relative py-32 px-6 sm:px-12 bg-[#0a0a0a]">
        <motion.div
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who are already creating the next generation of decentralized applications with
            our powerful Web3 IDE.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Primary CTA */}
            <a
              href="#"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-medium text-white transition-all duration-300 ease-out bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 shadow-xl hover:shadow-purple-500/20 hover:shadow-2xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Building Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/15 to-indigo-600/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>

            {/* Secondary CTA */}
            <a
              href="#"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-medium text-neutral-300 transition-all duration-300 ease-out bg-gray-900/60 hover:bg-gray-800/70 rounded-2xl border border-gray-700/60 hover:border-gray-600/70 backdrop-blur-sm"
            >
              <span className="relative z-10">View Documentation</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

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
