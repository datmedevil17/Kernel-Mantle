"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useContractStore } from "@/stores/contractStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, BookOpen, Bot, Activity, Code, Zap, Shield, Layers } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ContractCard } from "@/components/contracts/ContractCard"
import { TransactionList } from "@/components/TransactionList"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardPage() {
  const { contracts } = useContractStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("contracts")

  const quickActions = [
    {
      title: "Deploy New Contract",
      description: "Create and deploy a new smart contract",
      href: "/ide",
      icon: <Plus className="w-5 h-5" />,
      gradient: "from-purple-500/20 to-violet-500/20",
      borderGradient: "from-purple-500/30 to-violet-500/30",
    },
    {
      title: "Browse Templates",
      description: "Explore pre-built contract templates",
      href: "/templates",
      icon: <Layers className="w-5 h-5" />,
      gradient: "from-purple-400/20 to-purple-600/20",
      borderGradient: "from-purple-400/30 to-purple-600/30",
    },
    {
      title: "Documentation",
      description: "View guides and API references",
      href: "/docs",
      icon: <BookOpen className="w-5 h-5" />,
      gradient: "from-gray-700/20 to-gray-800/20",
      borderGradient: "from-gray-600/30 to-gray-700/30",
    },
    {
      title: "AI Assistant",
      description: "Get help with smart contract development",
      href: "/ai",
      icon: <Bot className="w-5 h-5" />,
      gradient: "from-purple-600/20 to-purple-800/20",
      borderGradient: "from-purple-600/30 to-purple-800/30",
    },
  ]

  const stats = [
    {
      label: "Total Contracts",
      value: contracts?.length || 0,
      icon: <Code className="w-5 h-5" />,
      change: "+12%",
    },
    {
      label: "Active Deployments",
      value: "24",
      icon: <Activity className="w-5 h-5" />,
      change: "+8%",
    },
    {
      label: "Gas Saved",
      value: "1.2M",
      icon: <Zap className="w-5 h-5" />,
      change: "+15%",
    },
    {
      label: "Security Score",
      value: "98%",
      icon: <Shield className="w-5 h-5" />,
      change: "+2%",
    },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-purple-900/5" />
        <motion.div
          className="absolute inset-0 opacity-20"
        />
      </div>

      <div className="relative z-10">
        {/* Enhanced Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-800/50 backdrop-blur-xl bg-black/50"
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-400 text-sm mt-1">Manage your smart contracts and deployments</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search contracts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80 bg-gray-900/50 backdrop-blur-sm border-gray-800/50 focus:border-purple-500/50 text-white placeholder-gray-400"
                  />
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-purple-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  New Contract
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="container mx-auto px-6 py-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="p-6 bg-gray-900/30 backdrop-blur-xl border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <p className="text-green-400 text-xs mt-1">{stat.change} from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm rounded-xl border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Main Content */}
        <main className="container mx-auto px-6 pb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Left Content - Contracts & Transactions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-1">
                  <TabsTrigger
                    value="contracts"
                    className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200 data-[state=active]:border-purple-500/30 text-gray-400 transition-all duration-300"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    My Contracts
                  </TabsTrigger>
                  <TabsTrigger
                    value="transactions"
                    className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200 data-[state=active]:border-purple-500/30 text-gray-400 transition-all duration-300"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Transactions
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="contracts" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {contracts && contracts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                          {contracts
                            .filter(
                              (contract) =>
                                !searchQuery ||
                                contract.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                contract.address.toLowerCase().includes(searchQuery.toLowerCase()),
                            )
                            .map((contract, index) => (
                              <motion.div
                                key={contract.address}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <ContractCard
                                  contract={{
                                    address: contract.address,
                                    name: contract.name || "Unnamed Contract",
                                    description: contract.description || "No description available",
                                    version: contract.version || "1.0.0",
                                    abi: contract.abi || "",
                                  }}
                                />
                              </motion.div>
                            ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="p-12 text-center bg-gray-900/30 backdrop-blur-xl border-gray-800/50">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-4">
                              <Code className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No contracts found</h3>
                            <p className="text-gray-400 mb-6">Get started by deploying your first smart contract</p>
                            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0">
                              <Plus className="w-4 h-4 mr-2" />
                              Deploy Contract
                            </Button>
                          </Card>
                        </motion.div>
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="transactions">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TransactionList />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </motion.div>

            {/* Enhanced Right Sidebar - Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Quick Actions</h2>
                <p className="text-gray-400 text-sm">Streamline your workflow</p>
              </div>

              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Card className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 bg-gray-900/30 backdrop-blur-xl border-gray-800/50 hover:border-purple-500/30 cursor-pointer">
                      {/* Background gradient */}
                      <div
                        className={`absolute inset-0 opacity-0 bg-gradient-to-br ${action.gradient} 
                        transition-opacity duration-300 group-hover:opacity-100`}
                      />

                      {/* Glowing border effect */}
                      <motion.div
                        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${action.borderGradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`}
                        initial={false}
                      />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm rounded-lg border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
                            {action.icon}
                          </div>
                          <motion.div
                            className="w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                            initial={false}
                            whileHover={{ scale: 1.5 }}
                          />
                        </div>

                        <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">
                          {action.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          {action.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-700/10 backdrop-blur-xl border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">Pro Tip</h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Use our AI assistant to optimize your smart contracts and reduce gas costs by up to 30%.
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
