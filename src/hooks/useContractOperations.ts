import { useState, useCallback } from 'react';
import axios from 'axios';
import { useDeployContract, useSwitchChain, usePublicClient } from 'wagmi';
import { File } from '@/types/file'; // Assuming you have a File type defined

interface CompilationResult {
  abi: string;
  bytecode: string;
  error?: string;
}

export function useContractOperations() {
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const { deployContract } = useDeployContract();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const handleCompile = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;
    console.log(selectedFile)
    
    setIsCompiling(true);
    setCompilationResult(null);
    
    try {
      const sources = {
        [`contracts/${selectedFile.name}`]: {
          content: selectedFile.content,
        }
      };

      const response = await axios.post('/api/compile', { sources });

      if (response.status !== 200) {
        throw new Error(response.data.error || "Compilation failed!");
      }

      const result = response.data;

      if (result.error) {
        throw new Error(result.error);
      }

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
  }, []);

  const handleDeploy = useCallback(async () => {
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

  return {
    compilationResult,
    isCompiling,
    deployedAddress,
    handleCompile,
    handleDeploy
  };
}
