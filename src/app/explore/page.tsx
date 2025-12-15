"use client"

import { ContractStore } from "../../data/contracts";
import React, { useState } from 'react'
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";

const ExplorePage = () => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [selectedContract, setSelectedContract] = useState<CustomizeContract | null>(null);

interface ExpandedCategories {
    [key: string]: boolean;
}

const toggleCategory = (categoryId: string): void => {
    setExpandedCategories((prev: ExpandedCategories) => ({
        ...prev,
        [categoryId]: !prev[categoryId]
    }));
};

interface Contract {
    path: string;
    name: string;
    // Add other contract properties as needed
}

interface CodeResponse {
    contract: string;
}

const fetchCode = async (contract: Contract): Promise<void> => {
    console.log("Fetching contract:", contract.path); 
    
    try {
        const res = await axios.post<CodeResponse>("/api/explore", {
            slug: contract.path,
        });
        if (res.status === 200) {
            setSourceCode(res.data.contract);
        }
    } catch (e) {
        console.error("Error fetching code:", e);
        
    }
};

interface CustomizeContract {
    identifier: string;
    name: string;
    version: string;
    description: string;
    path: string;
}

const handleCustomize = async (
    e: React.MouseEvent<HTMLButtonElement>,
    contract: CustomizeContract
): Promise<void> => {
    e.preventDefault();
    setSelectedContract(contract);
    setIsModalOpen(true);
    await fetchCode(contract);
};

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
          Smart Contract Templates
        </h1>

        <div className="space-y-16">
          {ContractStore.map((store) => (
            <div key={`${store.contracts[0].identifier}-${store.contracts[0].version}`} className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{store.name}</h2>
                {store.contracts.length > 6 && (
                  <button
                    onClick={() => toggleCategory(store.identifier)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm flex items-center gap-2"
                  >
                    {expandedCategories[store.identifier] ? 'Show Less' : 'View More'}
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${
                        expandedCategories[store.identifier] ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.contracts
                  .slice(0, expandedCategories[store.identifier] ? undefined : 6)
                  .map((contract, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${store.identifier}-${contract.identifier}-${index}`}
                    >
                      <Link href={`/${contract.identifier}`}>
                        <div className="bg-gray-900/95 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-800/50 backdrop-blur-sm group relative overflow-hidden h-[200px] flex flex-col">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors truncate">
                            {contract.name}
                          </h3>
                          
                          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-500/20 mb-3 w-fit">
                            v{contract.version}
                          </div>
                          
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-grow">
                            {contract.description.length > 120 
                              ? `${contract.description.slice(0, 120)}...` 
                              : contract.description}
                          </p>
                          
                          <div className="mt-auto flex justify-between items-center">
                            <button 
                              onClick={(e) => handleCustomize(e, {
                                ...contract,
                                path: contract.path || ''
                              })}
                              className="text-purple-400 text-sm group-hover:-translate-x-1 transition-transform duration-200 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Customize
                            </button>
                            
                            <span className="text-indigo-400 text-sm group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1">
                              View Details
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedContract?.name} - Source Code
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-gray-300 font-mono">
                {sourceCode || 'Loading...'}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;