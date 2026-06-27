import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Trending() {
  const [countdown, setCountdown] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const x = (window.innerWidth / 2 - e.pageX) / 40;
    const y = (window.innerHeight / 2 - e.pageY) / 40;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); 

    const timer = setInterval(() => {
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        setCountdown("EXPIRED");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="trending-wrapper" onMouseMove={handleMouseMove}>
      
      <style>{`
        .trending-wrapper {
            background-color: #050505;
            min-height: 100vh;
            overflow: hidden;
            color: #fff;
        }
        .trending-info-box { 
          padding: 30px; 
          width: 280px; 
          border-radius: 20px; 
          background: rgba(255, 255, 255, 0.03); 
          backdrop-filter: blur(8px); 
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.05), 0 0 80px rgba(107, 78, 255, 0.08); 
          transition: 0.4s ease; 
          animation: floatCard 6s ease-in-out infinite; 
          display: block; 
          text-align: center;
          color: #fff;
        }
        .trending-info-box:nth-child(2) { animation-delay: 1s; } 
        .trending-info-box:nth-child(3) { animation-delay: 2s; }
        .trending-info-box:hover { 
          transform: translateY(-15px) scale(1.03); 
          box-shadow: 0 0 60px rgba(107, 78, 255, 0.3), 0 0 120px rgba(107, 78, 255, 0.2); 
        }
        .trending-info-box > i { font-size: 26px; margin-bottom: 15px; color: #9b7bff; }
        .trending-info-box h4 { margin-bottom: 5px; color: #fff; font-size: 18px; }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="trending-content">
        
        <section className="galaxy-hero">
          <div className="hero-left" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
            <p className="starting">Starting at</p>
            <h2 className="price">₹8,000<span></span></h2>
            <ul className="hero-check">
              <li><i className="fa-solid fa-check"></i> Premium Quality</li>
              <li><i className="fa-solid fa-check"></i> Starry Galaxy Design</li>
            </ul>
            <Link to="/products"><button className="btn-primary">SHOP NOW</button></Link>
          </div>

          <div className="hero-center">
            <img src="/PC Case Product.png" alt="Trending Cabinet" style={{ transform: `translate(${mousePos.x / 2}px, ${mousePos.y / 2}px)` }} />
            <div className="product-glow"></div>
          </div>

          <div className="hero-right" style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}>
            <h3>Key Features:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-fan" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Superior Airflow</li>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-microchip" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Multiple GPU Support</li>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-lightbulb" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Customizable RGB</li>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-cable-car" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Advanced Cable Management</li>
            </ul>
          </div>
        </section>

        <section className="info-strip" style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', padding: '60px 20px' }}>
          <div className="trending-info-box">
            <i className="fa-solid fa-truck-fast"></i>
            <h4>Fast & Secure Shipping</h4>
            <p style={{ color: '#ccc', fontSize: '13px' }}>Worldwide Shipping Available</p>
          </div>
          <div className="trending-info-box">
            <i className="fa-solid fa-screwdriver-wrench"></i>
            <h4>Build Your Dream PC</h4>
            <p style={{ color: '#ccc', fontSize: '13px' }}>Custom Configuration Options</p>
          </div>
          <div className="trending-info-box">
            <div style={{ color: 'gold', marginBottom: '10px', fontSize: '18px' }}>
              <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h4>Customer Reviews</h4>
            <p style={{ color: '#ccc', fontSize: '13px' }}>Rated 4.8/5 by Gamers</p>
          </div>
        </section>

        <section className="why-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '40px' }}>Why Choose AstraCore?</h2>
          <div className="why-grid" style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div className="why-card" style={{ maxWidth: '300px' }}>
              <i className="fa-solid fa-gauge-high" style={{ fontSize: '40px', color: 'var(--primary)', marginBottom: '15px' }}></i>
              <h4>Performance Engineered</h4>
              <p style={{ color: '#ccc', fontSize: '13px', marginTop: '10px' }}>Optimized airflow and thermal balance tested under extreme loads.</p>
            </div>
            <div className="why-card" style={{ maxWidth: '300px' }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '40px', color: 'var(--primary)', marginBottom: '15px' }}></i>
              <h4>Premium Build Quality</h4>
              <p style={{ color: '#ccc', fontSize: '13px', marginTop: '10px' }}>Durable materials crafted for long-term reliability.</p>
            </div>
            <div className="why-card" style={{ maxWidth: '300px' }}>
              <i className="fa-solid fa-gamepad" style={{ fontSize: '40px', color: 'var(--primary)', marginBottom: '15px' }}></i>
              <h4>Built For Gamers</h4>
              <p style={{ color: '#ccc', fontSize: '13px', marginTop: '10px' }}>Designed with aesthetics and performance in perfect harmony.</p>
            </div>
          </div>
        </section>

        <section className="offer-section" style={{ textAlign: 'center', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Limited Time Offer Ends In:</h2>
          <div id="countdown" style={{ fontSize: '36px', fontWeight: 'bold', letterSpacing: '2px' }}>{countdown}</div>
        </section>

      </div>
    </div>
  );
}

export default Trending;