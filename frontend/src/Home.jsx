import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    axios.get('http://localhost:8080/api/products/trending')
      .then(res => {
        setTrendingProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching trending products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        
        <div className="hero-left">
          <h1>
            Get Your <br />
            <span>Perfect PC</span> Today!
          </h1>
          <p>
            Choose from Our Pre-Built Selection or Build <br />
            Your Own with Your PC!
          </p>
          <div className="hero-buttons">
            <Link to="/products"><button className="btn-dark">Pre-Built</button></Link>
            <Link to="/build-pc"><button className="btn-outline">Build it yourself</button></Link>
          </div>
        </div>

        <div className="hero-center">
          <img src="/PC_Case.png" alt="PC Case" />
        </div>

        <div className="hero-right">
          <div className="info-block">
            <h3>Pre-Built</h3>
            <p>Computers that are already assembled and configured by manufacturers, rather than building one's own computer from scratch.</p>
          </div>
          <div className="info-block" style={{ marginTop: '30px' }}>
            <h3>Build it yourself</h3>
            <p>Main advantages of building your own computer is flexibility and customization. You have full control over the selection of each component.</p>
          </div>
        </div>
      </section>

      {/* COMPONENTS SECTION */}
      <section className="components">
        <h2>Components</h2>
        <div className="components-slider">
          <div className="components-track">
            <div className="component-card"><img src="/Processor.jpg" alt="Processor" /><p>Processors</p></div>
            <div className="component-card"><img src="/Graphic_card.jpg" alt="GPU" /><p>Graphics Cards</p></div>
            <div className="component-card"><img src="/Motherboard.jpg" alt="Motherboard" /><p>Motherboards</p></div>
            <div className="component-card"><img src="/Ram.jpg" alt="RAM" /><p>Memory (RAM)</p></div>
            <div className="component-card"><img src="/SSD.jpg" alt="SSD" /><p>Storage</p></div>
            <div className="component-card"><img src="/Power_Supply.jpg" alt="PSU" /><p>Power Supply</p></div>
            <div className="component-card"><img src="/PC_Case_IMG.jpg" alt="Case" /><p>PC Case</p></div>
            <div className="component-card"><img src="/Keyboard.jpg" alt="Keyboard" /><p>Other Peripheral</p></div>
          </div>
        </div>
      </section>

      {/* TRENDING SECTION */}
      <section className="trending-section">
        <h2>Trending Right Now</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading trending gear...</div>
        ) : (
          <div className="trending-grid">
            {trendingProducts.map(product => (
              <div className="trending-card" key={product.id}>
                <img src={product.image || '/pc-computer.png'} alt={product.name} onError={(e) => e.target.src = '/pc-computer.png'} />
                <h3>{product.name}</h3>
                <p>₹{product.price.toLocaleString('en-IN')}</p>
                <Link to={`/product/${product.slug}`} className="btn-deal">View Deal</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section className="about">
        <div className="about-container">
          <div className="about-text">
            <h2>About AstraCore</h2>
            <p>AstraCore is a premium PC customization brand focused on building high-performance, reliable, and visually stunning computers.</p>
            <p>From custom PC cabinets and professional spray finishes to powerful gaming and workstation builds, we design every system with precision, performance, and passion.</p>
            <ul className="about-points">
              <li>✔ Custom-Built & Tested PCs</li>
              <li>✔ High-Quality Components</li>
              <li>✔ Clean Cable Management</li>
              <li>✔ Performance & Thermal Optimization</li>
            </ul>
          </div>
          <div className="about-image">
            <img src="/Pc_CaseAnimated.png" alt="Custom PC Build" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;