import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    phone: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [taxRate, setTaxRate] = useState(0.18);
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

    axios.get('http://localhost:8080/api/config/tax-rate')
      .then(res => setTaxRate(res.data.taxRate))
      .catch(err => console.error("Could not fetch tax rate", err));

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
      const formattedItems = cartItems.map(item => {
        let detailsString = null;
        let partIds = []; 

        if (item.isBuild && item.parts) {
          const partsArray = [];
          
          if (item.parts.CPU) {
            partsArray.push(`CPU: ${item.parts.CPU.name}`);
            partIds.push(item.parts.CPU.id); 
          }
          if (item.parts.GPU) {
            partsArray.push(`GPU: ${item.parts.GPU.name}`);
            partIds.push(item.parts.GPU.id); 
          }
          if (item.parts.RAM) {
            partsArray.push(`RAM: ${item.parts.RAM.name}`);
            partIds.push(item.parts.RAM.id); 
          }
          if (item.parts.Motherboard) {
            partsArray.push(`Motherboard: ${item.parts.Motherboard.name}`);
            partIds.push(item.parts.Motherboard.id); 
          }
          
          detailsString = partsArray.join(" | "); 
        }

        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          slug: item.slug,
          buildDetails: detailsString,
          partIds: partIds 
        };
      });

      const orderPayload = {
        shipping: formData,
        items: formattedItems 
      };

      const res = await axios.post('http://localhost:8080/api/orders', orderPayload, {
        headers: {
          Authorization: `Bearer ${user.token}` 
        }
      });
      
      alert("Success! " + res.data);
      
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated')); 
      
      navigate('/', { replace: true }); 

    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        return; 
      }

      console.error("Checkout Error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate; 
  const total = subtotal + tax;

  return (
    <section style={{ padding: '60px 20px', background: 'var(--bg-light)', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--secondary)' }}>Checkout</h1>
          <p style={{ color: 'var(--text-muted)' }}>Complete your order securely.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }} className="checkout-layout">
          
          {/* LEFT: Shipping Form */}
          <div style={{ background: 'var(--bg-white)', padding: '40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '25px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--secondary)' }}>
              Shipping Details
            </h2>
            
            <form onSubmit={handleCheckout}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="checkout-input" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="checkout-input" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="checkout-input" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="checkout-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="checkout-input" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="checkout-input" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>PIN Code</label>
                  <input type="text" name="pin_code" value={formData.pin_code} onChange={handleInputChange} required className="checkout-input" />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="checkout-input" />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  background: isSubmitting ? '#a29bfe' : 'var(--primary)', 
                  color: 'var(--bg-white)', 
                  border: 'none', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                  transition: '0.3s' 
                }} 
                className="place-order-btn"
              >
                {isSubmitting ? (
                  <span><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Processing Order...</span>
                ) : (
                  <span>Place Order (₹{total.toLocaleString('en-IN')})</span>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div style={{ background: 'var(--bg-white)', padding: '40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', height: 'fit-content', position: 'sticky', top: '100px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '25px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--secondary)' }}>
              Order Summary
            </h2>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
              {cartItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--bg-light)', paddingBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--bg-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                       <img src={item.image || '/pc-computer.png'} alt={item.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} onError={(e) => e.target.src = '/pc-computer.png'} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', marginBottom: '5px', color: 'var(--text-main)' }}>{item.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                <span>Tax ({(taxRate * 100).toFixed(0)}% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: '#1aa34a', fontWeight: 600 }}>Free</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border-color)', fontSize: '18px', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-main)' }}>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '25px', padding: '15px', background: 'var(--bg-light)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
               <i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> Secure SSL Checkout
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Checkout;