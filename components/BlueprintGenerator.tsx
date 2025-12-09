import React, { useState } from 'react';
import { generateBlueprintCode } from '../services/geminiService';
import { Code, Database, Server, Layers, Copy, Check } from 'lucide-react';

const BlueprintGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'entity' | 'repo' | 'service' | 'controller'>('sql');
  const [code, setCode] = useState<string>("// Click 'Generate' to create the project blueprint.");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    let context = "PG Management System with entities: Room, Resident, Fee_Record, Support_Ticket.";
    let component = "";

    switch (activeTab) {
      case 'sql':
        component = "MySQL CREATE TABLE statements for all 4 entities with Foreign Keys";
        break;
      case 'entity':
        component = "Java JPA Entity classes for Resident and SupportTicket with annotations";
        break;
      case 'repo':
        component = "Spring Data JPA Repository interfaces for ResidentRepository and TicketRepository";
        break;
      case 'service':
        component = "Service Layer classes (AdminService, ResidentService) with business logic methods";
        break;
      case 'controller':
        component = "Spring MVC RestControllers (AdminController, ResidentController) with mappings";
        break;
    }

    const result = await generateBlueprintCode(component, context);
    setCode(result);
    setLoading(false);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Code className="w-6 h-6 text-indigo-600" />
          System Architect Blueprint
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Generate the backend Spring Boot & MySQL code for this system using Gemini AI.
        </p>
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-2 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'sql' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" /> Database Schema
          </button>
          <button
            onClick={() => setActiveTab('entity')}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'entity' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" /> JPA Entities
          </button>
          <button
            onClick={() => setActiveTab('repo')}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'repo' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Server className="w-4 h-4" /> Repositories
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'service' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Server className="w-4 h-4" /> Services
          </button>
          <button
            onClick={() => setActiveTab('controller')}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'controller' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Server className="w-4 h-4" /> Controllers
          </button>
        </div>

        {/* Code Display Area */}
        <div className="flex-1 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <span>{activeTab.toUpperCase()} Generator</span>
            <div className="flex gap-2">
               <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
              <button
                onClick={handleCopy}
                className="hover:text-white transition-colors"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-900 overflow-hidden relative">
            <pre className="absolute inset-0 p-4 overflow-auto text-sm font-mono text-slate-300 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintGenerator;