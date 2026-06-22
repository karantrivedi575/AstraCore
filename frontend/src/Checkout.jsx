import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    phone: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const taxRate = 0.18; 
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }

    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
    
    if (savedCart.length === 0) {
      alert("Your cart is empty!");
      navigate('/products', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      alert("Please log in to place an order.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        slug: item.slug
      }));

      const orderPayload = {
        shipping: formData,
        items: formattedItems
      };

      const res = await axios.post('http://localhost:8080/api/orders', orderPayload, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      alert("Success! " + res.data.message);
      
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated')); 
      
      navigate('/my-orders', { replace: true });

    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Failed to place order. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate; 
  const total = subtotal + tax;

  return (
    <section style={{ padding: '60px 20px', background: '#f4f4f4', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', margin: 0 }}>Secure Checkout</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
          
          {/* Shipping Form */}
          <div style={{ background: '#fff', padding: '30px', border: '1px solid #ccc' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              Shipping Details
            </h2>
            
            <form onSubmit={handleCheckout}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>PIN Code</label>
                  <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  background: isSubmitting ? '#888' : '#000', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }} 
              >
                {isSubmitting ? 'Processing Order...' : `Place Order (₹${total.toLocaleString('en-IN')})`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div style={{ background: '#fff', padding: '30px', border: '1px solid #ccc', height: 'fit-content' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              Order Summary
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              {cartItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px' }}>{item.quantity}x {item.name}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Tax (18% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #000', fontWeight: 'bold', fontSize: '18px' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Checkout;