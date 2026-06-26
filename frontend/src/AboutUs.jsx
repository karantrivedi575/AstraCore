import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AboutUs() {
  const [counts, setCounts] = useState({ pcs: 0, customers: 0, years: 0, support: 0 });

  useEffect(() => {
    const targets = { pcs: 500, customers: 1200, years: 5, support: 24 };
    const speed = 50;

    const interval = setInterval(() => {
      setCounts(prev => ({
        pcs: prev.pcs < targets.pcs ? Math.ceil(prev.pcs + targets.pcs / speed) : targets.pcs,
        customers: prev.customers < targets.customers ? Math.ceil(prev.customers + targets.customers / speed) : targets.customers,
        years: prev.years < targets.years ? Math.ceil(prev.years + targets.years / speed) : targets.years,
        support: prev.support < targets.support ? Math.ceil(prev.support + targets.support / speed) : targets.support,
      }));
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="about-hero">
        <div className="hero-content">
          <h1>About <span>AstraCore System</span></h1>
          <p>Building High-Performance Gaming PCs & Custom Technology Solutions</p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-text">
            <h2>Creative Technology & Custom PC Solutions</h2>
            <p>
              AstraCore System is a performance-driven technology brand focused on custom gaming PCs, PC components, and premium tech solutions. We combine performance, aesthetics, and reliability to deliver systems built for gamers and professionals.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', marginBottom: '25px' }}>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-circle-check" style={{ color: '#6366f1', marginRight: '8px' }}></i> Custom Built Gaming PCs</li>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-circle-check" style={{ color: '#6366f1', marginRight: '8px' }}></i> Premium Quality Components</li>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-circle-check" style={{ color: '#6366f1', marginRight: '8px' }}></i> Expert Technical Support</li>
              <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-circle-check" style={{ color: '#6366f1', marginRight: '8px' }}></i> Nationwide Shipping</li>
            </ul>
            <Link to="/products" className="about-btn">Explore Products</Link>
          </div>
          <div className="about-image" style={{ textAlign: 'center' }}>
            <img src="/pc-computer.png" alt="AstraCore Setup" />
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-box"><h2>{counts.pcs}</h2><p>PCs Delivered</p></div>
          <div className="stat-box"><h2>{counts.customers}</h2><p>Happy Customers</p></div>
          <div className="stat-box"><h2>{counts.years}</h2><p>Years Experience</p></div>
          <div className="stat-box"><h2>{counts.support}</h2><p>Support Availability</p></div>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Leadership</h2>
        <div className="team-container">
          <div className="team-card">
            <img src="/WebsiteLogo.png" alt="CEO" style={{background: '#f4f4f4', padding: '10px'}}/>
            <h3>Shubham Maurya</h3>
            <p>Founder & CEO</p>
            <div className="team-socials">
              <i className="fa-brands fa-linkedin"></i> <i className="fa-brands fa-instagram"></i>
            </div>
          </div>
          <div className="team-card">
            <img src="/WebsiteLogo.png" alt="Head of Product" style={{background: '#f4f4f4', padding: '10px'}}/>
            <h3>Aditya</h3>
            <p>Head of Product</p>
            <div className="team-socials">
              <i className="fa-brands fa-linkedin"></i> <i className="fa-brands fa-instagram"></i>
            </div>
          </div>
         
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to Build Your Dream Setup?</h2>
        <p>Let’s create something powerful together.</p>
        <Link to="/contact" className="cta-btn">Contact Us</Link>
      </section>
    </>
  );
}

export default AboutUs;