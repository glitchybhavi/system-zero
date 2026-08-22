import { NavLink, Link } from "react-router-dom";

const SYNC_ROUTES = [
  { path: "/os/sync", label: "Overview Hub", end: true },
  { path: "/os/sync/race-condition", label: "Race Condition", end: false },
  { path: "/os/sync/peterson", label: "Peterson's Solution", end: false },
  { path: "/os/sync/mutex", label: "Mutex Lock", end: false },
  { path: "/os/sync/semaphore", label: "Counting Semaphore", end: false },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Process Synchronization Sidebar">
      <section>
        <header className="sidebar-section-label">
          Process Synchronization
        </header>
        <nav className="nav-menu" aria-label="Synchronization Modules">
          {SYNC_ROUTES.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{route.label}</span>
            </NavLink>
          ))}
        </nav>
      </section>
    </aside>
  );
}
