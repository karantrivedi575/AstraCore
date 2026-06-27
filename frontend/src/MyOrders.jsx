import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:8080/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => {
      const sortedOrders = res.data.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
      setLoading(false);
    })
    .catch(err => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        return; 
      }
      console.error("Error fetching orders:", err);
      setFetchError('Failed to load your order history. Please try again later.');
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--text-main)' }}><i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--primary)' }}></i> Loading your order history...</h2>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', minHeight: '60vh' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '20px', display: 'block' }}></i>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>{fetchError}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          <i className="fa-solid fa-rotate-right" style={{ marginRight: '8px' }}></i> Retry
        </button>
      </div>
    );
  }

  return (
    <section style={{ padding: '60px 20px', background: 'var(--bg-light)', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>My Orders</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Track and review your past purchases.</p>
          </div>
          <Link to="/products" className="btn-outline">
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: 'var(--bg-white)', padding: '60px', borderRadius: '15px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '64px', color: 'var(--border-color)', marginBottom: '20px' }}></i>
            <h2 style={{ color: 'var(--text-main)' }}>No orders yet!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Your transaction history is currently empty. Time to change that!</p>
            <Link to="/build-pc" className="btn-primary" style={{ display: 'inline-block' }}>
              Build a Custom PC
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ background: 'var(--bg-white)', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                
                {/* Order Header */}
                <div style={{ background: 'var(--bg-light)', padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'flex', gap: '30px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Order #ID</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '16px' }}>ASTRA-{order.id.toString().padStart(6, '0')}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Total Amount</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '18px' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--text-main)', borderBottom: '2px solid var(--bg-light)', paddingBottom: '10px', marginBottom: '20px', fontSize: '15px' }}>Acquired Assets</h4>
                  
                  {order.items.map((item, index) => (
                    <div key={item.id || index} style={{ display: 'flex', gap: '20px', paddingBottom: index !== order.items.length - 1 ? '20px' : '0', borderBottom: index !== order.items.length - 1 ? '1px solid var(--bg-light)' : 'none', marginBottom: index !== order.items.length - 1 ? '20px' : '0' }}>
                      
                      {/* Thumbnail */}
                      <div style={{ width: '80px', height: '80px', background: 'var(--bg-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        <img src={item.productImage || (item.buildDetails ? '/PC_Case.png' : '/pc-computer.png')} alt={item.productName} style={{ maxWidth: '70%', maxHeight: '70%', objectFit: 'contain' }} onError={(e) => e.target.src = '/pc-computer.png'} />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'var(--text-main)' }}>{item.productName}</h4>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>

                        {/* Custom Build Details Box */}
                        {item.buildDetails && (
                          <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginTop: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                              <i className="fa-solid fa-wrench"></i> Custom Build Configuration
                            </span>
                            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                              {item.buildDetails.split(' | ').map((part, i) => (
                                <li key={i}>{part}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

                {/* Status Footer */}
                <div style={{ background: 'var(--bg-white)', padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: order.status === 'PENDING' ? '#f1c40f' : '#2ecc71', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Status: <span style={{ color: 'var(--text-main)' }}>{order.status || 'PROCESSING'}</span>
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default MyOrders;