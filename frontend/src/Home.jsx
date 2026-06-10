import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [trendingProducts, setTrendingProducts] = useState([]);

  // Week 2: Fetching directly from local backend
  useEffect(() => {
    axios.get('http://localhost:8080/api/products/trending')
      .then(res => {
        setTrendingProducts(res.data);
      })
      .catch(err => console.error("Error fetching trending products:", err));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <h1>Get Your Perfect PC Today!</h1>
          <p>Choose from Our Pre-Built Selection or Build Your Own!</p>
          <div className="hero-buttons">
            <Link to="/products"><button className="btn-dark">Pre-Built</button></Link>
          </div>
        </div>
        <div className="hero-center">
          {/* Placeholder image text for Iteration 1 */}
          <div style={{ padding: '50px', background: '#eee', border: '1px solid #ccc' }}>
            [Hero Image Placeholder]
          </div>
        </div>
      </section>

      <section className="components">
        <h2>Trending Right Now</h2>
        <div className="components-track">
          {trendingProducts.length > 0 ? (
            trendingProducts.map(product => (
              <div className="component-card" key={product.id}>
                <p><strong>{product.name}</strong></p>
                <p>₹{product.price}</p>
                <Link to={`/product/${product.slug}`} className="buy-now-btn">View</Link>
              </div>
            ))
          ) : (
            <p>Loading trending hardware...</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;