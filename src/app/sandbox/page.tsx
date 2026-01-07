"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview
} from "@codesandbox/sandpack-react";
import { makeGeminiRequest } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Zap, 
  Loader2, 
  Github,
  AlertCircle
} from "lucide-react";

// Wrapper code to provide Wagmi context inside Sandpack
const WRAPPER_CODE = `import React from 'react';
import { createConfig, WagmiProvider, http } from 'wagmi';
import { mainnet, sepolia, mantleSepoliaTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import GeneratedApp from './GeneratedApp';

const config = createConfig({
  chains: [mainnet, sepolia, mantleSepoliaTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [mantleSepoliaTestnet.id]: http(),
  },
  connectors: [injected()],
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GeneratedApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}`;

const INITIAL_GENERATED_APP = `import React from 'react';

export default function GeneratedApp() {
  return (
    <div className="p-8 text-center font-sans text-white">
      <h1 className="text-2xl font-bold mb-4">Ready to Generate</h1>
      <p className="text-gray-400">
        Click "Generate UI" to build a custom dApp for your contract.
      </p>
    </div>
  );
}`;

export default function SandboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const contractAddress = searchParams.get("contractAddress");
  const abiString = searchParams.get("abi");
  const contractName = searchParams.get("name") || "MyContract";

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(INITIAL_GENERATED_APP);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!abiString || !contractAddress) {
      setError("Missing contract ABI or Address.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Parse ABI locally to extract functions
      let abi: any;
      try {
        abi = JSON.parse(abiString);
        
        // Handle double-encoding if it's still a string
        if (typeof abi === 'string') {
          abi = JSON.parse(abi);
        }
      } catch (e) {
        console.error("Error parsing ABI string:", e);
        throw new Error("Invalid ABI format");
      }

      // Handle if ABI is wrapped in an object (e.g. Hardhat artifact)
      if (!Array.isArray(abi) && abi.abi && Array.isArray(abi.abi)) {
        abi = abi.abi;
      }

      if (!Array.isArray(abi)) {
        console.error("Parsed ABI is not an array:", abi);
        throw new Error(`Invalid ABI format: Expected array, got ${typeof abi}`);
      }

      console.log("Successfully parsed ABI, length:", abi.length);

      const functions = abi.filter((item: any) => item.type === 'function');
      
      const readFunctions = functions.filter((f: any) => 
        f.stateMutability === 'view' || f.stateMutability === 'pure'
      ).map((f: any) => f.name);

      const writeFunctions = functions.filter((f: any) => 
        f.stateMutability !== 'view' && f.stateMutability !== 'pure'
      ).map((f: any) => f.name);

      // 2. Structured Prompt
      const prompt = `Generate a React component called 'GeneratedApp' for a dApp dashboard.
      
      Context:
      - Contract Name: ${contractName}
      - Contract Address: "${contractAddress}"
      - Chain ID: 5003 (Mantle Sepolia)
      
      The ABI contains these specific functions:
      - READ Functions: ${readFunctions.join(", ")}
      - WRITE Functions: ${writeFunctions.join(", ")}

      Requirements:
      1. Use 'wagmi' v2 hooks: useReadContract, useWriteContract, useAccount, useConnect, useDisconnect, useWaitForTransactionReceipt.
      2. Use 'viem' for parsing/formatting (parseEther, formatEther).
      3. Create a "Connect Wallet" button at the top right.
      4. Create TWO sections: "Read Contract" and "Write Contract".
      5. For EVERY Read function listed above, create a card that reads its value.
      6. For EVERY Write function listed above, create a form with inputs and a submit button.
      7. Handle loading states and show transaction hashes.
      8. Use 'lucide-react' for icons.
      9. Style with Tailwind CSS using a professional Black & White theme (minimalist, high contrast, clean typography, subtle borders).
      10. Export the component as 'default'.
      11. NO Markdown blocks. NO \`\`\` wrappers. Just the raw code.
      12. CRITICAL: Use 'chainId: 5003' in all hooks. Use the NUMBER 5003.
      13. WAGMI V2 STRICT MODE: 
          - DO NOT import 'wagmi/connectors/injected'.
          - DO NOT use 'InjectedConnector'.
          - To connect, use: \`const { connectors, connect } = useConnect();\` and \`connect({ connector: connectors[0] })\`.
          - DO NOT add arguments to \`useConnect()\`.
      14. LAYOUT: The main container MUST use 'min-h-screen' and 'w-full' to fill the entire preview area. Content should be properly spaced.
      
      IMPORTANT: The code runs in a wrapper that ALREADY provides WagmiProvider.
      Do not add WagmiProvider or QueryClientProvider. Just build the UI component.`;

      const response = await makeGeminiRequest(prompt);
      
      let code = response.content || response;
      // Sanitize output
      code = code.replace(/```tsx?|```jsx?|```/g, "").trim();
      
      // Basic check to ensure it exports default
      if (!code.includes("export default")) {
        throw new Error("Generated code missing default export.");
      }

      setGeneratedCode(code);
    } catch (err: any) {
      console.error("Failed to generate UI:", err);
      setError(err.message || "Failed to generate UI. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-30">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 p-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push("/pipeline")}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pipeline
          </Button>
          <div className="h-6 w-px bg-gray-800" />
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Neuron Sandbox
            </h1>
            <p className="text-xs text-gray-500">AI-Powered dApp Generator</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {error && (
            <div className="flex items-center text-red-400 text-xs mr-4">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
           <Button
            onClick={handleGenerate}
            disabled={isGenerating || !abiString}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white border-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate UI
              </>
            )}
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            <Github className="w-4 h-4 mr-2" />
            Deploy to GitHub
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sandpack Container */}
        <div className="flex-1 h-full">
          <SandpackProvider
            template="react-ts"
            theme="dark"
            files={{
              "/App.tsx": WRAPPER_CODE,
              "/GeneratedApp.tsx": generatedCode,
            }}
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
              classes: {
                "sp-layout": "h-full",
              }
            }}
            customSetup={{
              dependencies: {
                "wagmi": "2.14.1",
                "viem": "2.21.0",
                "@tanstack/react-query": "5.59.0",
                "lucide-react": "latest",
                "clsx": "latest",
                "tailwind-merge": "latest"
              }
            }}
          >
            <SandpackLayout className="h-full border-none">
              <SandpackCodeEditor 
                showTabs
                showLineNumbers
                showInlineErrors
                closableTabs
                style={{ height: "100%" }}
              />
              <SandpackPreview 
                showNavigator 
                showRefreshButton
                
              />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
