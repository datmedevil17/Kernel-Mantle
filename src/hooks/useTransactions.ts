import { useEffect } from 'react'
import axios from 'axios'
import { useTransactionStore } from '@/stores/transactionStore'

const MORPH_API = 'https://explorer-api-holesky.morphl2.io'

interface MorphTransaction {
  hash: string
  block_number: number
  timestamp: string
  from: {
    hash: string
  }
  to: {
    hash: string
  }
  value: string
  gas_limit: string
  gas_price: string
  gas_used: string
  input: string
  nonce: number
  status: string
  type: number
  position: number
  method: string
  decoded_input?: any
}

interface MorphResponse {
  items: MorphTransaction[]
  next_page_params: any
}

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
        // Use the correct Morph Holesky API v2 endpoint
        const endpoint = `${MORPH_API}/api/v2/addresses/${address}/transactions`
        
        console.log('Fetching from:', endpoint)
        
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          params: {
            filter: 'to%2Cfrom', // Filter for to and from transactions
          }
        })

        console.log('API Response:', response.data)

        if (!response.data || !response.data.items) {
          console.warn('No transactions found in response')
          setTransactions([])
          return
        }

        const transactions = response.data.items

        const formattedTransactions = transactions.map((tx: MorphTransaction) => {
          // Convert values properly
          const valueInWei = tx.value || '0'
          const gasPrice = tx.gas_price || '0'
          const gasUsed = tx.gas_used || tx.gas_limit || '0'
          
          // Ensure hex format for values
          const valueHex = valueInWei.startsWith('0x') 
            ? valueInWei 
            : `0x${parseInt(valueInWei).toString(16)}`
          
          const gasPriceHex = gasPrice.startsWith('0x') 
            ? gasPrice 
            : `0x${parseInt(gasPrice).toString(16)}`
            
          const gasHex = gasUsed.startsWith('0x') 
            ? gasUsed 
            : `0x${parseInt(gasUsed).toString(16)}`

          return {
            transaction: {
              type: '0x0',
              chainId: '2810', // Morph Holesky chain ID
              nonce: tx.nonce?.toString() || '0',
              to: tx.to?.hash || '',
              gas: gasHex,
              gasPrice: gasPriceHex,
              value: valueHex,
              input: tx.input || '0x',
              hash: tx.hash || '',
              maxPriorityFeePerGas: null,
              maxFeePerGas: null,
              v: '',
              r: '',
              s: ''
            },
            sender: tx.from?.hash || '',
            success: tx.status === 'ok' || tx.status === '1',
            timestamp: new Date(tx.timestamp).getTime(),
            BlockNumber: tx.block_number || 0
          }
        })

        console.log('Formatted transactions:', formattedTransactions)
        setTransactions(formattedTransactions)
        
      } catch (error) {
        console.error('Error fetching Morph Holesky transactions:', error)
        
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data)
          console.error('Response status:', error.response?.status)
        }
        
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [address, isConnected, setTransactions, setLoading])
}
