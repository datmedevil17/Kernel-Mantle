'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useContractStore } from '@/stores/contractStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ContractCard } from '@/components/contracts/ContractCard'
import { TransactionList } from '@/components/TransactionList'

export default function DashboardPage() {
  const { contracts } = useContractStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              type="search"
              placeholder="Search contracts..."
              className="w-full"
            />
            <Button size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Left Content - Contracts & Transactions */}
          <div className="col-span-3">
            <Tabs defaultValue="contracts" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contracts">My Contracts</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="contracts" className="space-y-4">
                {contracts && contracts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contracts.map((contract) => (
                      <ContractCard 
                        key={contract.address} 
                        contract={{
                          address: contract.address,
                          name: contract.name || 'Unnamed Contract',
                          description: contract.description || 'No description available',
                          version: contract.version || '1.0.0',
                          abi: contract.abi || ''
                        }} 
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    No contracts found
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionList />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Deploy New Contract",
                  description: "Create and deploy a new smart contract",
                  href: "/ide",
                  gradient: "from-blue-500 to-purple-600"
                },
                {
                  title: "Browse Templates",
                  description: "Explore pre-built contract templates",
                  href: "/templates",
                  gradient: "from-green-500 to-teal-600"
                },
                {
                  title: "Documentation",
                  description: "View guides and API references",
                  href: "/docs",
                  gradient: "from-orange-500 to-red-600"
                },
                {
                  title: "AI Assistant",
                  description: "Get help with smart contract development",
                  href: "/ai",
                  gradient: "from-purple-500 to-pink-600"
                }
              ].map((action, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div 
                    className={`absolute inset-0 opacity-0 bg-gradient-to-r ${action.gradient} 
                    transition-opacity group-hover:opacity-10`}
                  />
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
