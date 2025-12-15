// app/ide/layout.tsx
'use client'
import React, { useState, useContext, createContext, useCallback, JSX } from 'react';

// Create a wallet context
const WalletContext = createContext<{
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}>({
  address: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface IDELayoutProps {
  children: React.ReactNode;
}

export default function IDELayout({ children }: IDELayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        const userAddress = accounts[0];
        setAddress(userAddress);
        setIsConnected(true);
        setIsModalOpen(false);
      } else {
        alert('Please install MetaMask to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <WalletContext.Provider value={{ address, isConnected, connectWallet, disconnectWallet }}>
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-white text-lg font-semibold">Web3 IDE</h1>
              <nav className="flex items-center space-x-6">
                <a href="/ide/editor" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Editor
                </a>
                <a href="/ide/audit" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Audit
                </a>
                <a href="/ide/plugins" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Templates
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isConnected ? (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 bg-gray-700 rounded-lg text-white text-sm">
                    {formatAddress(address!)}
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Wallet Connect Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Connect Wallet</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <button
                onClick={connectWallet}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <img src="/metamask-fox.svg" alt="MetaMask" className="w-6 h-6" />
                <span>Connect with MetaMask</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </WalletContext.Provider>
  );
}