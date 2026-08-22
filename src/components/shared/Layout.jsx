import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="layout-root">
      <Navbar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}