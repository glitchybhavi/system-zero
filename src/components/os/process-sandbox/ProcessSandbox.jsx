import React from 'react';
import { ProcessSandboxProvider } from './state/ProcessSandboxContext';
import ProcessSandboxHeader from './components/ProcessSandboxHeader';
import ProcessSpawner from './components/ProcessSpawner';
import CpuCoreVisualizer from './components/CpuCoreVisualizer';
import PcbGrid from './components/PcbGrid';
import StateDiagramOverlay from './components/StateDiagramOverlay';
import KnowledgeQuiz from './components/KnowledgeQuiz';
import './ProcessSandbox.css';

function ProcessSandboxContent() {
  return (
    <div className="process-sandbox-root">
      {/* Top Controls Header */}
      <ProcessSandboxHeader />

      {/* Main Single-Screen Simulation Grid */}
      <main className="sandbox-single-screen-grid">
        {/* Left Column: Spawner & State Diagram */}
        <section className="sandbox-col-left" aria-label="Controls and State">
          <ProcessSpawner />
          <StateDiagramOverlay />
        </section>

        {/* Right Column: Running Slot & Process List */}
        <section className="sandbox-col-right" aria-label="CPU and Process Table">
          <CpuCoreVisualizer />
          <PcbGrid />
        </section>
      </main>

      {/* Bottom Section: Knowledge Check Quiz */}
      <section className="sandbox-quiz-section" aria-label="Diagnostic Quiz">
        <KnowledgeQuiz />
      </section>
    </div>
  );
}

export default function ProcessSandbox() {
  return (
    <ProcessSandboxProvider>
      <ProcessSandboxContent />
    </ProcessSandboxProvider>
  );
}
