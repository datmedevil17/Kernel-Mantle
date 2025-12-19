// app/ide/page.tsx
'use client'
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";

export default function IDEPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');

  const handleCreateProject = (type: string) => {
    setSelectedType(type);
    router.push(`/ide/editor?template=${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Create New Smart Contract
          </h1>
          <Badge variant="outline" className="px-4 py-1">
            Solidity ^0.8.0
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ERC Templates Card */}
          <Card className="p-6 bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-purple-500/50 transition-all">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">ERC Templates</h2>
              <Badge variant="secondary" className="ml-2">Popular</Badge>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Standard token implementations following ERC specifications
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => handleCreateProject('erc20')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                ERC20 Token
              </Button>
              <Button 
                onClick={() => handleCreateProject('erc721')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                ERC721 NFT Collection
              </Button>
              <Button 
                onClick={() => handleCreateProject('erc1155')}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              >
                ERC1155 Multi-Token
              </Button>
            </div>
          </Card>

          {/* Oracle Projects Card */}
          <Card className="p-6 bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-purple-500/50 transition-all">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Oracle Projects</h2>
              <Badge variant="secondary" className="ml-2">Advanced</Badge>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Create custom oracle solutions for real-world data feeds
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => handleCreateProject('price-feed')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Price Feed Oracle
              </Button>
              <Button 
                onClick={() => handleCreateProject('custom-oracle')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Custom Data Oracle
              </Button>
            </div>
          </Card>

          {/* AI Integration Card */}
          <Card className="p-6 bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-purple-500/50 transition-all">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">AI Integration</h2>
              <Badge variant="secondary" className="ml-2">Experimental</Badge>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Smart contracts with AI model integration capabilities
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => handleCreateProject('ai-oracle')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                AI Oracle Interface
              </Button>
              <Button 
                onClick={() => handleCreateProject('ai-governance')}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                AI Governance
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex space-x-4">
            <Button variant="outline" className="text-gray-400 hover:text-white">
              Import Existing Project
            </Button>
            <Button variant="outline" className="text-gray-400 hover:text-white">
              Browse Templates
            </Button>
          </div>
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}