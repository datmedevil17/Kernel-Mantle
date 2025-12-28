import { http, createConfig } from 'wagmi'
import { morphHolesky } from 'viem/chains'

export const config = createConfig({
  chains: [morphHolesky, ],
  transports: {
    [morphHolesky.id]: http(),
  },
})