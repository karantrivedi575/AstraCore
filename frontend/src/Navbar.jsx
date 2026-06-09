import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="navbar">
      
      <div className="logo-box">
        <Link to="/" style={{ textDecoration: 'none', color: '#111', fontSize: '22px', fontWeight: 'bold' }}>
          AstraCore.
        </Link>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
      </nav>

      <div className="nav-actions">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        <Link to="/cart" style={{ color: '#333', fontSize: '18px' }}>
          <i className="fa-solid fa-cart-shopping"></i>
        </Link>
        
        <Link to="/login" className="login-btn" style={{ textDecoration: 'none' }}>
          Log In
        </Link>
      </div>

    </header>
  );
}

export default Navbar;