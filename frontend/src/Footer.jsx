import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div style={{ flex: '1.5' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--secondary)', fontSize: '20px' }}>AstraCore Systems</h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <li><i className="fa-regular fa-envelope" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> support@astracore.com</li>
            <li><i className="fa-solid fa-phone" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> +91 98765 43210</li>
            <li><i className="fa-solid fa-location-dot" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Mumbai, India</li>
          </ul>
        </div>

        <div className="footer-links" style={{ flex: '1' }}>
          <h4 style={{ marginBottom: '15px', color: 'var(--secondary)' }}>Information</h4>
          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
          <Link to="/build-pc">PC Configurator</Link> 
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-links" style={{ flex: '1' }}>
          <h4 style={{ marginBottom: '15px', color: 'var(--secondary)' }}>Components</h4>
          <Link to="/products">Processors</Link>
          <Link to="/products">Graphics Cards</Link>
          <Link to="/products">Motherboards</Link>
          <Link to="/products">Memory & Storage</Link>
        </div>

      </div>
      
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} AstraCore Systems. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;