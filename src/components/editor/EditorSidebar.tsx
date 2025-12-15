// components/editor/EditorSidebar.tsx
'use client'
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { FileItem } from '@/types/editor';

const BLOCK_EXPLORER_URL = 'https://blockscout-passet-hub.parity-testnet.parity.io';
const FAUCET_URL = 'https://faucet.polkadot.io/?parachain=1111';

interface EditorSidebarProps {
  selectedFile: FileItem | null;
  onCompile: () => void;
  onDeploy: () => void;
  onCheck: () => void;
  onBuild: () => void;
  onRun: () => void;
  compilationResult?: {
    abi: string;
    bytecode: string;
    error?: string;
  };
  isCompiling?: boolean;
  deployedAddress: string | null;

}

const EditorSidebar = ({
  selectedFile,
  onCompile,
  onDeploy,
  onCheck,
  onBuild,
  onRun,
  compilationResult,
  isCompiling = false,
  deployedAddress,
}: EditorSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'abi' | 'bytecode'>('abi');

  if (!selectedFile) {
    return (
      <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a file to see actions</p>
        </div>
      </div>
    );
  }

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'sol':
        return 'solidity';
      case 'rs':
        return 'rust';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      default:
        return 'unknown';
    }
  };

  const language = getFileLanguage(selectedFile.name);
  const isCompiled = compilationResult && compilationResult.abi && compilationResult.bytecode;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const DropTokenButton = () => {
  const { address } = useAccount();

  const handleDropToken = async () => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    // Open faucet in new tab with the address pre-filled
    window.open(`${FAUCET_URL}&address=${address}`, '_blank');
  };

  return (
    <button
      onClick={handleDropToken}
      disabled={!address}
      className={`w-full px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 
        ${address 
          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Drop Token</span>
    </button>
  );
};

  const ExplorerButton = ({ address }: { address: string }) => (
    <a
      href={`${BLOCK_EXPLORER_URL}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      View on Block Explorer
    </a>
  );

  const renderSolidityActions = () => (
    <div className="space-y-3">
      <h3 className="text-white font-semibold text-sm mb-3">Solidity Actions</h3>
      
      <button
        onClick={onCompile}
        disabled={isCompiling}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isCompiling ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
            </svg>
            <span>Compiling...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Compile</span>
          </>
        )}
      </button>
      
      <button
        onClick={onDeploy}
        disabled={!isCompiled}
        className={`w-full px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 ${
          isCompiled 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>Deploy</span>
      </button>

      <DropTokenButton />

      {/* Compilation Results */}
      {isCompiled && (
        <div className="mt-6">
          <div className="flex border-b border-gray-600 mb-3">
            <button
              onClick={() => setActiveTab('abi')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'abi' 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ABI
            </button>
            <button
              onClick={() => setActiveTab('bytecode')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'bytecode' 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bytecode
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-400 text-xs font-medium">
                {activeTab === 'abi' ? 'CONTRACT ABI' : 'BYTECODE'}
              </h4>
              <button
                onClick={() => copyToClipboard(
                  activeTab === 'abi' ? compilationResult.abi : compilationResult.bytecode,
                  activeTab.toUpperCase()
                )}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-900 rounded p-3 text-xs text-gray-300 font-mono max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-all">
                {activeTab === 'abi' 
                  ? JSON.stringify(JSON.parse(compilationResult.abi), null, 2)
                  : compilationResult.bytecode
                }
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-gray-400 text-xs font-medium mb-2">COMPILER INFO</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Version: 0.8.19</div>
          <div>Optimizer: Enabled</div>
          <div>Runs: 200</div>
        </div>
      </div>
    </div>
  );

  const renderRustActions = () => (
    <div className="space-y-3">
      <h3 className="text-white font-semibold text-sm mb-3">Rust Actions</h3>
      
      <button
        onClick={onCheck}
        className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Check</span>
      </button>
      
      <button
        onClick={onBuild}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span>Build</span>
      </button>

      <div className="mt-6">
        <h4 className="text-gray-400 text-xs font-medium mb-2">CARGO INFO</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Edition: 2021</div>
          <div>Target: wasm32</div>
          <div>Profile: release</div>
        </div>
      </div>
    </div>
  );

  const renderJavaScriptActions = () => (
    <div className="space-y-3">
      <h3 className="text-white font-semibold text-sm mb-3">JavaScript Actions</h3>
      
      <button
        onClick={onRun}
        className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a1 1 0 001 1h4a1 1 0 001-1v-4M9 10V6a1 1 0 011-1h4a1 1 0 011 1v4" />
        </svg>
        <span>Run</span>
      </button>

      <div className="mt-6">
        <h4 className="text-gray-400 text-xs font-medium mb-2">NODE INFO</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Version: 18.x</div>
          <div>Runtime: Node.js</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-white font-semibold text-sm mb-2">Actions</h2>
        <div className="text-xs text-gray-400 mb-4">
          Language: <span className="text-white capitalize">{language}</span>
        </div>
      </div>

      {language === 'solidity' && renderSolidityActions()}
      {language === 'rust' && renderRustActions()}
      {(language === 'javascript' || language === 'typescript') && renderJavaScriptActions()}
      
      {!['solidity', 'rust', 'javascript', 'typescript'].includes(language) && (
        <div className="text-center text-gray-500">
          <p className="text-sm">No actions available for this file type</p>
        </div>
      )}

      {/* Output Section */}
      <div className="mt-8">
        <h4 className="text-gray-400 text-xs font-medium mb-2">OUTPUT</h4>
        <div className="bg-gray-900 rounded p-3 text-xs text-gray-400 font-mono min-h-[100px] max-h-32 overflow-y-auto">
          {compilationResult?.error ? (
            <div className="text-red-400">
              Error: {compilationResult.error}
            </div>
          ) : isCompiling ? (
            <div className="text-yellow-400">
              Compiling...
            </div>
          ) : isCompiled ? (
            <div className="text-green-400">
              ✓ Compilation successful
            </div>
          ) : (
            'Ready...'
          )}
        </div>
      </div>

      {deployedAddress && (
        <div className="mt-4">
          <ExplorerButton address={deployedAddress} />
        </div>
      )}
    </div>
  );
};

export default EditorSidebar;