// components/plugins/PluginManager.tsx
'use client'
import React from 'react';
import { FileItem } from '@/types/editor';

interface PluginManagerProps {
  selectedFile: FileItem | null;
  files: FileItem[];
  onFileUpdate: (file: FileItem) => void;
  onAddFile: (file: FileItem) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generatingType: string;
  setGeneratingType: (type: string) => void;
}

const PluginManager: React.FC<PluginManagerProps> = ({
  selectedFile,
  files,
  onFileUpdate,
  onAddFile,
  isGenerating,
  setIsGenerating,
  generatingType,
  setGeneratingType,
}) => {
  const isDisabled = !selectedFile || isGenerating;

  const generateHardhatTemplate = async () => {
    setIsGenerating(true);
    setGeneratingType('hardhat');
    
    try {
      // Generate Hardhat config file
      const hardhatConfig: FileItem = {
        id: Date.now().toString(),
        name: 'hardhat.config.js',
        content: `require('@nomicfoundation/hardhat-toolbox');
require('@parity/hardhat-polkadot');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  resolc: {
    version: '1.5.2',
    compilerSource: 'npm',
    settings: {
      optimizer: {
        enabled: true,
        parameters: 'z',
        fallbackOz: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      polkavm: true,
    },
    westendHub: {
      polkavm: true,
      url: 'https://westend-asset-hub-eth-rpc.polkadot.io',
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};`,
        type: 'file',
        extension: 'js',
      };

      // Generate package.json
      const packageJson: FileItem = {
        id: (Date.now() + 1).toString(),
        name: 'package.json',
        content: `{
  "name": "hardhat-polkadot-project",
  "version": "1.0.0",
  "scripts": {
    "compile": "npx hardhat compile",
    "test": "npx hardhat test",
    "deploy": "npx hardhat ignition deploy ./ignition/modules/Deploy.js --network westendHub"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@parity/hardhat-polkadot": "^1.0.0",
    "hardhat": "^2.19.0",
    "dotenv": "^16.0.0"
  }
}`,
        type: 'file',
        extension: 'json',
      };

      onAddFile(hardhatConfig);
      onAddFile(packageJson);
    } catch (error) {
      console.error('Hardhat template generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  const generateViemTemplate = async () => {
    setIsGenerating(true);
    setGeneratingType('viem');
    
    try {
      // Generate Viem client config
      const viemConfig: FileItem = {
        id: Date.now().toString(),
        name: 'viem.config.ts',
        content: `import { http, createPublicClient, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const transport = http('https://westend-asset-hub-eth-rpc.polkadot.io');

const assetHub = {
  id: 420420421,
  name: 'westend-asset-hub',
  network: 'westend-asset-hub',
  nativeCurrency: {
    decimals: 12,
    name: 'Westend',
    symbol: 'WND',
  },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
} as const;

export const publicClient = createPublicClient({
  chain: assetHub,
  transport,
});

export const createWallet = (privateKey: \`0x\${string}\`) => {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: assetHub,
    transport,
  });
};`,
        type: 'file',
        extension: 'ts',
      };

      // Generate deployment script
      const deployScript: FileItem = {
        id: (Date.now() + 1).toString(),
        name: 'deploy.ts',
        content: `import { readFileSync } from 'fs';
import { join } from 'path';
import { createWallet } from './viem.config';
import { publicClient } from './viem.config';

const deployContract = async (
  contractName: string,
  privateKey: \`0x\${string}\`
) => {
  try {
    console.log(\`Deploying \${contractName}...\`);

    const abi = JSON.parse(
      readFileSync(join(__dirname, 'artifacts', \`\${contractName}.json\`), 'utf8')
    );
    const bytecode = \`0x\${readFileSync(
      join(__dirname, 'artifacts', \`\${contractName}.polkavm\`)
    ).toString('hex')}\` as \`0x\${string}\`;

    const wallet = createWallet(privateKey);

    const hash = await wallet.deployContract({
      abi,
      bytecode,
      args: [],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(\`Contract deployed at: \${receipt.contractAddress}\`);
    
    return receipt.contractAddress;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
};

// Usage: deployContract('ContractName', 'your-private-key');`,
        type: 'file',
        extension: 'ts',
      };

      onAddFile(viemConfig);
      onAddFile(deployScript);
    } catch (error) {
      console.error('Viem template generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  const generateEthersTemplate = async () => {
    setIsGenerating(true);
    setGeneratingType('ethers');
    
    try {
      // Generate Ethers provider config
      const ethersConfig: FileItem = {
        id: Date.now().toString(),
        name: 'ethers.config.js',
        content: `const { JsonRpcProvider } = require('ethers');

const createProvider = (rpcUrl, chainId, chainName) => {
  const provider = new JsonRpcProvider(rpcUrl, {
    chainId: chainId,
    name: chainName,
  });
  return provider;
};

const PROVIDER_RPC = {
  rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
  chainId: 420420421,
  name: 'westend-asset-hub'
};

const provider = createProvider(
  PROVIDER_RPC.rpc, 
  PROVIDER_RPC.chainId, 
  PROVIDER_RPC.name
);

module.exports = { provider, createProvider };`,
        type: 'file',
        extension: 'js',
      };

      // Generate deployment script
      const deployScript: FileItem = {
        id: (Date.now() + 1).toString(),
        name: 'deploy-ethers.js',
        content: `const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { ethers } = require('ethers');
const { provider } = require('./ethers.config');

const deployContract = async (contractName, mnemonic) => {
  console.log(\`Deploying \${contractName}...\`);

  try {
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    const abi = JSON.parse(
      readFileSync(join(__dirname, 'abis', \`\${contractName}.json\`), 'utf8')
    );
    const bytecode = \`0x\${readFileSync(
      join(__dirname, 'artifacts', \`\${contractName}.polkavm\`)
    ).toString('hex')}\`;

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(\`Contract \${contractName} deployed at: \${address}\`);

    // Save address
    const addressFile = join(__dirname, 'contract-address.json');
    const addresses = existsSync(addressFile) 
      ? JSON.parse(readFileSync(addressFile, 'utf8')) 
      : {};
    addresses[contractName] = address;
    writeFileSync(addressFile, JSON.stringify(addresses, null, 2));

    return address;
  } catch (error) {
    console.error(\`Failed to deploy \${contractName}:\`, error);
  }
};

// Usage: deployContract('ContractName', 'your-mnemonic-phrase');
module.exports = { deployContract };`,
        type: 'file',
        extension: 'js',
      };

      onAddFile(ethersConfig);
      onAddFile(deployScript);
    } catch (error) {
      console.error('Ethers template generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  const generateTests = async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('tests');
    
    try {
      const contractName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const testContent = selectedFile.extension === 'sol' 
        ? `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../${selectedFile.name}";

contract ${contractName}Test is Test {
    ${contractName} public contractInstance;
    
    function setUp() public {
        contractInstance = new ${contractName}();
    }
    
    function testInitialState() public {
        // Add your tests here
        assertTrue(true);
    }
    
    function testContractFunctions() public {
        // Test contract functions
    }
}`
        : `const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('${contractName}', function () {
  let contract;
  let owner;
  
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory('${contractName}');
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });
  
  it('should deploy successfully', async function () {
    expect(await contract.getAddress()).to.be.properAddress;
  });
  
  it('should have correct initial state', async function () {
    // Add your tests here
  });
});`;

      const testFile: FileItem = {
        id: Date.now().toString(),
        name: `${contractName}.test.${selectedFile.extension}`,
        content: testContent,
        type: 'file',
        extension: selectedFile.extension,
      };
      
      onAddFile(testFile);
    } catch (error) {
      console.error('Test generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Plugin Manager</h2>
      
      {/* Template Generators */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Templates</h3>
        <div className="space-y-2">
          <button
            onClick={generateHardhatTemplate}
            disabled={isGenerating}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && generatingType === 'hardhat' ? 'Generating...' : 'Hardhat Template'}
          </button>
          
          <button
            onClick={generateViemTemplate}
            disabled={isGenerating}
            className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && generatingType === 'viem' ? 'Generating...' : 'Viem Template'}
          </button>
          
          <button
            onClick={generateEthersTemplate}
            disabled={isGenerating}
            className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && generatingType === 'ethers' ? 'Generating...' : 'Ethers Template'}
          </button>
        </div>
      </div>

      {/* Test Generator */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Testing</h3>
        <button
          onClick={generateTests}
          disabled={isDisabled}
          className="w-full px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating && generatingType === 'tests' ? 'Generating...' : 'Generate Tests'}
        </button>
      </div>

      {selectedFile && (
        <div className="mt-auto">
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Selected: {selectedFile.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default PluginManager;