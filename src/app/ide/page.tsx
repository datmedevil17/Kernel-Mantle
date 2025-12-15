// app/ide/page.tsx
'use client'
import React from 'react';
import Link from 'next/link';

export default function IDEPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="text-6xl mb-6">🚀</div>
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to Web3 IDE</h1>
        <p className="text-gray-400 text-lg mb-8">
          A comprehensive development environment for smart contracts and blockchain applications.
          Build, compile, deploy, and audit your code all in one place.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link href="/ide/editor" className="group">
            <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors border border-gray-700 hover:border-blue-500">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-white font-semibold mb-2">Code Editor</h3>
              <p className="text-gray-400 text-sm">
                Multi-language editor with syntax highlighting for Solidity, Rust, and more.
              </p>
            </div>
          </Link>
          
          <Link href="/ide/audit" className="group">
            <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors border border-gray-700 hover:border-green-500">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-white font-semibold mb-2">Security Audit</h3>
              <p className="text-gray-400 text-sm">
                Analyze your smart contracts for security vulnerabilities and best practices.
              </p>
            </div>
          </Link>
          
          <Link href="/ide/plugins" className="group">
            <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors border border-gray-700 hover:border-purple-500">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-white font-semibold mb-2">Deploy</h3>
              <p className="text-gray-400 text-sm">
                Deploy your contracts to various networks with ease and confidence.
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12">
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Multi-chain Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Real-time Compilation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Security Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}