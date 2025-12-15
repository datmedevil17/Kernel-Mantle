import { useEffect } from 'react'
import axios from 'axios'
import { useTransactionStore } from '@/stores/transactionStore'

const BLOCKSCOUT_API = 'https://blockscout-passet-hub.parity-testnet.parity.io/api'

export function useTransactions(address: string | undefined, isConnected: boolean) {
  const { setTransactions, setLoading } = useTransactionStore()

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !address) {
        setTransactions([])
        return
      }
      
      setLoading(true)
      
      try {
        const response = await axios.get(
          `${BLOCKSCOUT_API}/v2/addresses/${address}/transactions`
        )

        const formattedTransactions = response.data.items.map((tx: any) => ({
          transaction: {
            type: tx.type || '0x0',
            chainId: tx.chain_id || '0x75bc371',
            nonce: tx.nonce,
            to: tx.to?.hash || '',
            gas: tx.gas_limit || '0x0',
            gasPrice: tx.gas_price || '0x0',
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
            value: tx.value || '0x0',
            input: tx.raw_input || '0x',
            v: tx.v || '0x0',
            r: tx.r || '0x0',
            s: tx.s || '0x0',
            hash: tx.hash
          },
          sender: tx.from?.hash || '',
          success: tx.status === 'ok',
          timestamp: new Date(tx.timestamp).getTime(),
          BlockNumber: parseInt(tx.block)
        }))

        setTransactions(formattedTransactions)
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [address, isConnected, setTransactions, setLoading])
}