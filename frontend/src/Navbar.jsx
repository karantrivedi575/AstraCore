import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isAuth, setIsAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const updateState = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    setIsAuth(!!localStorage.getItem('user'));
  };

  useEffect(() => {
    updateState();
    
    window.addEventListener('cartUpdated', updateState);
    window.addEventListener('authChange', updateState);
    
    return () => {
      window.removeEventListener('cartUpdated', updateState);
      window.removeEventListener('authChange', updateState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="logo-box">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--secondary)', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          AstraCore.
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/products">Components</Link>
        <Link to="/build-pc">PC Configurator</Link>
        {isAuth && <Link to="/my-orders">My Orders</Link>}
      </div>

      <div className="nav-actions">
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        <Link to="/cart" style={{ color: 'var(--text-main)', fontSize: '18px', position: 'relative', textDecoration: 'none' }}>
          <i className="fa-solid fa-cart-shopping"></i>
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--primary)', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '50px', fontWeight: 'bold' }}>
              {cartCount}
            </span>
          )}
        </Link>
        
        {isAuth ? (
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>Logout</button>
        ) : (
          <Link to="/login" className="login-btn">Log In</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;