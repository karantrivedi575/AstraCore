import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div>
          <h3 style={{ marginBottom: '10px' }}>AstraCore Systems</h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
            <li><i className="fa-regular fa-envelope"></i> support@astracore.com</li>
            <li><i className="fa-solid fa-phone"></i> +91 98765 43210</li>
            <li><i className="fa-solid fa-location-dot"></i> Mumbai, India</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4 style={{ marginBottom: '15px' }}>Information</h4>
          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-links">
          <h4 style={{ marginBottom: '15px' }}>Components</h4>
          <Link to="/products">Processors</Link>
          <Link to="/products">Graphics Cards</Link>
          <Link to="/products">Motherboards</Link>
          <Link to="/products">Memory & Storage</Link>
        </div>

      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ccc', fontSize: '12px', color: '#888' }}>
        <p>© 2026 AstraCore. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;