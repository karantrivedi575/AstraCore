import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Week 2: Fetching directly from local backend
  useEffect(() => {
    axios.get(`http://localhost:8080/api/products/details/${slug}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product details:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ padding: '40px' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '40px' }}>Product not found.</div>;

  return (
    <div className="product-details-container">
      <Link to="/products" style={{ display: 'inline-block', marginBottom: '20px', color: '#555', textDecoration: 'none' }}>
        &larr; Back to Catalog
      </Link>
      
      <div className="product-details-wrapper">
        <div className="main-image-container" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
           {/* Basic image rendering for Iteration 1 */}
           <img 
             src={product.image || '/pc-computer.png'} 
             alt={product.name} 
             style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
             onError={(e) => e.target.src = '/pc-computer.png'}
           />
        </div>
        
        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
            {product.description || 'No description available.'}
          </p>
          
          <div className="new-price">₹{product.price}</div>
          <p style={{ marginTop: '10px', fontSize: '14px', color: product.stockStatus === 'Out of Stock' ? 'red' : 'green' }}>
            Status: {product.stockStatus || 'In Stock'}
          </p>

          <button className="btn-add-cart" onClick={() => alert('Cart logic coming in Phase 3!')}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;