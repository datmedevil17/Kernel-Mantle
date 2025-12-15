import {defineChain} from 'viem';

export const myCustomChain = defineChain({
  id: 420420421, // Replace this with your chain's ID
  name: 'PolkaVM',
  network: 'PAsset Hub Testnet',
  nativeCurrency: {
    decimals: 18, // Replace this with the number of decimals for your chain's native token
    name: 'PAsset Hub Token',
    symbol: 'PHT'
  },
  rpcUrls: {
    default: {
      http: [' https://testnet-passet-hub-eth-rpc.polkadot.io'],
    }
  },
  blockExplorers: {
    default: {name: 'Explorer', url: 'my-custom-chain-block-explorer'}
  }
});