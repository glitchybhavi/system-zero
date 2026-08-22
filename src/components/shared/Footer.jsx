//System Zero Footer Componenet - to be updated (Still a prototype)

import './Footer.css';

export default function Footer() {
  return (
    <footer className="modern-footer">
      {/* Top Section */}
      <div className="footer-top-tier">
        <h2 className="footer-brand-statement">Execute the theory.</h2>
        <div className="footer-nav-grid">
          <div className="footer-nav-col">
            <h5>Platform</h5>
            <a href="#home">Welcome Center</a>
            <a href="#architecture">Features</a>
            <a href="#documentation">API Specs</a>
            <a href="#ecosystem">Extensions</a>
          </div>
          <div className="footer-nav-col">
            <h5>Resources</h5>
            <a href="#">Documentation</a>
            <a href="#">Changelog</a>
            <a href="#">Community</a>
            <a href="#">Use Cases</a>
          </div>
        </div>
      </div>

      {/* Middle Section (Typography Text (Big Systsem Zero Text)) */}
      <div className="footer-middle-tier">
        <h1>System Zero</h1>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom-tier">
        <div className="footer-logo" style={{ color: 'rgb(212, 206, 206)', fontWeight: 500, fontSize: '15px' }}>
          © 2026 System Zero
        </div>
        <div className="footer-bottom-links">
          <a href="#">About System Zero</a>
          <a href="#">Products</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}
