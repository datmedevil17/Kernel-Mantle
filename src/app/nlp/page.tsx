"use client"
import { useState, useCallback } from "react"
import { makeGeminiRequest } from "@/utils/api"
import {
  Code,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Play,
  Settings,
  Book,
  Zap,
  Terminal,
  FileText,
  Hash
} from "lucide-react"
import { useWriteContract, useAccount } from "wagmi"
import { parseEther } from "viem"

interface ConversionResult {
  explanation?: string
  gasEstimate?: string
  requirements?: string[]
  functionCall?: string
  contractMethod?: string
  parameters?: Array<{
    name: string
    type: string
    value: string
  }>
  abi?: any
  error?: string
}

const NaturalLanguageContractInteraction = () => {
  const { address } = useAccount()
  const { writeContract, isPending } = useWriteContract()

  const [input, setInput] = useState("")
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [contractABI, setContractABI] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [history, setHistory] = useState<
    Array<{
      id: number
      input: string
      result: ConversionResult
      timestamp: string
    }>
  >([])
  const [savedCommands, setSavedCommands] = useState<
    Array<{
      id: number
      command: string | undefined
      timestamp: string
    }>
  >([])

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
  ]`

  const convertNLToContract = useCallback(
    async (naturalLanguage: string): Promise<ConversionResult> => {
      const prompt = `Convert this natural language command to a smart contract function call.
    
    Natural Language: "${naturalLanguage}"
    Contract ABI: ${contractABI || sampleABI}
    
    You must return ONLY a valid JSON object with this exact structure:
    {
      "functionCall": "complete function call string",
      "contractMethod": "exact function name from ABI",
      "parameters": [{"name": "param_name", "type": "solidity_type", "value": "actual_value"}],
      "abi": the exact ABI fragment for this function as JSON object (not string),
      "gasEstimate": "estimated gas amount",
      "explanation": "what this function does",
      "requirements": ["requirement1", "requirement2"]
    }
    
    Important rules:
    - For token amounts, convert to wei (multiply by 10^18)
    - Use exact parameter names and types from the ABI
    - Return the ABI fragment as a JSON object, not a string
    - Ensure all addresses are valid hex format starting with 0x`

      try {
        const response = await makeGeminiRequest(prompt)
        
        // Parse the response if it's a string
        let parsedResponse = response
        if (typeof response === 'string') {
          // Clean up the response by removing markdown code blocks if present
          const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          parsedResponse = JSON.parse(cleanedResponse)
        }

        // Validate the response structure
        if (!parsedResponse.contractMethod || !parsedResponse.parameters) {
          throw new Error("Invalid response structure from AI")
        }

        return parsedResponse
      } catch (error) {
        console.error("NL to Contract conversion error:", error)
        throw new Error("Failed to convert natural language to contract call")
      }
    },
    [contractABI, sampleABI],
  )

  const handleProcess = useCallback(async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setResult(null)

    try {
      const response = await convertNLToContract(input)

      if (!response || typeof response !== "object") {
        throw new Error("Invalid response from AI service")
      }

      setResult(response)

      const historyItem = {
        id: Date.now(),
        input,
        result: response,
        timestamp: new Date().toLocaleString(),
      }
      setHistory((prev) => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Processing failed",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [input, convertNLToContract])

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text)
    }
  }

  const saveCommand = (command: string | undefined) => {
    const saved = {
      id: Date.now(),
      command,
      timestamp: new Date().toLocaleString(),
    }
    setSavedCommands((prev) => [saved, ...prev.slice(0, 4)])
  }

  const processParameterValue = (param: { name: string; type: string; value: string }) => {
    const { type, value } = param
    
    try {
      // Handle different parameter types
      switch (type) {
        case 'uint256':
        case 'uint':
          // For token amounts, check if it's already in wei or needs conversion
          if (value.includes('.') || parseFloat(value) < 1000000) {
            // Likely a token amount that needs conversion to wei
            return parseEther(value.toString())
          }
          return BigInt(value)
        
        case 'address':
          // Validate address format
          if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
            throw new Error(`Invalid address format: ${value}`)
          }
          return value as `0x${string}`
        
        case 'bool':
          return value.toLowerCase() === 'true'
        
        case 'string':
          return value
        
        case 'bytes':
        case 'bytes32':
          return value as `0x${string}`
        
        default:
          // For other types, try to parse as number first, then return as string
          if (!isNaN(Number(value))) {
            return BigInt(value)
          }
          return value
      }
    } catch (error) {
      console.error(`Error processing parameter ${param.name}:`, error)
      throw new Error(`Invalid parameter value for ${param.name}: ${value}`)
    }
  }

  const executeContract = async () => {
    if (!result || !contractAddress || !address) {
      console.error("Missing required data for execution")
      return
    }

    try {
      if (!address) {
        throw new Error("Please connect your wallet first")
      }

      if (!result.contractMethod) {
        throw new Error("No contract method specified")
      }

      // Get the ABI - use provided ABI or try to parse from contract ABI
      let abi
      if (result.abi) {
        abi = Array.isArray(result.abi) ? result.abi : [result.abi]
      } else if (contractABI) {
        abi = JSON.parse(contractABI)
      } else {
        abi = JSON.parse(sampleABI)
      }

      // Process parameters
      const processedArgs = result.parameters?.map(processParameterValue) || []

      console.log("Executing contract with:", {
        address: contractAddress,
        abi,
        functionName: result.contractMethod,
        args: processedArgs,
      })

      await writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: result.contractMethod,
        args: processedArgs,
      })

      console.log("Contract execution initiated successfully")
    } catch (error) {
      console.error("Contract execution failed:", error)
      setResult(prev => prev ? {
        ...prev,
        error: error instanceof Error ? error.message : "Contract execution failed"
      } : null)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-black to-gray-900 pt-30">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Terminal className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Smart Contract Interface</h2>
            <p className="text-sm text-gray-400">Natural language to blockchain interaction</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Contract Configuration */}
          <div className="p-6 bg-gray-900/50 border-b border-gray-800">
            <div className="space-y-6">
              {/* Contract Address */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300 flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <span>Contract Address</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x1234567890123456789012345678901234567890"
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                    {contractAddress && (
                      <button
                        onClick={() => navigator.clipboard.writeText(contractAddress)}
                        className="p-1 text-gray-400 hover:text-emerald-400 transition-colors"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <Code className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Contract ABI */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Contract ABI (Optional)</span>
                  </div>
                  {contractABI && (
                    <button
                      onClick={() => setContractABI("")}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <textarea
                    value={contractABI}
                    onChange={(e) => setContractABI(e.target.value)}
                    placeholder='[{"inputs":[],"name":"function_name","outputs":[],"type":"function"}]'
                    rows={4}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                  />
                  <div className="absolute top-3 right-3 flex items-center space-x-2">
                    {contractABI && (
                      <button
                        onClick={() => navigator.clipboard.writeText(contractABI)}
                        className="p-1 text-gray-400 hover:text-emerald-400 transition-colors"
                        title="Copy ABI"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="p-6 border-b border-gray-800">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Natural Language Command
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder='e.g., "Send 100 tokens to 0x1234567890123456789012345678901234567890"'
                      rows={4}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || !input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg shadow-emerald-600/25 transition-all duration-200"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    <span>{isProcessing ? "Processing..." : "Convert"}</span>
                  </button>
                </div>
              </div>

              {/* Sample Commands */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Send 100 tokens to 0x1234567890123456789012345678901234567890",
                    "Check balance of 0xabcdef1234567890abcdef1234567890abcdef12",
                    "Approve 50 tokens for 0x9876543210987654321098765432109876543210"
                  ].map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(cmd)}
                      className="px-3 py-2 text-xs bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 border border-gray-700 transition-all duration-200"
                    >
                      {cmd.slice(0, 35)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1 p-6 overflow-auto">
            {result && (
              <div className="space-y-6">
                {result.error ? (
                  <div className="flex items-start space-x-4 p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-400 mb-2">Error</h3>
                      <p className="text-red-300">{result.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Main Result */}
                    <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-emerald-400 flex items-center space-x-3">
                          <div className="p-1 bg-emerald-500/10 rounded">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <span>Smart Contract Call</span>
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(result.functionCall)}
                            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => saveCommand(result.functionCall)}
                            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="Save command"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-black rounded-lg border border-gray-800">
                        <code className="text-emerald-300 font-mono text-sm break-all">
                          {result.functionCall}
                        </code>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                      <h4 className="font-semibold text-emerald-400 mb-3 flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Explanation</span>
                      </h4>
                      <p className="text-gray-300 leading-relaxed">{result.explanation}</p>
                    </div>

                    {/* Parameters */}
                    {result.parameters && (
                      <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                        <h4 className="font-semibold text-emerald-400 mb-4 flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Parameters</span>
                        </h4>
                        <div className="space-y-3">
                          {result.parameters.map((param, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div>
                                  <span className="font-medium text-white">{param.name}</span>
                                  <span className="text-gray-400 ml-2 text-sm">({param.type})</span>
                                </div>
                              </div>
                              <code className="text-emerald-300 font-mono text-sm bg-gray-900 px-3 py-1 rounded">
                                {param.value}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gas & Requirements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {result.gasEstimate && (
                        <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                          <h4 className="font-semibold text-emerald-400 mb-3 flex items-center space-x-2">
                            <Zap className="w-4 h-4" />
                            <span>Gas Estimate</span>
                          </h4>
                          <p className="text-gray-300 font-mono">{result.gasEstimate}</p>
                        </div>
                      )}
                      {result.requirements && (
                        <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
                          <h4 className="font-semibold text-emerald-400 mb-3 flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Requirements</span>
                          </h4>
                          <ul className="text-gray-300 space-y-2">
                            {result.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-center space-x-3">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Execute Button */}
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={executeContract}
                        disabled={isPending || !contractAddress || !address}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-semibold shadow-lg shadow-emerald-600/25 transition-all duration-200"
                      >
                        {isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                        <span>
                          {isPending ? "Executing..." : "Execute Contract Function"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 to-black border-l border-gray-800 flex flex-col">
          {/* History */}
          <div className="p-6 border-b border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-4 flex items-center space-x-3">
              <div className="p-1 bg-emerald-500/10 rounded">
                <Book className="w-4 h-4 text-emerald-400" />
              </div>
              <span>Recent History</span>
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-black rounded-lg border border-gray-800 cursor-pointer hover:border-emerald-500/30 hover:bg-gray-900/50 transition-all duration-200"
                  onClick={() => setInput(item.input)}
                >
                  <div className="text-xs text-gray-500 mb-2">{item.timestamp}</div>
                  <div className="text-sm text-white truncate mb-2">{item.input}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Commands */}
          <div className="p-6 flex-1">
            <h3 className="font-semibold text-gray-300 mb-4 flex items-center space-x-3">
              <div className="p-1 bg-emerald-500/10 rounded">
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
              <span>Saved Commands</span>
            </h3>
            <div className="space-y-3">
              {savedCommands.map((saved) => (
                <div
                  key={saved.id}
                  className="p-3 bg-black rounded-lg border border-gray-800 cursor-pointer hover:border-emerald-500/30 hover:bg-gray-900/50 transition-all duration-200"
                  onClick={() => setInput(saved.command || "")}
                >
                  <div className="text-sm text-white truncate mb-1">{saved.command}</div>
                  <div className="text-xs text-gray-500">{saved.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NaturalLanguageContractInteraction