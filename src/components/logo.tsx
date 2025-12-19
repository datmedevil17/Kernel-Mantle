"use client"

import { Code } from "lucide-react"
import { motion } from "framer-motion"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg", container: "w-6 h-6" },
    md: { icon: "w-5 h-5", text: "text-xl lg:text-2xl", container: "w-8 h-8" },
    lg: { icon: "w-8 h-8", text: "text-2xl lg:text-3xl", container: "w-12 h-12" },
  }

  return (
    <motion.div
      className={`flex items-center space-x-2 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`${sizes[size].container} bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center`}
      >
        <Code className={`${sizes[size].icon} text-white`} />
      </div>
      {showText && (
        <span
          className={`${sizes[size].text} font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent`}
        >
          Web3 IDE
        </span>
      )}
    </motion.div>
  )
}
