import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [taxRate, setTaxRate] = useState(0.18);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);

    
    axios.get('http://localhost:8080/api/config/tax-rate')
      .then(res => setTaxRate(res.data.taxRate))
      .catch(err => console.error("Could not fetch tax rate", err));
  }, []);

  const syncCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated')); 
  };

  const updateQuantity = (id, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity >= 1 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    });
    syncCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    syncCart(updatedCart);
  };

  const clearCart = () => {
    if(window.confirm("Are you sure you want to remove all items?")) {
      syncCart([]);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <>
      <section className="cart-hero">
        <h1>Your <span>Shopping Cart</span></h1>
        <p>Review your high-performance components before checkout.</p>
      </section>

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image || '/pc-computer.png'} alt={item.name} onError={(e) => e.target.src = '/pc-computer.png'} />
                  
                  <div className="item-info">
                    <Link to={`/product/${item.slug}`} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                      <h3>{item.name}</h3>
                    </Link>
                    
                    <div className="quantity-control">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>

                    <p className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ff4e4e', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                       <i className="fa-solid fa-trash"></i> Remove
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button onClick={clearCart} className="clear-cart-link">
                    <i className="fa-solid fa-broom"></i> Clear Entire Cart
                </button>
              </div>
            </>
          ) : (
            <div className="empty-cart-msg">
                <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Your cart is currently empty.</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Ready to build something powerful?</p>
                <Link to="/products" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, fontSize: '18px' }}>
                    Explore Components <i className="fa-solid fa-arrow-right"></i>
                </Link>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary">
            <h2 style={{ color: 'var(--text-main)' }}>Order Summary</h2>
            <div className="summary-row">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
                <span style={{ color: 'var(--text-muted)' }}>Tax ({(taxRate * 100).toFixed(0)}% GST)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
                <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                <span style={{ color: '#1aa34a', fontWeight: 600 }}>FREE</span>
            </div>
            <div className="summary-row total-row">
                <span style={{ color: 'var(--text-main)' }}>Total</span>
                <span style={{ color: 'var(--text-main)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="checkout-btn">
                Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;