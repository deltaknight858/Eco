import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Eco Shell
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            The agentic orchestration interface for the Eco ecosystem
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Pathways Wizard</h3>
              <p className="text-gray-300">Guided journey navigation through complex workflows</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Agent Assist</h3>
              <p className="text-gray-300">AI-powered assistance for development tasks</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Capsule Management</h3>
              <p className="text-gray-300">Create, verify, and deploy provenance-stamped capsules</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}