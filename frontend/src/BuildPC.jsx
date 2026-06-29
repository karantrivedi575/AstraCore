import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function BuildPC() {
  const navigate = useNavigate();
  const location = useLocation();

  const [hardwareData, setHardwareData] = useState({ CPU: [], GPU: [], RAM: [], Motherboard: [] });
  const [loading, setLoading] = useState(true);

  const [build, setBuild] = useState({ CPU: null, GPU: null, RAM: null, Motherboard: null });
  const [cpuSocket, setCpuSocket] = useState(null);
  const [compatMessage, setCompatMessage] = useState("");

  useEffect(() => {
    // Fetch all products for the builder without pagination limits
    axios.get('http://localhost:8080/api/products?page=0&size=1000')
      .then(res => {
        const products = res.data.products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          img: p.image || '/pc-computer.png',
          socket: p.socket,
          spec: p.specs,
          categorySlug: p.category ? p.category.slug : '',
          wattage: p.wattage || 0
        }));

        // Sort into categories
        setHardwareData({
          CPU: products.filter(p => p.categorySlug === 'processors'),
          GPU: products.filter(p => p.categorySlug === 'graphic-cards'),
          RAM: products.filter(p => p.categorySlug === 'memory'),
          Motherboard: products.filter(p => p.categorySlug === 'motherboards')
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching components:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) return; 

    const params = new URLSearchParams(location.search);
    const cpuId = parseInt(params.get('cpu'));
    const gpuId = parseInt(params.get('gpu'));
    const ramId = parseInt(params.get('ram'));
    const moboId = parseInt(params.get('mobo'));

    if (cpuId || gpuId || ramId || moboId) {
      const sharedBuild = { CPU: null, GPU: null, RAM: null, Motherboard: null };
      let socket = null;

      if (cpuId) {
        sharedBuild.CPU = hardwareData.CPU.find(c => c.id === cpuId) || null;
        if (sharedBuild.CPU) socket = sharedBuild.CPU.socket;
      }
      if (gpuId) sharedBuild.GPU = hardwareData.GPU.find(c => c.id === gpuId) || null;
      if (ramId) sharedBuild.RAM = hardwareData.RAM.find(c => c.id === ramId) || null;
      if (moboId) sharedBuild.Motherboard = hardwareData.Motherboard.find(c => c.id === moboId) || null;

      setBuild(sharedBuild);
      setCpuSocket(socket);
      setCompatMessage("Build loaded from shared link!");
    } else {
      const savedBuild = JSON.parse(localStorage.getItem("pc_build"));
      if (savedBuild) {
        setBuild(savedBuild.parts || { CPU: null, GPU: null, RAM: null, Motherboard: null });
        setCpuSocket(savedBuild.socket || null);
      }
    }
  }, [loading, location.search, hardwareData]);

  useEffect(() => {
    localStorage.setItem("pc_build", JSON.stringify({ parts: build, socket: cpuSocket }));
  }, [build, cpuSocket]);

  const handleSelectComponent = (type, e) => {
    const selectedId = parseInt(e.target.value);
    if (!selectedId) return;

    const item = hardwareData[type].find(c => c.id === selectedId);
    let newBuild = { ...build, [type]: item };

    // CPU Socket validation
    if (type === 'CPU') {
      setCpuSocket(item.socket);
      setCompatMessage("Compatible motherboards loaded.");
      
      if (build.Motherboard && build.Motherboard.socket !== item.socket) {
        newBuild.Motherboard = null;
        setCompatMessage("Motherboard removed due to incompatibility with new CPU.");
      }
    }

    setBuild(newBuild);
    e.target.value = ""; 
  };

  const removeComponent = (type) => {
    setBuild({ ...build, [type]: null });
    if (type === 'CPU') {
      setCpuSocket(null);
      setCompatMessage("");
    }
  };

  const handleShareBuild = () => {
    const activeParts = Object.values(build).filter(p => p !== null);
    if (activeParts.length === 0) {
      alert("Please select some components before sharing!");
      return;
    }

    const params = new URLSearchParams();
    if (build.CPU) params.append('cpu', build.CPU.id);
    if (build.GPU) params.append('gpu', build.GPU.id);
    if (build.RAM) params.append('ram', build.RAM.id);
    if (build.Motherboard) params.append('mobo', build.Motherboard.id);
    
    const shareUrl = `${window.location.origin}/build-pc?${params.toString()}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert("🔗 Build link copied to clipboard! Share it with your friends."))
      .catch(() => alert("Failed to copy link."));
  };

  const handleAddToCart = () => {
    const activeParts = Object.values(build).filter(p => p !== null);
    if (activeParts.length === 0) {
      alert("Please select components first.");
      return;
    }

    // Auth validation
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert("Please log in or register to add your custom build to the cart!");
      navigate('/login');
      return; 
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const buildTotal = activeParts.reduce((sum, p) => sum + p.price, 0);
    
    const customBuildItem = {
      id: `custom-build-${Date.now()}`,
      name: "AstraCore Custom PC",
      price: buildTotal,
      image: "/PC_Case.png", 
      quantity: 1,
      slug: "custom-pc",
      isBuild: true,
      parts: build 
    };

    cart.push(customBuildItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Clear builder state after cart transfer
    setBuild({ CPU: null, GPU: null, RAM: null, Motherboard: null });
    setCpuSocket(null);
    localStorage.removeItem('pc_build');

    window.dispatchEvent(new Event('cartUpdated'));
    alert("Custom PC Build added to cart!");
    navigate('/cart');
  };

  const activeParts = Object.entries(build).filter(([key, value]) => value !== null);
  const totalPrice = activeParts.reduce((sum, [key, part]) => sum + part.price, 0);

  const totalWattage = activeParts.reduce((sum, [key, part]) => sum + (part.wattage || 0), 0);
  const maxDisplayWattage = 850;
  const wattagePercentage = Math.min((totalWattage / maxDisplayWattage) * 100, 100);

  // FPS Estimator 
  let fpsEstimates = null;
  if (build.CPU && build.GPU) {
    let baseFps = 60; 
    
    if (build.GPU.name.includes("4060")) baseFps = 85;
    else if (build.GPU.name.includes("RX 7600")) baseFps = 78;
    else baseFps = 65;

    if (build.CPU.name.includes("Ryzen 5 7600")) baseFps += 10;
    else if (build.CPU.name.includes("13400F")) baseFps += 5;

    fpsEstimates = {
      cyberpunk: Math.round(baseFps * 0.85),  
      gta: Math.round(baseFps * 1.6),         
      valorant: Math.round(baseFps * 4.2)     
    };
  }

  const availableMotherboards = hardwareData.Motherboard.filter(m => !cpuSocket || m.socket === cpuSocket);

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center', fontSize: '20px' }}>Loading Builder Database...</div>;
  }

  return (
    <>
      <section className="builder-hero">
        <h1>Build Your Dream PC</h1>
        <p>Choose the components and assemble your perfect system.</p>
      </section>

      <section className="builder-container">
        
        {/* LEFT: Component Selection */}
        <div className="builder-parts" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)', border: '1px solid #f0f0f0' }}>
          <h2>Select Components</h2>

          {['CPU', 'GPU', 'RAM', 'Motherboard'].map((type) => {
            
            let icon = "fa-microchip";
            if(type === 'GPU') icon = "fa-tv";
            if(type === 'RAM') icon = "fa-memory";
            if(type === 'Motherboard') icon = "fa-server";

            const options = type === 'Motherboard' ? availableMotherboards : hardwareData[type];

            return (
              <div className="part-group" key={type}>
                <div className="part-header">
                  <i className={`fa-solid ${icon}`}></i>
                  <h3>{type === 'RAM' ? 'Memory (RAM)' : type === 'CPU' ? 'Processor' : type === 'GPU' ? 'Graphics Card' : type}</h3>
                </div>

                <select className="component-select" onChange={(e) => handleSelectComponent(type, e)} defaultValue="">
                  <option value="">Select {type}</option>
                  {options.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ₹{item.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>

                {type === 'Motherboard' && compatMessage && (
                  <p className="compatibility-message">{compatMessage}</p>
                )}

                {build[type] && (
                  <div className="component-preview">
                    <div className="preview-card">
                      <div className="preview-img">
                        <img src={build[type].img} alt={build[type].name} onError={(e) => e.target.src = '/pc-computer.png'} />
                      </div>
                      <div className="preview-info">
                        <h4>{build[type].name}</h4>
                        <p>{build[type].spec}</p>
                        <div className="preview-bottom">
                          <span style={{ fontWeight: 700, fontSize: '18px', color: '#222' }}>₹{build[type].price.toLocaleString('en-IN')}</span>
                          <button onClick={() => removeComponent(type)} className="remove-btn">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT: Summary */}
        <div className="builder-summary" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)', border: '1px solid #f0f0f0' }}>
          <h2>Your Build</h2>

          {/* Wattage Tracker */}
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#555' }}>
                <i className="fa-solid fa-bolt" style={{ color: '#ffd43b', marginRight: '5px' }}></i>
                Estimated Wattage
              </span>
              <span style={{ fontWeight: 800, color: totalWattage > 600 ? '#e74c3c' : '#2ecc71' }}>
                {totalWattage}W
              </span>
            </div>
            
            <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${wattagePercentage}%`, 
                background: totalWattage > 600 ? '#e74c3c' : '#2ecc71',
                transition: 'width 0.4s ease-in-out, background 0.4s ease-in-out' 
              }}></div>
            </div>
            
            <p style={{ fontSize: '11px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
              {totalWattage > 0 
                ? "We recommend a PSU with at least " + Math.ceil((totalWattage * 1.5) / 50) * 50 + "W for this build." 
                : "Select components to calculate power draw."}
            </p>
          </div>

          {/* FPS Estimator */}
          <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e9ecef', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: '#6b4eff', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '15px', textAlign: 'center' }}>
              <i className="fa-solid fa-gamepad" style={{ marginRight: '5px' }}></i>
              Gaming Performance (1080p)
            </span>
            
            {!fpsEstimates ? (
              <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', margin: '10px 0' }}>
                Select a CPU and Graphics Card to view estimated FPS.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ textAlign: 'center', background: '#fcfcfc', padding: '10px 5px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                  <i className="fa-solid fa-city" style={{ color: '#f39c12', fontSize: '18px', marginBottom: '8px' }}></i>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Cyberpunk</span>
                  <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#333' }}>{fpsEstimates.cyberpunk} <small style={{ fontSize: '10px', color: '#aaa' }}>FPS</small></span>
                </div>
                <div style={{ textAlign: 'center', background: '#fcfcfc', padding: '10px 5px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                  <i className="fa-solid fa-car-side" style={{ color: '#3498db', fontSize: '18px', marginBottom: '8px' }}></i>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>GTA V</span>
                  <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#333' }}>{fpsEstimates.gta} <small style={{ fontSize: '10px', color: '#aaa' }}>FPS</small></span>
                </div>
                <div style={{ textAlign: 'center', background: '#fcfcfc', padding: '10px 5px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                  <i className="fa-solid fa-crosshairs" style={{ color: '#e74c3c', fontSize: '18px', marginBottom: '8px' }}></i>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Valorant</span>
                  <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#333' }}>{fpsEstimates.valorant} <small style={{ fontSize: '10px', color: '#aaa' }}>FPS</small></span>
                </div>
              </div>
            )}
          </div>

          <ul id="buildList">
            {activeParts.length === 0 ? (
              <li>No components selected</li>
            ) : (
              activeParts.map(([type, part]) => (
                <li key={type}>
                  <strong style={{ width: '80px' }}>{type}</strong>
                  <span style={{ flex: 1, textAlign: 'left', marginLeft: '10px' }}>{part.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{part.price.toLocaleString('en-IN')}</span>
                </li>
              ))
            )}
          </ul>

          <div className="total-price">
            <h3>Total</h3>
            <p>₹ {totalPrice.toLocaleString('en-IN')}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleShareBuild}
              style={{ flex: 1, background: '#fff', color: '#6b4eff', border: '2px solid #6b4eff', padding: '15px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', marginTop: '20px', transition: '0.3s' }}
            >
              <i className="fa-solid fa-link" style={{ marginRight: '8px' }}></i> Share
            </button>
            <button className="checkout-btn" onClick={handleAddToCart} style={{ flex: 2 }}>
              Add To Cart
            </button>
          </div>
          
        </div>
      </section>
    </>
  );
}

export default BuildPC;