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
      // Sorting orders newest first
      const sortedOrders = res.data.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching orders:", err);
      setFetchError('Failed to load your order history. Please try again later.');
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <h2>Loading your order history...</h2>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <h2 style={{ color: '#d63031', marginBottom: '10px' }}>Connection Error</h2>
        <p>{fetchError}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section style={{ padding: '60px 20px', minHeight: '80vh', background: '#f4f4f4' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>My Orders</h1>
          <Link to="/products" style={{ padding: '10px 20px', background: '#fff', border: '1px solid #000', color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', padding: '60px', textAlign: 'center', border: '1px solid #ccc' }}>
            <h2>No orders yet!</h2>
            <p style={{ color: '#555', marginBottom: '20px' }}>Your transaction history is empty.</p>
            <Link to="/products" style={{ padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none' }}>
              Explore Components
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ background: '#fff', border: '1px solid #ccc' }}>
                
                {/* Order Header */}
                <div style={{ background: '#eee', padding: '15px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '12px', color: '#555', fontWeight: 'bold' }}>ORDER ID</span>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>ASTRA-{order.id}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '12px', color: '#555', fontWeight: 'bold' }}>TOTAL AMOUNT</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: '20px' }}>
                  <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Items</h4>
                  
                  {order.items.map((item, index) => (
                    <div key={item.id || index} style={{ display: 'flex', gap: '15px', marginBottom: index !== order.items.length - 1 ? '15px' : '0' }}>
                      
                      <div style={{ width: '60px', height: '60px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={item.productImage || '/pc-computer.png'} alt={item.productName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.target.src = '/pc-computer.png'} />
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{item.productName}</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Footer */}
                <div style={{ background: '#fafafa', padding: '10px 20px', borderTop: '1px solid #ccc', fontSize: '14px', fontWeight: 'bold' }}>
                  Status: <span style={{ color: order.status === 'PENDING' ? '#d35400' : '#27ae60' }}>{order.status || 'PROCESSING'}</span>
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