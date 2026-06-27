import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:8080/api/wishlist', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => {
      setWishlistItems(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching wishlist:", err);
      setLoading(false);
    });
  }, [navigate]);

  const handleRemove = (productId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Optimistic UI update
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));

    axios.post(`http://localhost:8080/api/wishlist/toggle/${productId}`, {}, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).catch(err => console.error("Failed to remove item", err));
  };

  const handleAddToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated')); 
    alert(`${product.name} added to cart!`);
    
    handleRemove(product.id); 
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your saved items...</div>;

  return (
    <section style={{ padding: '60px 20px', background: 'var(--bg-light)', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            <i className="fa-solid fa-heart" style={{ color: '#ff4e4e', marginRight: '10px' }}></i>
            My Wishlist
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Items you've saved for later.</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-white)', borderRadius: '15px', boxShadow: 'var(--shadow-sm)' }}>
            <i className="fa-regular fa-heart" style={{ fontSize: '64px', color: '#ccc', marginBottom: '20px' }}></i>
            <h2 style={{ color: 'var(--text-main)' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Save your favorite components so you don't lose track of them!</p>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-block' }}>
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {wishlistItems.map(product => (
              <div className="product-card" key={product.id} style={{ position: 'relative' }}>
                <button 
                  onClick={() => handleRemove(product.id)}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', zIndex: 2, color: '#ff4e4e' }}
                  title="Remove from Wishlist"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
                
                <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="product-image">
                    <img src={product.image || '/pc-computer.png'} alt={product.name} onError={(e) => e.target.src = '/pc-computer.png'} />
                  </div>
                  <div className="product-info">
                    <span className="category" style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {product.category ? product.category.name : "Hardware"}
                    </span>
                    <h3 style={{ marginTop: '5px' }}>{product.name}</h3>
                    <div className="price-row" style={{ marginTop: '10px' }}>
                      <span className="new-price">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Link>
                
                <div style={{ padding: '0 16px 16px' }}>
                  <button className="btn-primary" onClick={() => handleAddToCart(product)} style={{ width: '100%', marginTop: '10px' }}>
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;