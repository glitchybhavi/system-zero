import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../../components/os/process_synchronization/Sidebar';
import Header from '../../../components/os/process_synchronization/Header';
import Footer from '../../../components/shared/Footer';
import '../../../styles/os/process_synchronization/theme.css';
import '../../../styles/os/process_synchronization/layout.css';
import '../../../styles/os/process_synchronization/animations.css';

export default function ProcessSync() {
  const location = useLocation();
  const isTheoryHub = location.pathname === '/os/sync' || location.pathname === '/os/sync/';

  return (
    <div className={`process-sync-root ${!isTheoryHub ? 'is-sim-page' : ''}`}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header />
          <div className="page-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
      {isTheoryHub && <Footer />}
    </div>
  );
}


