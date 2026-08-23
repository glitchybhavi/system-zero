import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/shared/Layout';

// Dynamic code-splitting: each page is compiled into its own isolated chunk
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LaunchPage = lazy(() => import('./pages/LaunchPage'));
const ProcessSync = lazy(() => import('./pages/os/process_synchronization/ProcessSync'));
const ProcessSyncHub = lazy(() => import('./pages/os/process_synchronization/ProcessSyncHub'));
const MutexPage = lazy(() => import('./pages/os/process_synchronization/MutexPage'));
const PetersonPage = lazy(() => import('./pages/os/process_synchronization/PetersonPage'));
const RaceConditionPage = lazy(() => import('./pages/os/process_synchronization/RaceConditionPage'));
const SemaphorePage = lazy(() => import('./pages/os/process_synchronization/SemaphorePage'));

function RouteLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      minHeight: '280px',
      color: 'var(--text-secondary)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#38bdf8',
          boxShadow: '0 0 12px #38bdf8'
        }} />
        <span style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>Loading simulation...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="launch" element={<LaunchPage />} />
            <Route path="os/sync" element={<ProcessSync />}>
              <Route index element={<ProcessSyncHub />} />
              <Route path="mutex" element={<MutexPage />} />
              <Route path="peterson" element={<PetersonPage />} />
              <Route path="race-condition" element={<RaceConditionPage />} />
              <Route path="semaphore" element={<SemaphorePage />} />
            </Route>
          </Route>
          {/* Fallback wildcard redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}