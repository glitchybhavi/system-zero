import { Link } from 'react-router-dom';
import { OS_TOPICS } from '../../../data/topics';
import ProcessSandbox from '../../../components/os/process-sandbox/ProcessSandbox';
import Footer from '../../../components/shared/Footer';
import './ProcessManagementPage.css';

const CURRENT_TOPIC_ID = 6; // Process Management

export default function ProcessManagementPage() {
  const currentIndex = OS_TOPICS.findIndex((t) => t.id === CURRENT_TOPIC_ID);
  const prevTopic = currentIndex > 0 ? OS_TOPICS[currentIndex - 1] : null;
  const nextTopic = currentIndex < OS_TOPICS.length - 1 ? OS_TOPICS[currentIndex + 1] : null;

  return (
    <div className="pm-page-root">
      {/* Breadcrumb Navigation */}
      <nav className="pm-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="pm-breadcrumb-link">Home</Link>
        <span className="pm-breadcrumb-sep">/</span>
        <Link to="/launch" className="pm-breadcrumb-link">Learn</Link>
        <span className="pm-breadcrumb-sep">/</span>
        <Link to="/learn/process-management" className="pm-breadcrumb-link">Process Management Theory</Link>
        <span className="pm-breadcrumb-sep">/</span>
        <span className="pm-breadcrumb-current">Simulator Sandbox</span>
      </nav>

      {/* Main Sandbox Content */}
      <ProcessSandbox />

      {/* Prev / Next Module Navigation */}
      <nav className="pm-prev-next" aria-label="Module navigation">
        <div className="pm-nav-side">
          {prevTopic ? (
            <Link
              to={prevTopic.route || '/launch'}
              className="pm-nav-card pm-nav-prev"
            >
              <span className="pm-nav-direction">← Previous</span>
              <span className="pm-nav-title">{prevTopic.title}</span>
              {!prevTopic.route && <span className="pm-nav-badge">Coming Soon</span>}
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div className="pm-nav-side">
          {nextTopic ? (
            <Link
              to={nextTopic.route || '/launch'}
              className="pm-nav-card pm-nav-next"
            >
              <span className="pm-nav-direction">Next →</span>
              <span className="pm-nav-title">{nextTopic.title}</span>
              {!nextTopic.route && <span className="pm-nav-badge">Coming Soon</span>}
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>

      <Footer />
    </div>
  );
}
