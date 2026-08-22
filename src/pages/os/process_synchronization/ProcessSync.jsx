import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/os/process_synchronization/Sidebar';
import Header from '../../../components/os/process_synchronization/Header';
import '../../../styles/os/process_synchronization/theme.css';
import '../../../styles/os/process_synchronization/layout.css';
import '../../../styles/os/process_synchronization/animations.css';

export default function ProcessSync() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
