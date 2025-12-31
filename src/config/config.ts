import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'

// Define Mantle Sepolia Testnet chain
export const mantleTestnet = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Mantle Sepolia Explorer', url: 'https://sepolia.mantlescan.xyz' },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [mantleTestnet],
  transports: {
    [mantleTestnet.id]: http(),
  },
})