"use client";
import { Spotlight } from "@/components/ui/Spotlight";
import { cn } from "@/lib/utils";
import { WavyBackground } from "@/components/ui/wavy-background";
import { MarqueeCards } from "@/components/ui/MarqueeCards";
import { FeaturesSectionDemo } from "@/components/FeatureSection";
export default function Home() {
  return (
    <div className="bg-[var(--bg-panel)]">
      <section className="relative flex h-[40rem] w-full overflow-hidden rounded-md antialiased md:items-center md:justify-center">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
            "[background-image:linear-gradient(to_right,#191919_1px,transparent_1px),linear-gradient(to_bottom,#191919_1px,transparent_1px)]"
          )}
        />

        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
          <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
            Spotlight  is the new trend.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
            Spotlight effect is a great way to draw attention to a specific part
            of the page. Here, we are drawing the attention towards the text
            section of the page. I don&apos;t know why but I&apos;m running out
            of copy.
          </p>
        </div>
      </section>

    
      <section className="relative flex min-h-screen items-center justify-center px-6 sm:px-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-900/10" />
  <div className="relative z-10 w-full">
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
      Explore Our Contracts
    </h2>
    <MarqueeCards />
  </div>
      
      </section>
    </div>
  );
}
