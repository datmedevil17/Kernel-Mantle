// app/ide/editor/page.tsx
'use client'
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import FileNavigator from '@/components/editor/FileNavigator';
import CodeEditor from '@/components/editor/CodeEditor';
import EditorSidebar from '@/components/editor/EditorSidebar';
import { FileItem } from '@/types/editor';
import { useDeployContract, useSwitchChain, usePublicClient } from 'wagmi';

const defaultSolidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string private greeting;
    
    constructor() {
        greeting = "Hello, World!";
    }
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
    
    function getGreeting() public view returns (string memory) {
        return greeting;
    }
}`;

const defaultRustCode = `#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{
    dispatch::DispatchResult,
    pallet_prelude::*,
};
use frame_system::pallet_prelude::*;

#[frame_support::pallet]
pub mod pallet {
    use super::*;

    #[pallet::pallet]
    #[pallet::generate_store(pub(super) trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
    }

    #[pallet::storage]
    pub type Greeting<T> = StorageValue<_, Vec<u8>, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        GreetingSet { greeting: Vec<u8> },
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn set_greeting(origin: OriginFor<T>, greeting: Vec<u8>) -> DispatchResult {
            let _who = ensure_signed(origin)?;
            Greeting::<T>::put(&greeting);
            Self::deposit_event(Event::GreetingSet { greeting });
            Ok(())
        }
    }
}`;


interface CompilationResult {
  abi: string;
  bytecode: string;
  error?: string;
}

export default function EditorPage() {
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'HelloWorld.sol',
      content: defaultSolidityCode,
      type: 'file',
      extension: 'sol',
    },
    {
      id: '2',
      name: 'pallet.rs',
      content: defaultRustCode,
      type: 'file',
      extension: 'rs',
    },
  ]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(files[0]);

  const handleFileSelect = useCallback((file: FileItem): void => {
    setSelectedFile(file);
    // Clear compilation results when switching files
    setCompilationResult(null);
  }, []);

  const handleFileCreate = useCallback((name: string): void => {
    const extension = name.split('.').pop()?.toLowerCase();
    let defaultContent = '';
    
    switch (extension) {
      case 'sol':
        defaultContent = '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\n';
        break;
      case 'rs':
        defaultContent = '#![cfg_attr(not(feature = "std"), no_std)]\n\n';
        break;
      case 'js':
        defaultContent = '// JavaScript file\n\n';
        break;
      case 'ts':
        defaultContent = '// TypeScript file\n\n';
        break;
      default:
        defaultContent = '';
    }
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name,
      content: defaultContent,
      type: 'file',
      extension,
    };
    
    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
    setCompilationResult(null);
  }, []);

  const handleFileDelete = useCallback((id: string): void => {
    setFiles((prev: FileItem[]): FileItem[] => {
      const newFiles = prev.filter((f: FileItem) => f.id !== id);
      if (selectedFile?.id === id) {
        setSelectedFile(newFiles.length > 0 ? newFiles[0] : null);
        setCompilationResult(null);
      }
      return newFiles;
    });
  }, [selectedFile]);

  const handleContentChange = useCallback((content: string): void => {
    if (!selectedFile) return;
    
    setFiles((prev: FileItem[]) =>
      prev.map((file: FileItem) =>
        file.id === selectedFile.id
          ? { ...file, content }
          : file
      )
    );
    
    setSelectedFile((prev: FileItem | null) => 
      prev ? { ...prev, content } : null
    );
    
    // Clear compilation results when content changes
    setCompilationResult(null);
  }, [selectedFile]);

  // Action handlers
  const handleCompile = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsCompiling(true);
    setCompilationResult(null);
    
    try {
      // Prepare sources object for the API
      const sources = {
        [`contracts/${selectedFile.name}`]: {
          content: selectedFile.content,
        }
      };

      // Call the compilation API
      const response = await axios.post('/api/compile', { sources });

      if (response.status !== 200) {
        throw new Error(response.data.error || "Compilation failed!");
      }

      const result = response.data;

      // Check if compilation has errors
      if (result.error) {
        throw new Error(result.error);
      }

      // Get the first contract from the compiled contracts
      const contractNames = Object.keys(result.contracts);
      if (contractNames.length === 0) {
        throw new Error("No contracts found in compilation result");
      }

      const contractName = contractNames[0];
      const contract = result.contracts[contractName];

      if (!contract.abi) {
        throw new Error("No ABI found for compiled contract");
      }

      if (!contract.bytecode) {
        throw new Error("No bytecode found for compiled contract");
      }

      const compiledAbi = JSON.stringify(contract.abi);
      const compiledBytecode = contract.bytecode;

      setCompilationResult({
        abi: compiledAbi,
        bytecode: compiledBytecode,
      });

      console.log(`Successfully compiled contract: ${contractName}`);
      
      // Log warnings if any
      if (result.warnings && result.warnings.length > 0) {
        console.warn('Compilation warnings:', result.warnings);
      }
      
    } catch (error) {
      console.error("Compilation Error:", error);
      setCompilationResult({
        abi: '',
        bytecode: '',
        error: error instanceof Error ? error.message : "Compilation failed! Check your Solidity code.",
      });
    } finally {
      setIsCompiling(false);
    }
  }, [selectedFile]);

  const {deployContract} = useDeployContract()
  const {switchChain} = useSwitchChain()
  const publicClient = usePublicClient()

  const handleDeploy = useCallback(async() => {
    await switchChain({ chainId: 420420421 });

    const contract = deployContract(
      {
        abi: compilationResult?.abi ? JSON.parse(compilationResult.abi) : [],
        bytecode: `0x${compilationResult?.bytecode?.startsWith('0x') ? compilationResult.bytecode.slice(2) : compilationResult?.bytecode || ''}`,
        args: [], 
      },
      {
        onError: (error) => {
          console.log("Deployment error:", error);
        },
        onSuccess: (data) => {
          console.log("Contract deployed successfully:", data);
          // Wait for the transaction receipt to get the contract address
          if (publicClient) {
            publicClient.waitForTransactionReceipt({ hash: data }).then((receipt) => {
              if (receipt.contractAddress) {
                setDeployedAddress(receipt.contractAddress);
              }
            });
          }
        },
      }
    );
}, [compilationResult]);

  const handleCheck = useCallback(() => {
    console.log('Check function - to be implemented');
    // TODO: Implement Rust cargo check logic
  }, []);

  const handleBuild = useCallback(() => {
    console.log('Build function - to be implemented');
    // TODO: Implement Rust cargo build logic
  }, []);

  const handleRun = useCallback(() => {
    console.log('Run function - to be implemented');
    // TODO: Implement JavaScript/TypeScript run logic
  }, []);

  return (
    <div className="flex h-full">
      <FileNavigator
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileCreate={handleFileCreate}
        onFileDelete={handleFileDelete}
      />
      <CodeEditor
        file={selectedFile}
        onContentChange={handleContentChange}
      />
      <EditorSidebar
        selectedFile={selectedFile}
        onCompile={handleCompile}
        onDeploy={handleDeploy}
        onCheck={handleCheck}
        onBuild={handleBuild}
        onRun={handleRun}
        compilationResult={compilationResult || undefined}
        isCompiling={isCompiling}
        deployedAddress={deployedAddress} // Pass deployedAddress to EditorSidebar
      />
    </div>
  );
}