'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { makeGeminiRequest } from '../../utils/api';
import { 
  Send, Code, MessageSquare, Loader2, 
  CheckCircle, AlertCircle, Copy, Play, 
  Settings, Book 
} from 'lucide-react';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';// Add these types
import { useWriteContract,useReadContract,useSendTransaction ,useAccount} from 'wagmi';
interface ConversionResult {
  naturalLanguage?: string;
  explanation?: string;
  gasEstimate?: string;
  requirements?: string[];
  functionCall?: string;
  contractMethod?: string;
  parameters?: Array<{
    name: string;
    type: string;
    value: string;
  }>;
  abi?: string;
  error?: string;
}

const NaturalLanguageContractInteraction = () => {
  const [activeTab, setActiveTab] = useState('nl-to-contract');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contractABI, setContractABI] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [history, setHistory] = useState<Array<{
    id: number;
    input: string;
    result: ConversionResult;
    type: string;
    timestamp: string;
  }>>([]);
  const [savedCommands, setSavedCommands] = useState<Array<{
    id: number;
    command: string | undefined;
    type: string;
    timestamp: string;
  }>>([]);

  // Sample contract ABI for demonstration
  const sampleABI = `[
    {
      "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    }
  ]`;

  // Sample natural language commands
  const sampleCommands = [
    "Send 100 tokens to 0x1234567890123456789012345678901234567890",
    "Check balance of 0xabcdef1234567890abcdef1234567890abcdef12",
    "Approve 50 tokens for 0x9876543210987654321098765432109876543210",
    "Get total supply of the token",
    "Transfer 25.5 tokens from my account to Alice's wallet"
  ];

  const convertNLToContract = useCallback(async (naturalLanguage: string): Promise<ConversionResult> => {
    const prompt = `Convert this natural language command to a smart contract function call.
    
    Natural Language: "${naturalLanguage}"
    Contract ABI: ${contractABI || sampleABI}
    
    Return a valid JSON object with:
    {
      "functionCall": "the actual function call",
      "contractMethod": "method name",
      "parameters": [{"name": "param1", "type": "type1", "value": "value1"}],
      "abi": "relevant ABI fragment",
      "gasEstimate": "estimated gas",
      "explanation": "detailed explanation"
    }`;

    try {
      return await makeGeminiRequest(prompt);
    } catch (error) {
      console.error('NL to Contract conversion error:', error);
      throw new Error('Failed to convert natural language to contract call');
    }
  }, [contractABI, sampleABI]);

  const convertContractToNL = useCallback(async (contractCode: string): Promise<ConversionResult> => {
    const prompt = `Convert this smart contract function call to natural language.
    
    Contract Call: "${contractCode}"
    Contract ABI: ${contractABI || sampleABI}
    
    Return a valid JSON object with:
    {
      "naturalLanguage": "human readable description",
      "explanation": "detailed explanation",
      "gasEstimate": "estimated gas usage",
      "requirements": ["requirement1", "requirement2"]
    }`;

    try {
      return await makeGeminiRequest(prompt);
    } catch (error) {
      console.error('Contract to NL conversion error:', error);
      throw new Error('Failed to convert contract call to natural language');
    }
  }, [contractABI, sampleABI]);

  const handleProcess = useCallback(async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      let response: ConversionResult;
      
      if (activeTab === 'nl-to-contract') {
        response = await convertNLToContract(input);
      } else {
        response = await convertContractToNL(input);
      }

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from AI service');
      }

      setResult(response);
      
      // Add to history with type checking
      const historyItem = {
        id: Date.now(),
        input,
        result: response,
        type: activeTab,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);

    } catch (error) {
      setResult({ 
        error: error instanceof Error ? error.message : 'Processing failed' 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [input, activeTab, convertNLToContract, convertContractToNL]);

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const saveCommand = (command: string | undefined) => {
    const saved = {
      id: Date.now(),
      command,
      type: activeTab,
      timestamp: new Date().toLocaleString()
    };
    setSavedCommands(prev => [saved, ...prev.slice(0, 4)]);
  };

  const executeContract = async () => {
    // This would integrate with your handleDeploy/contract execution logic
    console.log('Executing contract function...');
    // You can integrate with your existing handleDeploy function here
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Natural Language Contract Interaction</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('nl-to-contract')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'nl-to-contract'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            NL → Contract
          </button>
          <button
            onClick={() => setActiveTab('contract-to-nl')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'contract-to-nl'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Contract → NL
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Contract Configuration */}
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Contract Address
                </label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x1234...abcd"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Contract ABI (Optional)
                </label>
                <textarea
                  value={contractABI}
                  onChange={(e) => setContractABI(e.target.value)}
                  placeholder="Paste contract ABI here..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  {activeTab === 'nl-to-contract' 
                    ? 'Natural Language Command' 
                    : 'Smart Contract Function Call'
                  }
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeTab === 'nl-to-contract'
                      ? 'e.g., "Send 100 tokens to Alice\'s wallet"'
                      : 'e.g., "transfer(0x1234...abcd, 100000000000000000000)"'
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleProcess}
                disabled={isProcessing || !input.trim()}
                className="mt-7 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isProcessing ? 'Processing...' : 'Convert'}</span>
              </button>
            </div>

            {/* Sample Commands */}
            {activeTab === 'nl-to-contract' && (
              <div className="mt-3">
                <p className="text-sm text-gray-400 mb-2">Sample commands:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleCommands.slice(0, 3).map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(cmd)}
                      className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                    >
                      {cmd.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="flex-1 p-4 overflow-auto">
            {result && (
              <div className="space-y-4">
                {result.error ? (
                  <div className="flex items-start space-x-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-400">Error</h3>
                      <p className="text-red-300 mt-1">{result.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Main Result */}
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-green-400 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {activeTab === 'nl-to-contract' ? 'Smart Contract Call' : 'Natural Language'}
                          </span>
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(
                              activeTab === 'nl-to-contract' 
                                ? result.functionCall 
                                : result.naturalLanguage
                            )}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => saveCommand(
                              activeTab === 'nl-to-contract' 
                                ? result.functionCall 
                                : result.naturalLanguage
                            )}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Save command"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <code className="block p-3 bg-gray-900 rounded text-green-300 font-mono text-sm overflow-x-auto">
                        {activeTab === 'nl-to-contract' ? result.functionCall : result.naturalLanguage}
                      </code>
                    </div>

                    {/* Explanation */}
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <h4 className="font-medium text-blue-400 mb-2">Explanation</h4>
                      <p className="text-gray-300">{result.explanation}</p>
                    </div>

                    {/* Parameters (for NL to Contract) */}
                    {activeTab === 'nl-to-contract' && result.parameters && (
                      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 className="font-medium text-blue-400 mb-3">Parameters</h4>
                        <div className="space-y-2">
                          {result.parameters.map((param, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-900 rounded">
                              <div>
                                <span className="font-medium text-white">{param.name}</span>
                                <span className="text-gray-400 ml-2">({param.type})</span>
                              </div>
                              <code className="text-green-300 font-mono text-sm">{param.value}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gas & Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.gasEstimate && (
                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <h4 className="font-medium text-blue-400 mb-2">Gas Estimate</h4>
                          <p className="text-gray-300">{result.gasEstimate}</p>
                        </div>
                      )}
                      {result.requirements && (
                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <h4 className="font-medium text-blue-400 mb-2">Requirements</h4>
                          <ul className="text-gray-300 space-y-1">
                            {result.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Execute Button */}
                    {activeTab === 'nl-to-contract' && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={executeContract}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 font-medium"
                        >
                          <Play className="w-5 h-5" />
                          <span>Execute Contract Function</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* History */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium text-gray-300 mb-3 flex items-center space-x-2">
              <Book className="w-4 h-4" />
              <span>Recent History</span>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => setInput(item.input)}
                >
                  <div className="text-xs text-gray-400 mb-1">{item.timestamp}</div>
                  <div className="text-sm text-white truncate">{item.input}</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {item.type === 'nl-to-contract' ? 'NL → Contract' : 'Contract → NL'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Commands */}
          <div className="p-4">
            <h3 className="font-medium text-gray-300 mb-3">Saved Commands</h3>
            <div className="space-y-2">
              {savedCommands.map((saved) => (
                <div
                  key={saved.id}
                  className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => setInput(saved.command || '')}
                    >
                  <div className="text-sm text-white truncate">{saved.command}</div>
                  <div className="text-xs text-gray-400 mt-1">{saved.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageContractInteraction;