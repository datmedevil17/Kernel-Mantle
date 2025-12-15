// app/ide/audit/page.tsx
'use client'
import React, { useState, useCallback } from 'react';
import FileNavigator from '@/components/editor/FileNavigator';
import AuditReport from '@/components/audit/AuditReport';
import AuditSidebar from '@/components/audit/AuditSidebar';
import { FileItem } from '@/types/editor';
import { querySecurityAudit, queryCodeSuggestions, queryCodeAnalytics } from '@/utils/api';

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

export interface AuditResult {
  type: 'audit' | 'suggestions' | 'analytics';
  data: any;
  timestamp: Date;
  fileId: string;
}

export interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  lineNumber?: number;
  recommendation: string;
  category: string;
}

export interface Suggestion {
  id: string;
  type: 'optimization' | 'best-practice' | 'security' | 'maintainability';
  title: string;
  description: string;
  codeExample?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AnalyticsData {
  complexity: {
    cyclomatic: number;
    cognitive: number;
    score: 'excellent' | 'good' | 'moderate' | 'complex' | 'very-complex';
  };
  codeQuality: {
    maintainability: number;
    readability: number;
    testability: number;
    overall: number;
  };
  metrics: {
    linesOfCode: number;
    functions: number;
    variables: number;
    comments: number;
    commentRatio: number;
  };
  gasOptimization?: {
    estimatedGas: number;
    optimizationPotential: number;
    suggestions: string[];
  };
}

export default function AuditPage() {
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
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [currentReport, setCurrentReport] = useState<AuditResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string>('');

  const handleFileSelect = useCallback((file: FileItem): void => {
    setSelectedFile(file);
    // Clear current report when switching files
    setCurrentReport(null);
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
    setCurrentReport(null);
  }, []);

  const handleFileDelete = useCallback((id: string): void => {
    setFiles((prev: FileItem[]): FileItem[] => {
      const newFiles = prev.filter((f: FileItem) => f.id !== id);
      if (selectedFile?.id === id) {
        setSelectedFile(newFiles.length > 0 ? newFiles[0] : null);
        setCurrentReport(null);
      }
      return newFiles;
    });
  }, [selectedFile]);

  const generateAuditReport = async (file: FileItem): Promise<SecurityIssue[]> => {
    const language = file.extension ?? 'unknown';
    return await querySecurityAudit(file.content, language);
  };

  const generateSuggestions = async (file: FileItem): Promise<Suggestion[]> => {
    const language = file.extension ?? 'unknown';
    return await queryCodeSuggestions(file.content, language);
  };

  const generateAnalytics = async (file: FileItem): Promise<AnalyticsData> => {
    const language = file.extension??'unknown';
    return await queryCodeAnalytics(file.content, language);
  };

  // Action handlers
  const handleGenerateAudit = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('audit');
    
    try {
      const securityIssues = await generateAuditReport(selectedFile);
      const auditResult: AuditResult = {
        type: 'audit',
        data: { securityIssues },
        timestamp: new Date(),
        fileId: selectedFile.id
      };
      
      setAuditResults(prev => [...prev, auditResult]);
      setCurrentReport(auditResult);
    } catch (error) {
      console.error('Audit generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  }, [selectedFile]);

  const handleGenerateSuggestions = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('suggestions');
    
    try {
      const suggestions = await generateSuggestions(selectedFile);
      const suggestionResult: AuditResult = {
        type: 'suggestions',
        data: { suggestions },
        timestamp: new Date(),
        fileId: selectedFile.id
      };
      
      setAuditResults(prev => [...prev, suggestionResult]);
      setCurrentReport(suggestionResult);
    } catch (error) {
      console.error('Suggestions generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  }, [selectedFile]);

  const handleGenerateAnalytics = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('analytics');
    
    try {
      const analytics = await generateAnalytics(selectedFile);
      
      // Ensure codeQuality exists before calculating overall
      if (analytics?.codeQuality) {
        analytics.codeQuality.overall = Math.round(
          (analytics.codeQuality.maintainability + 
           analytics.codeQuality.readability + 
           analytics.codeQuality.testability) / 3
        );
      }
      
      const analyticsResult: AuditResult = {
        type: 'analytics',
        data: { analytics },
        timestamp: new Date(),
        fileId: selectedFile.id
      };
      
      setAuditResults(prev => [...prev, analyticsResult]);
      setCurrentReport(analyticsResult);
    } catch (error) {
      console.error('Analytics generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  }, [selectedFile]);

  return (
    <div className="flex h-full">
      <FileNavigator
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileCreate={handleFileCreate}
        onFileDelete={handleFileDelete}
      />
      <AuditReport
        file={selectedFile}
        currentReport={currentReport}
        isGenerating={isGenerating}
        generatingType={generatingType}
      />
      <AuditSidebar
        selectedFile={selectedFile}
        onGenerateAudit={handleGenerateAudit}
        onGenerateSuggestions={handleGenerateSuggestions}
        onGenerateAnalytics={handleGenerateAnalytics}
        auditResults={auditResults}
        currentReport={currentReport}
        onReportSelect={setCurrentReport}
        isGenerating={isGenerating}
        generatingType={generatingType}
      />
    </div>
  );
}