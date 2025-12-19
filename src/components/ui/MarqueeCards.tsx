"use client"
import { motion } from "framer-motion"
import { ContractStore } from "@/data/contracts"
import { Code, Shield, Layers, Zap, Users, Globe, Coins } from "lucide-react"
import Link from "next/link"

export const MarqueeCards = () => {
  const getContractIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("token") && lower.includes("erc20")) {
      return <Coins className="w-6 h-6 text-purple-400" />;
    }
    if (lower.includes("token") && lower.includes("erc721")) {
      return <Shield className="w-6 h-6 text-purple-300" />;
    }
    if (lower.includes("token") && lower.includes("erc1155")) {
      return <Layers className="w-6 h-6 text-purple-500" />;
    }
    if (lower.includes("marketplace")) {
      return <Globe className="w-6 h-6 text-purple-300" />;
    }
    if (lower.includes("vote") || lower.includes("split")) {
      return <Users className="w-6 h-6 text-purple-400" />;
    }
    if (lower.includes("account")) {
      return <Shield className="w-6 h-6 text-purple-300" />;
    }
    return <Code className="w-6 h-6 text-purple-200" />;
  };

  const getContractCategory = (identifier: string | string[]) => {
    if (identifier.includes("token")) return "Token";
    if (identifier.includes("account")) return "Account";
    if (identifier.includes("marketplace")) return "Marketplace";
    if (identifier.includes("vote")) return "Governance";
    if (identifier.includes("drop")) return "Distribution";
    if (identifier.includes("split")) return "Finance";
    return "Utility";
  };

  const contracts = ContractStore[0].contracts;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />

      <div className="flex animate-marquee space-x-6 hover:pause">
        {[...contracts, ...contracts].map((contract, index) => (
          <motion.div
            key={`${contract.identifier}-${index}`}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative flex-shrink-0 w-80 h-52 rounded-2xl bg-gradient-to-br from-black/40 to-purple-950/40 backdrop-blur-sm border border-purple-800 hover:border-purple-500 p-6 transition-all duration-300 cursor-pointer"
          >
            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 text-xs font-medium bg-purple-800/30 text-purple-300 rounded-full">
                {getContractCategory(contract.identifier)}
              </span>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-purple-900/30 group-hover:bg-purple-500/20 transition-colors">
                {getContractIcon(contract.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {contract.name}
                </h3>
                <p className="text-sm text-purple-400">v{contract.version}</p>
              </div>
            </div>

            <p className="text-sm text-purple-100 leading-relaxed line-clamp-3">
              {contract.description}
            </p>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-800/10 to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 60s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        .pause {
          animation-play-state: paused;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
