import { useLocation } from 'react-router-dom';

const ROUTE_INFO = {
  'race-condition': {
    category: 'Concurrency Anomaly',
    title: 'The Lost Update Problem',
  },
  'peterson': {
    category: 'Software Synchronization',
    title: "Peterson's Algorithm",
  },
  'mutex': {
    category: 'Hardware Synchronization',
    title: 'Mutex Locks',
  },
  'semaphore': {
    category: 'Signaling Mechanisms',
    title: 'Counting Semaphores',
  },
};

export default function Header() {
  const { pathname } = useLocation();

  const getHeaderInfo = () => {
    for (const [key, info] of Object.entries(ROUTE_INFO)) {
      if (pathname.includes(key)) return info;
    }
    return {
      category: 'Process Synchronization',
      title: 'Overview Hub',
    };
  };

  const info = getHeaderInfo();

  return (
    <header className="header" role="banner">
      <div className="header-title-group">
        <span className="header-category-label">{info.category}</span>
        <h1>{info.title}</h1>
      </div>
    </header>
  );
}