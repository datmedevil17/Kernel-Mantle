import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { useTransactionStore } from '@/stores/transactionStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccount } from 'wagmi'

interface Transaction {
  transaction: {
    hash: string;
    input: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
  };
  sender: string;
  timestamp: number;
}

interface DecodedTransaction {
  explanation: string;
  type: string;
  details: Record<string, any>;
}

export function TransactionList() {
  const { address, isConnected } = useAccount()
  useTransactions(address, isConnected)

  const { transactions, isLoading } = useTransactionStore()
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [decodingMap, setDecodingMap] = useState<Record<string, DecodedTransaction>>({})

  const decodeTransaction = async (tx: Transaction) => {
    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
        },
        data: {
          contents: [
            {
              parts: [{ 
                text: `Analyze and decode this blockchain transaction:
                Input Data: ${tx.transaction.input}
                To Address: ${tx.transaction.to}
                Value: ${parseInt(tx.transaction.value, 16) / 1e18} ETH
                Please explain what this transaction does in simple terms.`
              }],
            },
          ],
        },
      });

      const decoded = {
        explanation: response.data.candidates[0].content.parts[0].text,
        type: 'Unknown',
        details: {}
      };

      setDecodingMap(prev => ({
        ...prev,
        [tx.transaction.hash]: decoded
      }));
    } catch (error) {
      console.error('Error decoding transaction:', error);
      toast.error('Failed to decode transaction');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No transactions found
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <Card
          key={tx.transaction.hash}
          className="p-4 transition-all hover:shadow-md"
          onClick={() => setExpandedId(
            expandedId === tx.transaction.hash ? null : tx.transaction.hash
          )}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-mono text-sm">
                {tx.transaction.hash}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
              </p>
            </div>
            {expandedId === tx.transaction.hash ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>

          {expandedId === tx.transaction.hash && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">From:</span> {tx.sender}</p>
                <p><span className="text-muted-foreground">To:</span> {tx.transaction.to}</p>
                <p><span className="text-muted-foreground">Value:</span> {parseInt(tx.transaction.value, 16) / 1e18} ETH</p>
                <p><span className="text-muted-foreground">Gas:</span> {parseInt(tx.transaction.gas, 16)}</p>
                <p><span className="text-muted-foreground">Gas Price:</span> {parseInt(tx.transaction.gasPrice, 16) / 1e9} Gwei</p>
                
                {decodingMap[tx.transaction.hash] && (
                  <div className="mt-4 rounded-md bg-muted p-4">
                    <h4 className="font-medium">Transaction Analysis:</h4>
                    <p className="mt-2 text-muted-foreground">
                      {decodingMap[tx.transaction.hash].explanation}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    decodeTransaction(tx)
                  }}
                >
                  {decodingMap[tx.transaction.hash] ? 'Analyze Again' : 'Decode'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(tx.transaction.hash)
                    toast.success('Transaction hash copied')
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Hash
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}