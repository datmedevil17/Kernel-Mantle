"use client"
import { motion } from "framer-motion"
import { ContractStore } from "@/data/contracts"
import { Code, Shield, Layers, Zap, Users, Globe, Coins } from "lucide-react"
import Link from "next/link"

export const MarqueeCards = () => {
  const getContractIcon = (name: string) => {
    if (name.toLowerCase().includes("token") && name.toLowerCase().includes("erc20")) {
      return <Coins className="w-6 h-6 text-yellow-400" />;
    }
    if (name.toLowerCase().includes("token") && name.toLowerCase().includes("erc721")) {
      return <Shield className="w-6 h-6 text-blue-400" />;
    }
    if (name.toLowerCase().includes("token") && name.toLowerCase().includes("erc1155")) {
      return <Layers className="w-6 h-6 text-purple-400" />;
    }
    if (name.toLowerCase().includes("marketplace")) {
      return <Globe className="w-6 h-6 text-green-400" />;
    }
    if (name.toLowerCase().includes("vote") || name.toLowerCase().includes("split")) {
      return <Users className="w-6 h-6 text-indigo-400" />;
    }
    if (name.toLowerCase().includes("account")) {
      return <Shield className="w-6 h-6 text-cyan-400" />;
    }
    return <Code className="w-6 h-6 text-slate-400" />;
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
      <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-slate-950 to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-slate-950 to-transparent" />
      
      <div className="flex animate-marquee space-x-6 hover:pause">
        {[...contracts, ...contracts].map((contract, index) => (
          <motion.div
            key={`${contract.identifier}-${index}`}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative flex-shrink-0 w-80 h-52 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 p-6 transition-all duration-300 cursor-pointer"
          >
            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full">
                {getContractCategory(contract.identifier)}
              </span>
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-indigo-500/20 transition-colors">
                {getContractIcon(contract.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {contract.name}
                </h3>
                <p className="text-sm text-slate-400">v{contract.version}</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
              {contract.description}
            </p>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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