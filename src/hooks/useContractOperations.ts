import { useState, useCallback } from 'react';
import axios from 'axios';
import { useDeployContract, useSwitchChain, usePublicClient, useAccount } from 'wagmi';
import { File } from '@/types/file';

interface CompilationResult {
  abi: string;
  bytecode: string;
  error?: string;
}

interface DeploymentResult {
  success: boolean;
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
  error?: string;
}
interface AbiInput {
  type: string;
  name: string;
  internalType?: string;
}

interface AbiItem {
  type: 'constructor' | 'function' | 'event' | 'error';
  name?: string;
  inputs?: AbiInput[];
  outputs?: AbiInput[];
  stateMutability?: string;
}
export function useContractOperations() {
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const { deployContract } = useDeployContract();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  const handleCompile = useCallback(async (selectedFile: File | null): Promise<CompilationResult | null> => {
    if (!selectedFile) {
      console.error("No file selected for compilation");
      return null;
    }
    
    console.log("Compiling file:", selectedFile);
    
    setIsCompiling(true);
    setCompilationResult(null);
    
    try {
      // Improved request payload structure
      const requestPayload = {
        sources: {
          [`contracts/${selectedFile.name}`]: {
            content: selectedFile.content,
          }
        },
        // Add compiler settings that most Solidity compiler APIs expect
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode.object"]
            }
          }
        }
      };

      console.log("Sending compilation request:", requestPayload);

      const response = await axios.post('/api/compile', requestPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("Compilation response:", response.data);

      if (response.status !== 200) {
        throw new Error(response.data?.error || "Compilation failed!");
      }

      const result = response.data;
      
      if (result.error) {
        throw new Error(result.error);
      }

      // More robust contract extraction
      let contractData;
      let contractName = selectedFile.name.replace('.sol', '');
      
      // Try different ways to access the compiled contract
      if (result.contracts) {
        // Method 1: Direct access by contract name
        if (result.contracts[contractName]) {
          contractData = result.contracts[contractName];
        }
        // Method 2: Access by full path
        else if (result.contracts[`contracts/${selectedFile.name}`] && 
                 result.contracts[`contracts/${selectedFile.name}`][contractName]) {
          contractData = result.contracts[`contracts/${selectedFile.name}`][contractName];
        }
        // Method 3: Get first available contract
        else {
          const contractKeys = Object.keys(result.contracts);
          if (contractKeys.length > 0) {
            const firstContractKey = contractKeys[0];
            if (typeof result.contracts[firstContractKey] === 'object') {
              const subKeys = Object.keys(result.contracts[firstContractKey]);
              if (subKeys.length > 0) {
                contractData = result.contracts[firstContractKey][subKeys[0]];
                contractName = subKeys[0];
              }
            } else {
              contractData = result.contracts[firstContractKey];
            }
          }
        }
      }

      if (!contractData) {
        console.error("Available contracts:", Object.keys(result.contracts || {}));
        throw new Error(`Contract "${contractName}" not found in compilation result`);
      }

      console.log(`Found contract data for: ${contractName}`, contractData);

      // Extract ABI and bytecode with better error handling
      let abi, bytecode;
      
      if (contractData.abi) {
        abi = typeof contractData.abi === 'string' ? contractData.abi : JSON.stringify(contractData.abi);
      } else {
        console.warn("No ABI found for contract");
        abi = '[]';
      }

      if (contractData.bytecode) {
        bytecode = contractData.bytecode;
      } else if (contractData.evm?.bytecode?.object) {
        bytecode = contractData.evm.bytecode.object;
      } else {
        console.warn("No bytecode found for contract");
        bytecode = '';
      }

      // Clean bytecode (remove 0x prefix if present for storage)
      if (bytecode && bytecode.startsWith('0x')) {
        bytecode = bytecode.slice(2);
      }

      const newCompilationResult: CompilationResult = {
        abi,
        bytecode,
      };

      setCompilationResult(newCompilationResult);
      console.log(`Successfully compiled contract: ${contractName}`);
      
      if (result.warnings && result.warnings.length > 0) {
        console.warn('Compilation warnings:', result.warnings);
      }

      return newCompilationResult;
      
    } catch (error) {
      console.error("Compilation Error:", error);
      
      let errorMessage = "Compilation failed! Check your Solidity code.";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.error || 
                        error.response.data?.message || 
                        `Server error: ${error.response.status}`;
          console.error("Server response:", error.response.data);
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "No response from compilation server. Check if the API is running.";
        } else {
          // Something else happened
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorResult: CompilationResult = {
        abi: '',
        bytecode: '',
        error: errorMessage,
      };

      setCompilationResult(errorResult);
      return errorResult;
    } finally {
      setIsCompiling(false);
    }
  }, []);

