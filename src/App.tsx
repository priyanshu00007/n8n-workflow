import React from 'react';
import { Navbar } from './components/Navbar';
import { PageHeader } from './components/PageHeader';
import { WorkflowCanvas } from './components/Canvas/WorkflowCanvas';
import { ExecutionLogsView } from './components/Executions/ExecutionLogsView';
import { McpRegistryView } from './components/Mcp/McpRegistryView';
import { GoogleAdkAgentsView } from './components/Agents/GoogleAdkAgentsView';
import { MarketplaceView } from './components/Marketplace/MarketplaceView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { CredentialsView } from './components/Credentials/CredentialsView';
import { TriggersView } from './components/Triggers/TriggersView';
import { AiWorkflowGeneratorModal } from './components/Panels/AiWorkflowGeneratorModal';
import { CalendarWidgetModal } from './components/Calendar/CalendarWidgetModal';
import { useWorkflowStore } from './store/useWorkflowStore';
import { PlaygroundView } from './components/Playground/PlaygroundView';

export function App() {
  const { activeTab } = useWorkflowStore();

  return (
    <div className="w-screen h-screen flex flex-col bg-[#09090b] text-slate-100 font-sans antialiased overflow-hidden select-none">
      <Navbar />
      <PageHeader />

      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'canvas' && <WorkflowCanvas />}
        {activeTab === 'executions' && <ExecutionLogsView />}
        {activeTab === 'credentials' && <CredentialsView />}
        {activeTab === 'triggers' && <TriggersView />}
        {activeTab === 'mcp' && <McpRegistryView />}
        {activeTab === 'agents' && <GoogleAdkAgentsView />}
        {activeTab === 'marketplace' && <MarketplaceView />}
        {activeTab === 'playground' && <PlaygroundView />}
      </main>

      {/* Global Modals */}
      <AiWorkflowGeneratorModal />
      <CalendarWidgetModal />
    </div>
  );
}

export default App;

