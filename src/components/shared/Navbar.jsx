import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { OS_TOPICS } from '../../data/topics';
import './Navbar.css';

const GLASS_SPRING = { type: 'spring', stiffness: 400, damping: 30, mass: 0.5 };

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 26,
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.98,
    transition: { duration: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 350 } },
};

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    href: '/#home',
    isMega: false,
    options: [
      { label: 'Welcome Center', desc: 'Central hub & onboarding interface' },
      { label: 'Features Overview', desc: 'Explore core dynamic features' },
      { label: 'Quick Start Guide', desc: 'Get running in under 2 minutes' },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    href: '/launch',
    isMega: true,
  },
  {
    id: 'documentation',
    label: 'Documentation',
    href: '/#documentation',
    isMega: false,
    options: [
      { label: 'Installation Guide', desc: 'Package setups & build scripts' },
      { label: 'Config Reference', desc: 'Environment variables & schemas' },
      { label: 'Core API Spec', desc: 'Classes, methods & event listings' },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    href: '/#ecosystem',
    isMega: false,
    options: [
      { label: 'Extensions Registry', desc: 'Discover community additions' },
      { label: 'Official Plugins', desc: 'Verified core system add-ons' },
      { label: 'Custom Theme Store', desc: 'Dynamic interface styles & skins' },
    ],
  },
];

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('home');
  const [hoveredTab, setHoveredTab] = useState(null);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/launch') {
      setActiveTab('learn');
    } else if (location.pathname.startsWith('/os')) {
      setActiveTab('learn');
    } else if (location.pathname === '/') {
      setActiveTab('home');
    }
  }, [location.pathname]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseX, GLASS_SPRING);
  const smoothMouseY = useSpring(mouseY, GLASS_SPRING);

  const glareX = useTransform(smoothMouseX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothMouseY, [0, 1], ['0%', '100%']);

  const glareBackground = useTransform([glareX, glareY], ([gx, gy]) => (
    `radial-gradient(150px circle at ${gx} ${gy}, rgba(255,255,255,0.15), transparent 60%)`
  ));

  const handleMouseMove = (e) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const highlightedTab = hoveredTab || activeTab;

  const handleSubtopicClick = (route) => {
    setHoveredTab(null);
    if (route) {
      navigate(route);
    } else {
      navigate('/launch');
    }
  };

  const group1Topics = OS_TOPICS.slice(0, 10);
  const group2Topics = OS_TOPICS.slice(10, 19);

  return (
    <header className="navbar-header gpu-layer">
      <motion.nav
        ref={navRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.8 }}
        className="navbar-nav"
      >
        {/* Dynamic iPhone Highlight */}
        <motion.div
          className="navbar-glare"
          style={{ background: glareBackground }}
        />

        {/* Brand Logo */}
        <Link to="/" onClick={() => setActiveTab('home')} className="navbar-brand">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="navbar-brand-icon"
          >
            <div className="navbar-brand-icon-inner">
              <div className="navbar-brand-dot" />
            </div>
          </motion.div>
          <span className="navbar-brand-text glass-text">
            SYSTEM <span className="navbar-brand-text-accent">ZERO</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {NAV_ITEMS.map((item) => {
            const isHighlighted = highlightedTab === item.id;

            return (
              <div key={item.id} onMouseEnter={() => setHoveredTab(item.id)} className="navbar-link-wrap">
                <a
                  href={item.href}
                  onClick={(e) => {
                    setActiveTab(item.id);
                    if (item.id === 'learn') {
                      e.preventDefault();
                      navigate('/launch');
                    } else if (location.pathname !== '/') {
                      navigate('/');
                    }
                  }}
                  className="navbar-link"
                >
                  {/* Premium Liquid Pill Background */}
                  {isHighlighted && (
                    <motion.div layoutId="liquid-pill" transition={GLASS_SPRING} className="navbar-pill" />
                  )}

                  <span className={`navbar-link-label${isHighlighted ? ' is-active glass-text' : ''}`}>
                    {item.label}
                    {item.isMega && <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>}
                  </span>

                  {/* Sliding blue dot */}
                  {activeTab === item.id && (
                    <motion.span
                      layoutId="active-dot"
                      transition={{ type: 'spring', stiffness: 180, damping: 28, mass: 0.6 }}
                      className="navbar-active-dot"
                    />
                  )}
                </a>

                {/* Standard Dropdowns */}
                <AnimatePresence>
                  {hoveredTab === item.id && !item.isMega && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="navbar-dropdown"
                    >
                      <div className="navbar-dropdown-inner">
                        {item.options.map((opt, idx) => (
                          <motion.a
                            key={idx}
                            variants={itemVariants}
                            href={`/#${opt.label.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => {
                              if (location.pathname !== '/') navigate('/');
                            }}
                            className="navbar-dropdown-item"
                          >
                            <span className="navbar-dropdown-item-label">
                              <span className="navbar-dropdown-item-dot" />
                              {opt.label}
                            </span>
                            <span className="navbar-dropdown-item-desc">{opt.desc}</span>
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Codédex-style Mega Dropdown (Centered under LEARN tab) */}
                <AnimatePresence>
                  {hoveredTab === item.id && item.isMega && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="navbar-mega-dropdown"
                    >
                      <div className="navbar-mega-inner">
                        {/* Recommended Left Column */}
                        <div className="mega-left-panel">
                          <div className="mega-panel-heading">RECOMMENDED</div>

                          <div
                            className="mega-card"
                            onClick={() => handleSubtopicClick('/launch')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="mega-card-title">
                              <span className="mega-card-title-dot" />
                              Operating System
                            </div>
                            <div className="mega-card-desc">
                              Master kernel structures, process lifecycle, memory paging &amp; Linux architecture.
                            </div>
                          </div>

                          <div
                            className="mega-card"
                            onClick={() => handleSubtopicClick('/os/sync')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="mega-card-title">
                              <span className="mega-card-title-dot" style={{ background: '#c084fc', boxShadow: '0 0 10px #c084fc' }} />
                              Process Sync Lab
                            </div>
                            <div className="mega-card-desc">
                              Simulate Peterson's Solution, Mutex Locks &amp; Counting Semaphores in real-time.
                            </div>
                          </div>

                          <div
                            className="mega-card"
                            onClick={() => handleSubtopicClick('/learn/process-management')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="mega-card-title">
                              <span className="mega-card-title-dot" style={{ background: '#3FA66B', boxShadow: '0 0 10px #3FA66B' }} />
                              Process Management
                            </div>
                            <div className="mega-card-desc">
                              Visualize PCB lifecycle, CPU scheduling algorithms &amp; process state transitions.
                            </div>
                          </div>

                          <Link to="/launch" className="mega-btn-all" onClick={() => setHoveredTab(null)}>
                            All OS Modules 🚀
                          </Link>
                        </div>

                        {/* Domain Multi-Columns Right Panel */}
                        <div className="mega-right-panel">
                          {/* Column 1: OS CORE & PROCESSES */}
                          <div className="mega-domain-col">
                            <Link
                              to="/launch"
                              className="mega-domain-header"
                              onClick={() => setHoveredTab(null)}
                            >
                              <span>OS CORE &amp; PROCESSES</span>
                            </Link>

                            <div className="mega-subtopic-list">
                              {group1Topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="mega-subtopic-link"
                                  onClick={() => handleSubtopicClick(topic.route)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span>{topic.title}</span>
                                  {topic.route && <span className="mega-badge-tag">LIVE LAB</span>}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Column 2: MEMORY & STORAGE */}
                          <div className="mega-domain-col">
                            <Link
                              to="/launch"
                              className="mega-domain-header"
                              onClick={() => setHoveredTab(null)}
                            >
                              <span>MEMORY &amp; STORAGE</span>
                            </Link>

                            <div className="mega-subtopic-list">
                              {group2Topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="mega-subtopic-link"
                                  onClick={() => handleSubtopicClick(topic.route)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span>{topic.title}</span>
                                  {topic.route && <span className="mega-badge-tag">LIVE LAB</span>}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Column 3: ARCHITECTURE & LINUX */}
                          <div className="mega-domain-col">
                            <div className="mega-domain-header">
                              <span>SYSTEM &amp; SHELL</span>
                            </div>

                            <div className="mega-subtopic-list">
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>Von Neumann Architecture</span>
                              </div>
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>Bus Interconnects &amp; DMA</span>
                              </div>
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>Multi-core SMP Coherence</span>
                              </div>
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>Monolithic vs Microkernel</span>
                              </div>
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>POSIX Shell &amp; FHS</span>
                              </div>
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>Standard Streams &amp; Piping</span>
                              </div>
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>Chmod Permissions Matrix</span>
                              </div>
                              <div className="mega-subtopic-link" onClick={() => handleSubtopicClick('/launch')}>
                                <span>System Calls &amp; Ext4 Inodes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right Brand Spacer to keep navbar-links centered */}
        <div className="navbar-brand-spacer" />
      </motion.nav>
    </header>
  );
}
