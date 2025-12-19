// app/ide/editor/page.tsx
'use client'
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import FileNavigator from '@/components/editor/FileNavigator';
import CodeEditor from '@/components/editor/CodeEditor';
import EditorSidebar from '@/components/editor/EditorSidebar';
import { useFileStore } from '@/stores/fileStore';
import { useDeployContract, useSwitchChain, usePublicClient } from 'wagmi';

interface CompilationResult {
  abi: string;
  bytecode: string;
  error?: string;
}

export default function EditorPage() {
  const {
    files,
    selectedFile,
    setSelectedFile,
    createFile,
    deleteFile,
    updateFile
  } = useFileStore();

  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const {deployContract} = useDeployContract()
  const {switchChain} = useSwitchChain()
  const publicClient = usePublicClient()

  const handleContentChange = useCallback((content: string): void => {
    if (!selectedFile) return;
    
    const updatedFile = { ...selectedFile, content };
    updateFile(updatedFile);
    
    // Clear compilation results when content changes
    setCompilationResult(null);
  }, [selectedFile, updateFile]);

  // Helper function to check if current file is Rust


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
  }, [compilationResult, switchChain, deployContract, publicClient]);



  return (
    <div className="flex h-full">
      <FileNavigator
        files={files}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        onFileCreate={createFile}
        onFileDelete={deleteFile}
      />
      <CodeEditor
        file={selectedFile}
        onContentChange={handleContentChange}
      />
      <EditorSidebar
        selectedFile={selectedFile}
        onCompile={handleCompile}
        onDeploy={handleDeploy}
        compilationResult={compilationResult || undefined}
        isCompiling={isCompiling}
        deployedAddress={deployedAddress}
      />
    </div>
  );
}