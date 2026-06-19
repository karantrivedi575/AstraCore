import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const taxRate = 0.18; 
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  const syncCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated')); // Updates Navbar instantly
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
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '30px' }}>Your Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="cart-container" style={{ padding: 0 }}>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <img 
                  src={item.image || '/pc-computer.png'} 
                  alt={item.name} 
                  onError={(e) => e.target.src = '/pc-computer.png'} 
                />
                
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.slug}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                    {item.name}
                  </Link>
                  
                  <div style={{ margin: '15px 0', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '5px 12px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc' }}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '5px 12px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc' }}>+</button>
                  </div>

                  <p style={{ fontWeight: 'bold' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  
                  <button 
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}
                  >
                     Remove Item
                  </button>
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <button onClick={clearCart} style={{ padding: '8px 15px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc' }}>
                 Clear Entire Cart
              </button>
            </div>
          </div>

          <div className="cart-summary">
            <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Tax (18% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button 
              onClick={() => navigate('/checkout')} 
              className="checkout-btn" 
              style={{ width: '100%', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '15px' }}
            >
                Proceed to Checkout
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', border: '1px solid #ccc' }}>
            <h3>Your cart is currently empty.</h3>
            <Link to="/products" style={{ display: 'inline-block', marginTop: '20px', color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>
                Explore Components &rarr;
            </Link>
        </div>
      )}
    </div>
  );
}

export default Cart;