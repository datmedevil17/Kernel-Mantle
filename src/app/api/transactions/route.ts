import { NextRequest, NextResponse } from 'next/server'

// Etherscan API V2 for Mantle Sepolia Testnet
// Chain ID for Mantle Sepolia is 5003
const ETHERSCAN_V2_API = 'https://api.etherscan.io/v2/api'
const API_KEY = process.env.MANTLESCAN_API_KEY || '29EVZDHAZN3XX9JI1Y6DYWQVQE3G5QWJNE'
const CHAIN_ID = '5003' // Mantle Sepolia

interface EtherscanTransaction {
  hash: string
  blockNumber: string
  timeStamp: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  gasUsed: string
  input: string
  nonce: string
  isError: string
  txreceipt_status: string
  contractAddress: string
  functionName: string
  methodId: string
}

interface EtherscanResponse {
  status: string
  message: string
  result: EtherscanTransaction[] | string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  console.log('=== Transaction API Called ===')
  console.log('Address:', address)
  
  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Use Etherscan API V2 with chainid parameter
    const endpoint = `${ETHERSCAN_V2_API}?chainid=${CHAIN_ID}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${API_KEY}`
    
    console.log('Fetching from Etherscan V2 API')
    console.log('Chain ID:', CHAIN_ID)
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Disable caching to get fresh data
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API error response:', errorText)
      throw new Error(`Mantlescan API error: ${response.status}`)
    }

    const data: EtherscanResponse = await response.json()
    
    console.log('API response status:', data.status)
    console.log('API response message:', data.message)
    console.log('Result type:', typeof data.result)
    console.log('Result length:', Array.isArray(data.result) ? data.result.length : 'N/A')
    
    if (data.status !== '1') {
      console.log('API returned non-success status:', data.status, data.message)
      // Return empty array but don't error - might just be no transactions yet
      return NextResponse.json({ items: [] })
    }
    
    if (typeof data.result === 'string') {
      console.log('Result is string (error message):', data.result)
      return NextResponse.json({ items: [] })
    }

    // Transform Etherscan format to our expected format
    const items = data.result.map((tx: EtherscanTransaction) => ({
      hash: tx.hash,
      block_number: parseInt(tx.blockNumber),
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      from: { hash: tx.from },
      to: { hash: tx.to || '' },
      value: tx.value,
      gas_limit: tx.gas,
      gas_price: tx.gasPrice,
      gas_used: tx.gasUsed,
      input: tx.input,
      nonce: parseInt(tx.nonce),
      status: tx.txreceipt_status === '1' ? 'ok' : 'error',
      type: 0,
      position: 0,
      method: tx.functionName || tx.methodId || '',
    }))
    
    console.log('Transformed items count:', items.length)
    
    return NextResponse.json({ items, next_page_params: null })
  } catch (error) {
    console.error('Error fetching from Mantlescan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', items: [] },
      { status: 500 }
    )
  }
}
