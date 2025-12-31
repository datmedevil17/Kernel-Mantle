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
  Github
} from "lucide-react";

export default function SandboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const contractAddress = searchParams.get("contractAddress");
  const abiString = searchParams.get("abi");
  const contractName = searchParams.get("name") || "MyContract";

  // Initial scaffold code before AI generation
  const initialCode = `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Neuron UI Generator</h1>
      <p>Click "Generate UI" to build a custom dApp for your contract.</p>
      <div style={{ 
        padding: '20px', 
        border: '1px solid #333', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <p><strong>Contract:</strong> ${contractName}</p>
        <p><strong>Address:</strong> ${contractAddress}</p>
      </div>
    </div>
  );
}`;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const handleGenerate = async () => {
    if (!abiString) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Generate a modern, functional React component Using 'wagmi' and 'viem' to interact with this Smart Contract.
      
      Contract Name: ${contractName}
      Contract Address: ${contractAddress}
      ABI: ${abiString}

      Requirements:
      1. Use 'wagmi' hooks: useReadContract, useWriteContract, useAccount, useConnect.
      2. Use 'viem' for parsing ether/formatting (parseEther, formatEther).
      3. Create a beautiful UI with Tailwind CSS classes.
      4. Include a "Connect Wallet" button if not connected.
      5. For READ functions: Display them clearly in cards.
      6. For WRITE functions: Create forms with inputs and "Submit" buttons.
      7. Handle loading and error states.
      8. Return ONLY the full React functional component code. Start with imports.
      9. Do NOT use external UI libraries other than standard HTML/Tailwind.
      10. The component should be exported as default.
      
      IMPORTANT: The code will run in a Sandpack environment. Ensure all imports are valid for standard React/Wagmi setup.
      Assume 'wagmi' and 'viem' are available.`;

      const response = await makeGeminiRequest(prompt);
      
      let code = response.content || response;
      // Clean up markdown code blocks if present
      code = code.replace(/```jsx?/g, "").replace(/```tsx?/g, "").replace(/```/g, "");
      
      setGeneratedCode(code);
    } catch (error) {
      console.error("Failed to generate UI:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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
           <Button
            onClick={handleGenerate}
            disabled={isGenerating}
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
            template="react"
            theme="dark"
            files={{
              "/App.js": generatedCode,
            }}
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
              classes: {
                "sp-layout": "h-full",
              }
            }}
            customSetup={{
              dependencies: {
                "wagmi": "2.5.7",
                "viem": "2.7.6",
                "@tanstack/react-query": "5.25.0",
                "lucide-react": "latest"
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
                style={{ height: "100%" }}
              />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
