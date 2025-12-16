import React from 'react';
import { Component } from '../types';
import { 

  Settings, 
  Eye, 
  
  Zap, 
  Shield, 
  Database, 
  Radio, 
  Map, 
  Cpu, 
  Gift, 
  Lock, 
  Users, 
  Calendar, 
  TrendingUp 
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactElement;
}

// Define the Component interface to match the imported type
interface ComponentItem extends Component {
  id: string;
  type: string;
  category: string;
  name: string;
  icon: React.ReactElement;
  color: string;
  description: string;
  gasEstimate: number;
  properties: Record<string, any>;
}

const componentLibrary: ComponentItem[] = [
  // Core Components
  {
    id: 'constructor',
    type: 'function',
    category: 'core',
    name: 'Constructor',
    icon: <Cpu className="w-5 h-5" />,
    color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    description: 'Initialize contract state',
    gasEstimate: 21000,
    properties: { 
      visibility: 'public',
      payable: false, 
      parameters: '',
      initCode: '// Initialize your contract here'
    }
  },
  {
    id: 'state-variable',
    type: 'variable',
    category: 'storage',
    name: 'State Variable',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-green-100 border-green-300 hover:bg-green-200',
    description: 'Store data on blockchain',
    gasEstimate: 20000,
    properties: { 
      dataType: 'uint256', 
      visibility: 'public', 
      name: 'myVariable',
      defaultValue: '0',
      constant: false,
      immutable: false
    }
  },
  // Advanced Functions
  {
    id: 'payable-function',
    type: 'function',
    category: 'finance',
    name: 'Payable Function',
    icon: <Gift className="w-5 h-5" />,
    color: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200',
    description: 'Function that can receive Ether',
    gasEstimate: 23000,
    properties: { 
      name: 'deposit', 
      visibility: 'external', 
      payable: true, 
      returns: '',
      minAmount: '0.01 ether',
      functionBody: 'require(msg.value >= minAmount, "Minimum amount required");'
    }
  },
  {
    id: 'view-function',
    type: 'function',
    category: 'core',
    name: 'View Function',
    icon: <Eye className="w-5 h-5" />,
    color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
    description: 'Read-only function',
    gasEstimate: 0,
    properties: { 
      name: 'getBalance', 
      visibility: 'public', 
      view: true,
      returns: 'uint256',
      functionBody: 'return address(this).balance;'
    }
  },
  // Access Control
  {
    id: 'access-control',
    type: 'modifier',
    category: 'security',
    name: 'Access Control',
    icon: <Lock className="w-5 h-5" />,
    color: 'bg-red-100 border-red-300 hover:bg-red-200',
    description: 'Role-based permissions',
    gasEstimate: 2300,
    properties: { 
      name: 'onlyOwner', 
      condition: 'msg.sender == owner',
      errorMessage: 'Only owner can call this function',
      roleType: 'owner'
    }
  },
  {
    id: 'multi-sig',
    type: 'modifier',
    category: 'security',
    name: 'Multi-Signature',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
    description: 'Require multiple approvals',
    gasEstimate: 5000,
    properties: { 
      name: 'requireMultipleSignatures',
      requiredSignatures: 2,
      signers: 'address[] memory signers',
      proposalId: 'bytes32'
    }
  },
  // Events and Oracles
  {
    id: 'indexed-event',
    type: 'event',
    category: 'events',
    name: 'Indexed Event',
    icon: <Radio className="w-5 h-5" />,
    color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
    description: 'Searchable blockchain event',
    gasEstimate: 1500,
    properties: { 
      name: 'Transfer', 
      parameters: 'address indexed from, address indexed to, uint256 value',
      indexed: true,
      anonymous: false
    }
  },
  // Advanced Storage
  {
    id: 'nested-mapping',
    type: 'variable',
    category: 'storage',
    name: 'Nested Mapping',
    icon: <Map className="w-5 h-5" />,
    color: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200',
    description: 'Complex data relationships',
    gasEstimate: 20000,
    properties: { 
      name: 'allowances',
      keyType1: 'address',
      keyType2: 'address', 
      valueType: 'uint256',
      visibility: 'public',
      description: 'owner => spender => amount'
    }
  },
  {
    id: 'struct',
    type: 'struct',
    category: 'storage',
    name: 'Struct',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-teal-100 border-teal-300 hover:bg-teal-200',
    description: 'Custom data structure',
    gasEstimate: 0,
    properties: { 
      name: 'User',
      fields: 'address wallet; uint256 balance; bool active; string name',
      visibility: 'public'
    }
  },
  // Time-based
  {
    id: 'time-lock',
    type: 'modifier',
    category: 'time',
    name: 'Time Lock',
    icon: <Calendar className="w-5 h-5" />,
    color: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
    description: 'Time-based restrictions',
    gasEstimate: 2100,
    properties: { 
      name: 'onlyAfter',
      timeCondition: 'block.timestamp >= releaseTime',
      releaseTime: '1 days',
      description: 'Only executable after specified time'
    }
  },
  // DeFi Components
  {
    id: 'liquidity-pool',
    type: 'template',
    category: 'defi',
    name: 'Liquidity Pool',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-rose-100 border-rose-300 hover:bg-rose-200',
    description: 'AMM liquidity pool logic',
    gasEstimate: 150000,
    properties: { 
      tokenA: 'USDC',
      tokenB: 'ETH',
      fee: 0.3,
      slippage: 0.5,
      minLiquidity: 1000
    }
  },
  // Security Components
  {
    id: 'reentrancy-guard',
    type: 'modifier',
    category: 'security',
    name: 'Reentrancy Guard',
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-300 hover:bg-gray-200',
    description: 'Prevent reentrancy attacks',
    gasEstimate: 2300,
    properties: { 
      name: 'nonReentrant',
      status: '_status',
      entered: '_ENTERED',
      notEntered: '_NOT_ENTERED'
    }
  },
  // Token Standards
  {
    id: 'erc20-advanced',
    type: 'template',
    category: 'tokens',
    name: 'ERC-20 Advanced',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
    description: 'Full ERC-20 with extensions',
    gasEstimate: 500000,
    properties: { 
      name: 'MyToken', 
      symbol: 'MTK', 
      supply: 1000000,
      decimals: 18,
      mintable: true,
      burnable: true,
      pausable: false,
      maxSupply: 10000000
    }
  },
  {
    id: 'erc721',
    type: 'template',
    category: 'tokens',
    name: 'ERC-721 NFT',
    icon: <Gift className="w-5 h-5" />,
    color: 'bg-pink-100 border-pink-300 hover:bg-pink-200',
    description: 'Non-Fungible Token standard',
    gasEstimate: 800000,
    properties: { 
      name: 'MyNFT', 
      symbol: 'MNFT',
      baseURI: 'https://api.mynft.com/metadata/',
      maxSupply: 10000,
      mintPrice: 0.08,
      royaltyFee: 5
    }
  }
];

const categories: Category[] = [
  { id: 'all', name: 'All Components', icon: <Settings className="w-4 h-4" /> },
  { id: 'core', name: 'Core', icon: <Cpu className="w-4 h-4" /> },
  { id: 'storage', name: 'Storage', icon: <Database className="w-4 h-4" /> },
  { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'finance', name: 'Finance', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'tokens', name: 'Tokens', icon: <Zap className="w-4 h-4" /> },
  { id: 'defi', name: 'DeFi', icon: <Gift className="w-4 h-4" /> },
  { id: 'events', name: 'Events', icon: <Radio className="w-4 h-4" /> },
  { id: 'time', name: 'Time', icon: <Calendar className="w-4 h-4" /> }
];

export { componentLibrary, categories, type ComponentItem, type Category };