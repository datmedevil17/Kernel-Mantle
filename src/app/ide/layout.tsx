"use client"
import type React from "react"
import { useState, useContext, createContext, useCallback } from "react"

// Create a wallet context
const WalletContext = createContext<{
  address: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}>({
  address: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

export const useWallet = () => useContext(WalletContext)

interface IDELayoutProps {
  children: React.ReactNode
}

export default function IDELayout({ children }: IDELayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = useCallback(async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        const userAddress = accounts[0]
        setAddress(userAddress)
        setIsConnected(true)
        setIsModalOpen(false)
      } else {
        alert("Please install MetaMask to connect wallet")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setIsConnected(false)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <WalletContext.Provider value={{ address, isConnected, connectWallet, disconnectWallet }}>
      <div className="h-screen flex flex-col bg-black">
        {/* Enhanced Header */}
        <header className="relative bg-black border-b border-gray-800/50 backdrop-blur-xl">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-purple-900/5"></div>

          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Logo and Navigation */}
              <div className="flex items-center space-x-8">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h1 className="text-white text-xl font-bold tracking-tight">
                    Web3 <span className="text-purple-400">IDE</span>
                  </h1>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-1">
                  {[
                    { name: "Editor", href: "/ide/editor" },
                    { name: "Audit", href: "/ide/audit" },
                    { name: "Templates", href: "/ide/plugins" },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Right side - Wallet Connection */}
              <div className="flex items-center space-x-4">
                {!isConnected ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <svg className="relative w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="relative">Connect Wallet</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    {/* Connected wallet display */}
                    <div className="flex items-center space-x-3 px-4 py-2.5 bg-gray-900/80 border border-gray-700/50 rounded-xl backdrop-blur-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-mono">{formatAddress(address!)}</span>
                    </div>

                    {/* Disconnect button */}
                    <button
                      onClick={disconnectWallet}
                      className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-105"
                      title="Disconnect Wallet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Wallet Connect Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative bg-gray-900/95 border border-gray-700/50 rounded-2xl p-8 w-full max-w-md backdrop-blur-xl">
              {/* Modal gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent rounded-2xl"></div>

              <div className="relative">
                {/* Modal header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Connect Wallet</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Connect button */}
                <button
                  onClick={connectWallet}
                  className="group relative w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl hover:shadow-purple-500/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <img src="/metamask-fox.svg" alt="MetaMask" className="relative w-6 h-6" />
                  <span className="relative">Connect with MetaMask</span>
                </button>

                {/* Additional info */}
                <p className="text-gray-400 text-sm text-center mt-4">Connect your wallet to access all IDE features</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden bg-black">{children}</div>
      </div>
    </WalletContext.Provider>
  )
}