const handleDeploy = useCallback(async (constructorArgs: string[] = []): Promise<DeploymentResult> => {
  return new Promise(async (resolve) => {
    try {
      // Check wallet connection first
      if (!isConnected) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      if (!compilationResult || compilationResult.error) {
        throw new Error("No valid compilation result available for deployment");
      }

      if (!compilationResult.bytecode) {
        throw new Error("No bytecode available for deployment");
      }

      console.log("Attempting deployment...");

      // Switch to the correct chain for Asset Hub Testnet
      // Asset Hub Westend Testnet chain ID is 1000 (adjust if needed)
      try {
        await switchChain({ chainId: 1000 }); // Asset Hub chain ID
        console.log("Switched to Asset Hub chain");
      } catch (chainError) {
        console.warn("Chain switch failed, continuing with current chain:", chainError);
        // Continue with deployment even if chain switch fails
      }

      // Ensure bytecode has 0x prefix for deployment
      let deployBytecode = compilationResult.bytecode;
      if (!deployBytecode.startsWith('0x')) {
        deployBytecode = `0x${deployBytecode}`;
      }

      // Validate bytecode
      if (deployBytecode.length < 4) {
        throw new Error("Invalid bytecode: too short");
      }

      const deployAbi: AbiItem[] = compilationResult.abi ? JSON.parse(compilationResult.abi) : [];
      
      // Find constructor in ABI to get parameter types
      const constructorAbi = deployAbi.find((item: AbiItem) => item.type === 'constructor');
      
      // Convert string arguments to proper types
      let processedArgs: unknown[] = [];
      if (constructorAbi && constructorAbi.inputs && constructorArgs.length > 0) {
        processedArgs = constructorAbi.inputs.map((input: AbiInput, index: number) => {
          const argValue = constructorArgs[index];
          // Convert based on parameter type
           switch (input.type) {
            case 'uint256':
            case 'uint':
              return BigInt(argValue);
            case 'address':
              return argValue as `0x${string}`;
            case 'bool':
              return argValue.toLowerCase() === 'true';
            case 'string':
              return argValue;
            default:
              // For arrays, bytes, etc., you might need more complex parsing
              if (input.type.includes('[]')) {
                // Handle array types
                try {
                  return JSON.parse(argValue);
                } catch {
                  return argValue.split(',').map((item: string) => item.trim());
                }
              }
              return argValue;
          }
        });
      }

      console.log("Deploying contract with processed args:", processedArgs);

      await deployContract(
        {
          abi: deployAbi,
          bytecode: deployBytecode as `0x${string}`,
          args: processedArgs, // Use processed args instead of raw constructorArgs
        },
        {
          onError: (error) => {
            console.error("Deployment error:", error);
            const errorResult: DeploymentResult = {
              success: false,
              contractAddress: "",
              transactionHash: "",
              gasUsed: "0",
              error: `Deployment failed: ${error.message || error}`
            };
            resolve(errorResult); // Resolve with error instead of reject
          },
          onSuccess: async (transactionHash) => {
            console.log("Contract deployed successfully, tx hash:", transactionHash);
            
            if (!publicClient) {
              const errorResult: DeploymentResult = {
                success: false,
                contractAddress: "",
                transactionHash: transactionHash,
                gasUsed: "0",
                error: "Public client not available"
              };
              resolve(errorResult);
              return;
            }

            try {
              console.log("Waiting for transaction receipt...");
              const receipt = await publicClient.waitForTransactionReceipt({ 
                hash: transactionHash,
                timeout: 120000, // Increased timeout to 2 minutes
                confirmations: 1
              });
              
              console.log("Transaction receipt:", receipt);

              if (receipt.status === 'success' && receipt.contractAddress) {
                setDeployedAddress(receipt.contractAddress);
                
                const result: DeploymentResult = {
                  success: true,
                  contractAddress: receipt.contractAddress,
                  transactionHash: transactionHash,
                  gasUsed: receipt.gasUsed?.toString() || "0"
                };
                
                resolve(result);
              } else {
                const errorResult: DeploymentResult = {
                  success: false,
                  contractAddress: "",
                  transactionHash: transactionHash,
                  gasUsed: receipt.gasUsed?.toString() || "0",
                  error: "Transaction failed or contract address not found"
                };
                resolve(errorResult);
              }
            } catch (receiptError) {
              console.error("Error waiting for receipt:", receiptError);
              const errorResult: DeploymentResult = {
                success: false,
                contractAddress: "",
                transactionHash: transactionHash,
                gasUsed: "0",
                error: `Failed to get transaction receipt: ${receiptError}`
              };
              resolve(errorResult);
            }
          },
        }
      );
    } catch (error) {
      console.error("Deploy error:", error);
      const errorResult: DeploymentResult = {
        success: false,
        contractAddress: "",
        transactionHash: "",
        gasUsed: "0",
        error: error instanceof Error ? error.message : "Unknown deployment error"
      };
      resolve(errorResult); // Resolve with error instead of reject
    }
  });
}, [compilationResult, switchChain, deployContract, publicClient, isConnected]);

  return {
    compilationResult,
    isCompiling,
    deployedAddress,
    handleCompile,
    handleDeploy
  };
}