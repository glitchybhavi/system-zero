import React from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';

export default function ZombieOrphanLab() {
  const { state, spawnProcess, killProcess, reapProcess, loadScenario } = useProcessSandbox();
  const { processes } = state;

  const zombieProcs = processes.filter((p) => p.isZombie || p.state === 'ZOMBIE');
  const orphanProcs = processes.filter((p) => p.isOrphan && p.state !== 'TERMINATED');

  const handleCreateZombieDemo = () => {
    loadScenario('zombie_demo');
  };

  const handleSpawnParentAndChild = () => {
    const parentName = 'Parent_Service';
    const parentProc = spawnProcess({
      name: parentName,
      priority: 6,
      burstTime: 200,
    });
  };

  return (
    <div className="sandbox-panel zombie-lab-panel" aria-labelledby="zombie-lab-title">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className="panel-badge-code">KERNEL_LIFECYCLE</span>
          <h3 id="zombie-lab-title" className="panel-title">Zombie & Orphan Process Lab</h3>
        </div>
      </div>

      <div className="zombie-intro-grid">
        <div className="concept-card zombie-card font-mono">
          <div className="concept-header">
            <span className="concept-badge badge-zombie">🧟 Zombie Process</span>
          </div>
          <p className="concept-desc font-body">
            A child process that has finished execution (via <code>exit()</code>), but whose entry in the process table remains because its parent has not yet read its exit status with <code>wait()</code>.
          </p>
          <div className="concept-fix">
            <strong>Kernel Resolution:</strong> Parent calls <code>wait()</code> / <code>waitpid()</code> to <strong>reap</strong> the PCB.
          </div>
        </div>

        <div className="concept-card orphan-card font-mono">
          <div className="concept-header">
            <span className="concept-badge badge-orphan">👶 Orphan Process</span>
          </div>
          <p className="concept-desc font-body">
            A child process whose parent was terminated while the child is still executing. The child is left without a parent.
          </p>
          <div className="concept-fix">
            <strong>Kernel Resolution:</strong> Adopted by <strong>PID 1</strong> (<code>init</code> / <code>systemd</code>), which periodically calls <code>wait()</code>.
          </div>
        </div>
      </div>

      {/* Quick Trigger Scenarios */}
      <div className="zombie-actions-bar">
        <button
          type="button"
          className="lab-trigger-btn font-mono"
          onClick={handleCreateZombieDemo}
        >
          🧟 Load Zombie Scenario (Dead Child, Unreaped)
        </button>
      </div>

      {/* Active Zombies List */}
      <div className="zombie-status-section">
        <h4 className="section-subtitle font-heading">
          Active Zombies in Process Table ({zombieProcs.length})
        </h4>

        {zombieProcs.length === 0 ? (
          <div className="zombie-empty font-mono text-faint">
            ✓ No zombie processes lingering in kernel PCB table.
          </div>
        ) : (
          <div className="zombie-list font-mono">
            {zombieProcs.map((zp) => (
              <div key={zp.pid} className="zombie-item">
                <div className="zombie-info">
                  <span className="zombie-badge-glow">ZOMBIE PID {zp.pid}</span>
                  <span className="zombie-name">"{zp.name}"</span>
                  <span className="zombie-parent text-faint">Parent: PID {zp.ppid}</span>
                </div>
                <button
                  type="button"
                  className="reap-btn font-mono"
                  onClick={() => reapProcess(zp.pid)}
                  title="Simulate parent calling wait() to reap zombie"
                >
                  🧹 Reap PCB (wait())
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Orphans List */}
      <div className="orphan-status-section">
        <h4 className="section-subtitle font-heading">
          Adopted Orphan Processes ({orphanProcs.length})
        </h4>

        {orphanProcs.length === 0 ? (
          <div className="orphan-empty font-mono text-faint">
            ✓ No orphaned processes currently adopted by PID 1.
          </div>
        ) : (
          <div className="orphan-list font-mono">
            {orphanProcs.map((op) => (
              <div key={op.pid} className="orphan-item">
                <span className="orphan-badge">ORPHAN PID {op.pid}</span>
                <span className="orphan-name">"{op.name}"</span>
                <span className="orphan-adopted text-faint">Reparented to PPID {op.ppid} (init/systemd)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
