import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { useTransactionStore } from '@/stores/transactionStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Copy, ChevronDown,  Activity, ExternalLink, Zap } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccount } from 'wagmi'
import { makeGeminiRequest } from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

interface Transaction {
  transaction: {
    hash: string;
    input: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    type: string;
    chainId: string;
    nonce: string;
    maxPriorityFeePerGas: string | null;
    maxFeePerGas: string | null;
    v: string;
    r: string;
    s: string;
  };
  sender: string;
  success: boolean;
  timestamp: number;
  BlockNumber: number;
}

interface DecodedTransaction {
  explanation: string;
  type: string;
  details: Record<string, unknown>;
}

export function TransactionList() {
  const { address, isConnected } = useAccount()
  useTransactions(address, isConnected)

  const { transactions, isLoading } = useTransactionStore()
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [decodingMap, setDecodingMap] = useState<Record<string, DecodedTransaction>>({})
  const [decodingLoading, setDecodingLoading] = useState<string | null>(null)

  const decodeTransaction = async (tx: Transaction) => {
    setDecodingLoading(tx.transaction.hash)

    try {
      const valueInEth = parseInt(tx.transaction.value, 16) / 1e18
      const prompt = `Decode this Mantle blockchain transaction. Be concise.

Transaction Data:
- Input: ${tx.transaction.input.slice(0, 100)}${tx.transaction.input.length > 100 ? '...' : ''}
- To: ${tx.transaction.to}
- Value: ${valueInEth} MNT
- Status: ${tx.success ? 'Success' : 'Failed'}

Return ONLY a JSON object with exactly these fields:
{
  "type": "Transfer|Contract Call|Contract Deploy|Approval|Swap|Other",
  "explanation": "One sentence explaining what this transaction does"
}`;

      const decoded = await makeGeminiRequest(prompt);

      setDecodingMap(prev => ({
        ...prev,
        [tx.transaction.hash]: {
          explanation: decoded.explanation,
          type: decoded.type || 'Unknown',
          details: decoded.details || {}
        }
      }));
    } catch (error) {
      console.error('Error decoding transaction:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error('Invalid API key. Please check your configuration.');
        } else if (error.response?.status === 429) {
          toast.error('API rate limit exceeded. Please try again later.');
        } else {
          toast.error(`API Error: ${error.response?.status || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to decode transaction');
      }
    } finally {
      setDecodingLoading(null)
    }
  };

  const formatValue = (value: string) => {
    try {
      if (!value || value === '0x' || value === '0x0') return '0.000000'
      
      const cleanValue = value.startsWith('0x') ? value : `0x${value}`
      const valueInWei = parseInt(cleanValue, 16)
      
      if (isNaN(valueInWei)) return '0.000000'
      
      return (valueInWei / 1e18).toFixed(6)
    } catch (error) {
      console.error('Error formatting value:', error)
      return '0.000000'
    }
  }

  const formatGasPrice = (gasPrice: string) => {
    try {
      if (!gasPrice || gasPrice === '0x' || gasPrice === '0x0') return '0.00'
      
      const cleanGasPrice = gasPrice.startsWith('0x') ? gasPrice : `0x${gasPrice}`
      const gasPriceInWei = parseInt(cleanGasPrice, 16)
      
      if (isNaN(gasPriceInWei)) return '0.00'
      
      return (gasPriceInWei / 1e9).toFixed(2)
    } catch (error) {
      console.error('Error formatting gas price:', error)
      return '0.00'
    }
  }

  const formatGas = (gas: string) => {
    try {
      if (!gas || gas === '0x' || gas === '0x0') return '0'
      
      const cleanGas = gas.startsWith('0x') ? gas : `0x${gas}`
      const gasValue = parseInt(cleanGas, 16)
      
      if (isNaN(gasValue)) return '0'
      
      return gasValue.toLocaleString()
    } catch (error) {
      console.error('Error formatting gas:', error)
      return '0'
    }
  }

  const getTransactionType = (tx: Transaction) => {
    try {
      const value = parseInt(tx.transaction.value, 16)
      const hasInput = tx.transaction.input && tx.transaction.input !== '0x' && tx.transaction.input.length > 2
      
      if (value > 0 && !hasInput) return 'Transfer'
      if (hasInput && tx.transaction.to) return 'Contract Call'
      if (hasInput && !tx.transaction.to) return 'Contract Deploy'
      return 'Transaction'
    } catch (error) {
      console.error('Error determining transaction type:', error)
      return 'Transaction'
    }
  }

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-12"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-lg" />
          </div>
          <p className="text-gray-400 text-sm">Loading transactions...</p>
        </div>
      </motion.div>
    )
  }

  if (!transactions.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden p-12 text-center bg-gray-900/30 backdrop-blur-xl border-gray-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-lime-500/5 rounded-lg" />
          <div className="relative z-10 space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">No Transactions Yet</h3>
              <p className="text-gray-400 text-sm">Your transaction history will appear here once you start using the platform.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {transactions.map((tx: Transaction, index: number) => (
          <motion.div
            key={tx.transaction.hash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 bg-gray-900/30 backdrop-blur-xl border-gray-800/50 hover:border-emerald-500/30 cursor-pointer"
              onClick={() => setExpandedId(
                expandedId === tx.transaction.hash ? null : tx.transaction.hash
              )}
            >
              <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/10 to-lime-500/10 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"
                initial={false}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 backdrop-blur-sm rounded-lg border flex items-center justify-center ${
                      tx.success 
                        ? 'bg-emerald-500/20 border-emerald-500/30' 
                        : 'bg-red-500/20 border-red-500/30'
                    }`}>
                      <Activity className={`w-5 h-5 ${tx.success ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm text-white">
                          {tx.transaction.hash.slice(0, 10)}...{tx.transaction.hash.slice(-8)}
                        </p>
                        <div className={`px-2 py-1 rounded-full ${
                          tx.success 
                            ? 'bg-emerald-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          <span className={`text-xs font-medium ${
                            tx.success 
                              ? 'text-emerald-300' 
                              : 'text-red-300'
                          }`}>
                            {getTransactionType(tx)}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.success 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {tx.success ? 'Success' : 'Failed'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {formatValue(tx.transaction.value)} ETH
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatGasPrice(tx.transaction.gasPrice)} Gwei
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedId === tx.transaction.hash ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700/50"
                    >
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedId === tx.transaction.hash && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-gray-800/50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400 block mb-1">From:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-white font-mono text-xs bg-gray-800/50 px-2 py-1 rounded">
                                  {tx.sender.slice(0, 8)}...{tx.sender.slice(-6)}
                                </code>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-800/50" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(tx.sender); toast.success('Address copied') }}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-1">To:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-white font-mono text-xs bg-gray-800/50 px-2 py-1 rounded">
                                  {tx.transaction.to ? 
                                    `${tx.transaction.to.slice(0, 8)}...${tx.transaction.to.slice(-6)}` : 
                                    'Contract Creation'
                                  }
                                </code>
                                {tx.transaction.to && (
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-800/50" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(tx.transaction.to); toast.success('Address copied') }}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-1">Block:</span>
                              <span className="text-white">{tx.BlockNumber.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400 block mb-1">Gas Used:</span>
                              <span className="text-white">{formatGas(tx.transaction.gas)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-1">Gas Price:</span>
                              <span className="text-white">{formatGasPrice(tx.transaction.gasPrice)} Gwei</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-1">Nonce:</span>
                              <span className="text-white">{tx.transaction.nonce}</span>
                            </div>
                          </div>
                        </div>
                        {decodingMap[tx.transaction.hash] && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-lime-500/10 border border-emerald-500/20">
                            <div className="flex items-center space-x-2 mb-3">
                              <Zap className="h-4 w-4 text-emerald-400" />
                              <h4 className="font-medium text-white">AI Analysis</h4>
                              <div className="px-2 py-1 bg-emerald-500/20 rounded-full">
                                <span className="text-xs text-emerald-300">{decodingMap[tx.transaction.hash].type}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {decodingMap[tx.transaction.hash].explanation}
                            </p>
                          </motion.div>
                        )}
                        <div className="flex gap-3 pt-2">
                          <Button variant="outline" size="sm" disabled={decodingLoading === tx.transaction.hash} className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 hover:text-white" onClick={(e) => { e.stopPropagation(); decodeTransaction(tx) }}>
                            {decodingLoading === tx.transaction.hash ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                            ) : (
                              <Zap className="mr-2 h-4 w-4" />
                            )}
                            {decodingMap[tx.transaction.hash] ? 'Re-analyze' : 'Analyze'}
                          </Button>
                          <Button variant="outline" size="sm" className="bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 text-gray-300 hover:text-white" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(tx.transaction.hash); toast.success('Transaction hash copied') }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Hash
                          </Button>
                          <Button variant="outline" size="sm" className="bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 text-gray-300 hover:text-white" onClick={(e) => { e.stopPropagation(); window.open(`https://sepolia.mantlescan.xyz/tx/${tx.transaction.hash}`, '_blank') }}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Mantle Explorer
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}