import {defineChain} from 'viem';

export const myCustomChain = defineChain({
  id: 420420421, // Replace this with your chain's ID
  name: 'PolkaVM',
  network: 'Westend Testnet',
  nativeCurrency: {
    decimals: 18, // Replace this with the number of decimals for your chain's native token
    name: 'Westend Token',
    symbol: 'WND'
  },
  rpcUrls: {
    default: {
      http: [' https://westend-asset-hub-eth-rpc.polkadot.io'],
    }
  },
  blockExplorers: {
    default: {name: 'Explorer', url: 'https://blockscout-asset-hub.parity-chains-scw.parity.io'}
  }
});