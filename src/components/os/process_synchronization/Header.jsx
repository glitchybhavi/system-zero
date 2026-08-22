import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
  'race-condition': 'The Lost Update Problem (Race Condition)',
  'peterson': "Software Synchronization: Peterson's Algorithm",
  'mutex': 'Hardware Synchronization: Mutex Locks',
  'semaphore': 'Signaling Mechanisms: Counting Semaphores',
};

export default function Header() {
  const { pathname } = useLocation();
  
  const getHeaderTitle = () => {
    for (const [key, title] of Object.entries(ROUTE_TITLES)) {
      if (pathname.includes(key)) return title;
    }
    return 'Process Synchronization Hub';
  };

  return (
    <header className="header" role="banner">
      <div className="header-title-group">
        <h1>{getHeaderTitle()}</h1>
      </div>
    </header>
  );
}