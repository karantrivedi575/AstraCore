import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [activeTab, setActiveTab] = useState('orders'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState({}); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null, name: '', slug: '', price: '', categoryId: 1, 
    description: '', stockStatus: 'In Stock', isTrending: false, image: ''
  });

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const orderRes = await axios.get('http://localhost:8080/api/admin/orders', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrders(orderRes.data);

        const inventoryRes = await axios.get('http://localhost:8080/api/products?page=0&size=1000');
        const products = inventoryRes.data.products;
        setInventory(products);

        const categoryMap = {};
        products.forEach(p => {
          if (p.category && p.category.id && !categoryMap[p.category.id]) {
            categoryMap[p.category.id] = p.category.name || p.category.slug;
          }
        });
        setCategories(categoryMap);
        
        setLoading(false);
      } catch (err) {
        console.error("Admin fetch error:", err);
        if (err.response?.status === 403) {
          setError("Access Denied: You require Level 4 ADMIN clearance.");
        } else {
          setError("System link severed. Failed to load data.");
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await axios.put(`http://localhost:8080/api/admin/orders/${orderId}/status`, 
        { status: newStatus }, { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      alert("Failed to update shipping matrix!");
    }
  };

  const openAddModal = () => {
    setProductForm({ id: null, name: '', slug: '', price: '', categoryId: 1, description: '', stockStatus: 'In Stock', isTrending: false, image: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      categoryId: product.category?.id || 1,
      description: product.description || '',
      stockStatus: product.stock_status || 'In Stock',
      isTrending: product.is_trending || false,
      image: product.image || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/admin/products/${productForm.id}`, productForm, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('http://localhost:8080/api/admin/products', productForm, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      setIsModalOpen(false);
      alert(`Product ${isEditing ? 'Updated' : 'Added'} Successfully! Refreshing databanks...`);
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.error || "Failed to process product mutation.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this hardware?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setInventory(inventory.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Error: Product is likely locked to an existing order history.");
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}><i className="fa-solid fa-circle-notch fa-spin"></i> Initializing Secure Uplink...</div>;
  if (error) return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <i className="fa-solid fa-shield-halved" style={{ fontSize: '64px', color: '#e74c3c', marginBottom: '20px' }}></i>
      <h2 style={{ color: '#e74c3c' }}>{error}</h2>
    </div>
  );

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* HEADER & TABS */}
      <div style={{ background: '#1e272e', color: '#fff', padding: '40px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <i className="fa-solid fa-server" style={{ color: 'var(--primary)' }}></i> AstraCore Nexus Control
          </h1>
          <p style={{ color: '#a4b0be', marginTop: '10px' }}>Welcome back, Commander {user.username}.</p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button onClick={() => setActiveTab('orders')} style={{ padding: '12px 25px', background: activeTab === 'orders' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
              <i className="fa-solid fa-box-open" style={{ marginRight: '8px' }}></i> Order Logistics
            </button>
            <button onClick={() => setActiveTab('inventory')} style={{ padding: '12px 25px', background: activeTab === 'inventory' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
              <i className="fa-solid fa-microchip" style={{ marginRight: '8px' }}></i> Inventory Matrix
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* --- VIEW 1: ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
                <h3 style={{ margin: 0, color: '#2f3640' }}>Active Fulfillment Queue</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Order ID</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Customer</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Status Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                        <td style={{ padding: '15px', fontWeight: 700, color: 'var(--primary)' }}>AST-{order.id.toString().padStart(5, '0')}</td>
                        <td style={{ padding: '15px', color: '#555', fontSize: '14px' }}>{new Date(order.orderDate).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: 600, color: '#333' }}>{order.firstName} {order.lastName}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>{order.email}</div>
                        </td>
                        <td style={{ padding: '15px', fontWeight: 700, color: '#333' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '15px' }}>
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', background: order.status === 'DELIVERED' ? '#e8f8f5' : '#fdf2e9', color: order.status === 'DELIVERED' ? '#27ae60' : '#f39c12', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: INVENTORY --- */}
        {activeTab === 'inventory' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2f3640', margin: 0 }}>Hardware Database</h2>
              <button onClick={openAddModal} style={{ background: '#2ecc71', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)' }}>
                <i className="fa-solid fa-plus"></i> Add Hardware
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Product</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>SKU / Slug</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Base Price</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(product => (
                      <tr key={product.id} style={{ borderBottom: '1px solid #eaeaea', transition: '0.2s' }}>
                        <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img src={product.image || '/pc-computer.png'} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#f4f4f4', borderRadius: '6px', padding: '5px' }} />
                          <div style={{ fontWeight: 600, color: '#333' }}>
                            {product.name}
                            {product.is_trending && <span style={{ marginLeft: '10px', fontSize: '10px', background: '#ffeaa7', color: '#d35400', padding: '2px 6px', borderRadius: '4px' }}>TRENDING</span>}
                          </div>
                        </td>
                        <td style={{ padding: '15px', color: '#888', fontSize: '13px' }}>{product.slug}</td>
                        <td style={{ padding: '15px', fontWeight: 700, color: 'var(--primary)' }}>₹{product.price.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '15px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: product.stock_status === 'In Stock' ? '#e8f8f5' : '#fdedec', color: product.stock_status === 'In Stock' ? '#27ae60' : '#e74c3c' }}>
                            {product.stock_status || 'In Stock'}
                          </span>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <button onClick={() => openEditModal(product)} style={{ background: '#f1f2f6', color: '#2f3640', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}>
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- FLOATING MODAL OVERLAY --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', fontSize: '20px', color: '#888', cursor: 'pointer' }}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h2 style={{ margin: '0 0 25px 0', color: '#2f3640', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
              {isEditing ? 'Modify Hardware Matrix' : 'Deploy New Hardware'}
            </h2>

            <form onSubmit={handleProductSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Product Name</label>
                  <input type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>URL Slug</label>
                  <input type="text" value={productForm.slug} onChange={(e) => setProductForm({...productForm, slug: e.target.value})} required placeholder="e.g. ryzen-5" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Price (INR)</label>
                  <input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Category</label>
                  <select value={productForm.categoryId} onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}>
                    {Object.keys(categories).length > 0 ? (
                      Object.entries(categories).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))
                    ) : (
                      <>
                        <option value="1">Processors</option>
                        <option value="2">Graphics Cards</option>
                        <option value="3">Motherboards</option>
                        <option value="4">Memory (RAM)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Image URL</label>
                <input type="text" value={productForm.image} onChange={(e) => setProductForm({...productForm, image: e.target.value})} placeholder="/ryzen.png" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Status Toggles</label>
                <div style={{ display: 'flex', gap: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <select value={productForm.stockStatus} onChange={(e) => setProductForm({...productForm, stockStatus: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }}>
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#d35400' }}>
                    <input type="checkbox" checked={productForm.isTrending} onChange={(e) => setProductForm({...productForm, isTrending: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    Flag as Trending
                  </label>
                </div>
              </div>

              <button type="submit" style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s' }}>
                {isEditing ? 'Commit Changes' : 'Deploy Product to Live Server'}
              </button>
            </form>

          </div>
        </div>
      )}

      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default AdminDashboard;