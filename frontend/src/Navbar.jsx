import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
  };

  const checkAuth = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  };

  useEffect(() => {
    updateCartCount();
    checkAuth();

    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('authUpdated', checkAuth); 
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('authUpdated', checkAuth);
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false); // Closes menu on logout
    window.dispatchEvent(new Event('storage')); 
    navigate('/'); 
  };

  return (
    <header className="navbar" style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
      
      {/* 1. LOGO */}
      <div className="logo-box" style={{ flex: '1' }}>
        <Link to="/">
          <img src="/WebsiteLogo.png" alt="AstraCore Logo" style={{ height: '40px' }} />
        </Link>
      </div>

      {/* 2. MAIN LINKS */}
      <nav className="nav-links" id="navLinks" style={{ flex: '2', display: 'flex', justifyContent: 'center', gap: '25px', fontWeight: '600', color: '#555' }}>
        <Link to="/" style={{ color: location.pathname === '/' ? '#6b4eff' : 'inherit', textDecoration: 'none' }}>Home</Link>
        <Link to="/products" style={{ color: location.pathname.includes('/product') ? '#6b4eff' : 'inherit', textDecoration: 'none' }}>Products</Link>
        <Link to="/trending" style={{ color: location.pathname === '/trending' ? '#6b4eff' : 'inherit', textDecoration: 'none' }}>Trending</Link>
        <Link to="/about" style={{ color: location.pathname === '/about' ? '#6b4eff' : 'inherit', textDecoration: 'none' }}>About</Link>
      </nav>

      {/* 3. ACTIONS (Search, Cart, User) */}
      <div className="nav-actions" style={{ flex: '1.5', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', background: '#f4f7fa', borderRadius: '20px', padding: '5px 15px', border: '1px solid #eaeaea' }}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '150px', fontSize: '14px' }}
          />
          <button type="submit" style={{ border: 'none', background: 'transparent', color: '#888', cursor: 'pointer' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        {/* Cart Icon */}
        <Link to="/cart" style={{ textDecoration: 'none', color: '#333', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <i className="fa-solid fa-cart-shopping" style={{ fontSize: '20px' }}></i>
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#ff4e4e', color: 'white', fontSize: '11px', fontWeight: 'bold', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              {cartCount}
            </span>
          )}
        </Link>

        {/* --- Fixed User Profile dropdown --- */}
        {user ? (
          <div className="user-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
            
            {/* Avatar Button */}
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#6b4eff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', border: '2px solid #e1e1e1' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <i className={`fa-solid fa-chevron-${isDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '12px', color: '#888' }}></i>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '50px', right: '0', width: '220px', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
                
                {/* Header Profile Info */}
                <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #eaeaea' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Signed in as</p>
                  <p style={{ margin: '2px 0 0 0', fontWeight: 'bold', color: '#333', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.username}
                  </p>
                </div>

                {/* Menu Links */}
                <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
                  <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} style={{ padding: '10px 20px', textDecoration: 'none', color: '#555', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }}>
                    <i className="fa-regular fa-heart" style={{ width: '16px' }}></i> My Wishlist
                  </Link>
                  <Link to="/my-orders" onClick={() => setIsDropdownOpen(false)} style={{ padding: '10px 20px', textDecoration: 'none', color: '#555', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }}>
                    <i className="fa-solid fa-box-open" style={{ width: '16px' }}></i> My Orders
                  </Link>
                  
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setIsDropdownOpen(false)} style={{ padding: '10px 20px', textDecoration: 'none', color: '#e74c3c', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }}>
                      <i className="fa-solid fa-user-shield" style={{ width: '16px' }}></i> Admin Control
                    </Link>
                  )}
                </div>

                {/* Logout Button */}
                <div style={{ padding: '8px', borderTop: '1px solid #eaeaea' }}>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#fff', border: 'none', color: '#ff4e4e', fontWeight: 'bold', fontSize: '14px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '6px' }}>
                    <i className="fa-solid fa-right-from-bracket" style={{ width: '16px' }}></i> Log Out
                  </button>
                </div>

              </div>
            )}
          </div>
        ) : (
          <div className="auth-btns" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#333', fontWeight: '600', fontSize: '14px', padding: '8px 12px' }}>
              Log In
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#6b4eff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Join
              </button>
            </Link>
          </div>
        )}
        
      </div>
    </header>
  );
}

export default Navbar;