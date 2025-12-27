"use client";

import React from "react";
import { WobbleCard } from "./ui/wobble-card";
import Image from "next/image";

export function WobbleCardDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full min-h-[500px] lg:min-h-[300px]"
        className=""
      >
        <div className="max-w-xs relative z-10">
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Kernel AI supercharges development on MorphI2 zkEVM
          </h2>
          <p className="mt-4 text-left text-base/6 text-neutral-200">
            With over 50+ smart contract templates and AI-assisted tools, Kernel AI is the go-to IDE for developers building on Morph Layer 2.
          </p>
        </div>

        {/* Dashboard Image */}
        <div className="absolute right-4 lg:right-8 bottom-4 w-[300px] h-[200px] lg:w-[400px] lg:h-[250px] z-20">
          <Image
            src="/d2.png"
            alt="Dashboard Preview"
            width={400}
            height={250}
            className="w-full h-full object-cover rounded-2xl border-2 border-white/20 shadow-2xl"
          />
        </div>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 min-h-[300px]">
        <div className="relative z-10">
          <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Simplicity meets scale — powered by Morph zkEVM
          </h2>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            No barriers, no bottlenecks. Kernel AI helps you deploy faster, with zero guesswork.
          </p>
        </div>

        {/* Feature Image */}
        <div className="absolute right-4 top-4 w-24 h-24 lg:w-32 lg:h-32 z-20">
          <Image
            src="/d4.png"
            alt="Feature illustration"
            width={128}
            height={128}
            className="w-full h-full object-cover rounded-full border-2 border-white/30 shadow-lg"
          />
        </div>

        {/* Green themed decoration */}
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full border border-green-400/20"></div>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 lg:col-span-3 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm relative z-10">
          <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Build blazing-fast production-ready smart contracts on Morph Layer 2 today!
          </h2>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            With low gas fees and high throughput, MorphI2 offers the ideal environment for scalable, zkEVM-compatible smart contract development.
          </p>
        </div>

        {/* Code Editor Image */}
        <div className="absolute right-4 lg:right-8 bottom-4 w-[350px] h-[220px] lg:w-[450px] lg:h-[280px] z-20">
          <Image
            src="/d3.png"
            alt="Code Editor Interface"
            width={450}
            height={280}
            className="w-full h-full object-cover rounded-2xl border-2 border-white/20 shadow-2xl"
          />
        </div>

        {/* Green themed floating elements */}
        <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-green-500/20 to-transparent rounded-lg border border-green-400/25 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        </div>

        <div className="absolute bottom-20 left-8 w-12 h-12 bg-gradient-to-br from-green-500/20 to-transparent rounded-full border border-green-400/25 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      </WobbleCard>
    </div>
  );
}
