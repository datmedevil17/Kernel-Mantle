import { LucideIcon } from 'lucide-react';

export interface NodeType {
  icon: LucideIcon;
  color: string;
  label: string;
}

export interface NodeConfig {
  contractFile?: string;
  contractType?: string;
  dependencies?: string[];
  solcVersion?: string;
  optimizer?: boolean;
  optimizerRuns?: number;
  evmVersion?: string;
  runs?: number;
  viaIR?: boolean;
  testSuite?: string;
  coverage?: boolean;
  gasReport?: boolean;
  network?: string;
  gasLimit?: string;
  gasPrice?: string;
  confirmations?: number;
  explorer?: string;
  apiKey?: string;
  constructorArgs?: any[];
  condition?: string;
  waitFor?: string;
  retryCount?: number;
  duration?: string;
  unit?: string;
  approvalRequired?: boolean;
  contract?: string;
}

export interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  config: NodeConfig;
}

export interface Connection {
  from: string;
  to: string;
}

export interface Template {
  name: string;
  nodes: Node[];
  connections: Connection[];
}

export interface ExecutionLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}