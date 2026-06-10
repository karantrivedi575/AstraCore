import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Consume the backend Pageable endpoint created in Commit 6
  useEffect(() => {
    axios.get(`http://localhost:8080/api/products?page=${currentPage}&size=8`)
      .then(res => {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      })
      .catch(err => console.error("Error fetching products:", err));
  }, [currentPage]);

  return (
    <section className="products-page">
      <h1>Hardware Catalog</h1>
      
      <div className="products-layout">
        <aside className="products-sidebar">
          <h4>Filters (Coming Soon)</h4>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Category and price filtering will be implemented in the next sprint.
          </p>
        </aside>

        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <div className="product-card" key={product.id}>
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>{product.name}</h3>
                <div className="product-price">₹{product.price}</div>
                <Link to={`/product/${product.slug}`} className="buy-now-btn">View Details</Link>
              </div>
            ))
          ) : (
            <p>Loading products from database...</p>
          )}
        </div>
      </div>

      {/* Basic Pagination Controls */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          style={{ padding: '8px 16px', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        <span style={{ padding: '8px' }}>Page {currentPage + 1} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage === totalPages - 1}
          style={{ padding: '8px 16px', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default ProductList;