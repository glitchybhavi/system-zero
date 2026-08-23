import { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
    href: '#home',
    options: [
      { label: 'Welcome Center', desc: 'Central hub & onboarding interface' },
      { label: 'Features Overview', desc: 'Explore core dynamic features' },
      { label: 'Quick Start Guide', desc: 'Get running in under 2 minutes' },
    ],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    href: '#architecture',
    options: [
      { label: 'System Core', desc: 'Microkernel architecture design' },
      { label: 'Liquid Physics', desc: 'Satin-fluid canvas mechanics' },
      { label: '3D Render Pipeline', desc: 'Custom shaders & lighting tech' },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentation',
    href: '#documentation',
    options: [
      { label: 'Installation Guide', desc: 'Package setups & build scripts' },
      { label: 'Config Reference', desc: 'Environment variables & schemas' },
      { label: 'Core API Spec', desc: 'Classes, methods & event listings' },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    href: '#ecosystem',
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
        <a href="#home" onClick={() => setActiveTab('home')} className="navbar-brand">
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
        </a>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {NAV_ITEMS.map((item) => {
            const isHighlighted = highlightedTab === item.id;

            return (
              <div key={item.id} onMouseEnter={() => setHoveredTab(item.id)} className="navbar-link-wrap">
                <a href={item.href} onClick={() => setActiveTab(item.id)} className="navbar-link">
                  {/* Premium Liquid Pill Background */}
                  {isHighlighted && (
                    <motion.div layoutId="liquid-pill" transition={GLASS_SPRING} className="navbar-pill" />
                  )}

                  <span className={`navbar-link-label${isHighlighted ? ' is-active glass-text' : ''}`}>
                    {item.label}
                  </span>

                  {/* Sliding blue dot — always tracks activeTab, never hover */}
                  {activeTab === item.id && (
                    <motion.span
                      layoutId="active-dot"
                      transition={{ type: 'spring', stiffness: 180, damping: 28, mass: 0.6 }}
                      className="navbar-active-dot"
                    />
                  )}
                </a>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {hoveredTab === item.id && (
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
                            href={`#${opt.label.toLowerCase().replace(/\s+/g, '-')}`}
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
              </div>
            );
          })}
        </div>

        {/* Launch Button */}
        <div className="navbar-cta-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="navbar-cta-btn"
          >
            <div className="navbar-cta-btn-bg" />
            <span className="navbar-cta-btn-text glass-text">LAUNCH</span>
          </motion.button>
        </div>
      </motion.nav>
    </header>
  );
}
