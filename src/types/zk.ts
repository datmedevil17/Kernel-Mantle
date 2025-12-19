export interface ZKProof {
  id: string;
  type: 'snark' | 'stark' | 'plonk' | 'groth16';
  circuit: string;
  witness: Record<string, any>;
  proof?: string;
  publicInputs: any[];
  verificationKey?: string;
  status: 'pending' | 'generated' | 'verified' | 'failed';
  gasEstimate?: number;
}

export interface ZKCircuit {
  id: string;
  name: string;
  source: string;
  language: 'circom' | 'noir' | 'zokrates' | 'cairo';
  constraints: number;
  compiledR1CS?: string;
  witnessGenerator?: string;
  verifierContract?: string;
}

export interface QuantumCryptoConfig {
  algorithm: 'kyber' | 'dilithium' | 'falcon' | 'sphincs' | 'rainbow';
  keySize: number;
  securityLevel: 1 | 3 | 5;
  purpose: 'encryption' | 'signature' | 'key_exchange';
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'trading' | 'defi' | 'governance' | 'arbitrage' | 'custom';
  capabilities: string[];
  protocols: string[];
  code: string;
  deployed: boolean;
  performance?: {
    successRate: number;
    profitLoss: number;
    gasEfficiency: number;
  };
}

export interface BlockchainProtocol {
  name: string;
  network: 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'solana' | 'custom';
  rpcUrl: string;
  contractAddresses: Record<string, string>;
  abi: any[];
}