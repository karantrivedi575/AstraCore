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
      setCompatMessage("Build loaded from shared link.");
    } 
    else {
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

    if (type === 'CPU') {
      setCpuSocket(item.socket);
      setCompatMessage("Motherboard list updated for socket compatibility.");
      
      if (build.Motherboard && build.Motherboard.socket !== item.socket) {
        newBuild.Motherboard = null;
        setCompatMessage("Motherboard removed due to CPU socket incompatibility.");
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
      alert("Please select components to share.");
      return;
    }

    const params = new URLSearchParams();
    if (build.CPU) params.append('cpu', build.CPU.id);
    if (build.GPU) params.append('gpu', build.GPU.id);
    if (build.RAM) params.append('ram', build.RAM.id);
    if (build.Motherboard) params.append('mobo', build.Motherboard.id);
    
    const shareUrl = `${window.location.origin}/build-pc?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => alert("Build link copied to clipboard!"));
  };

  const handleAddToCart = () => {
    const activeParts = Object.values(build).filter(p => p !== null);
    if (activeParts.length === 0) {
      alert("Please select components first.");
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    
    activeParts.forEach(part => {
      const existingItem = cart.find(item => item.id === part.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: part.id,
          name: part.name,
          price: part.price,
          image: part.img,
          quantity: 1,
          slug: part.categorySlug
        });
      }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    setBuild({ CPU: null, GPU: null, RAM: null, Motherboard: null });
    setCpuSocket(null);
    localStorage.removeItem('pc_build');

    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  const activeParts = Object.entries(build).filter(([key, value]) => value !== null);
  const totalPrice = activeParts.reduce((sum, [key, part]) => sum + part.price, 0);
  const totalWattage = activeParts.reduce((sum, [key, part]) => sum + (part.wattage || 0), 0);

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
    return <div style={{ padding: '100px', textAlign: 'center' }}><h2>Loading Architecture...</h2></div>;
  }

  return (
    <section style={{ padding: '40px 20px', background: '#f4f4f4', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>System Configurator</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* LEFT: Component Selection */}
          <div style={{ background: '#fff', padding: '30px', border: '1px solid #ccc' }}>
            <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Select Components</h2>

            {['CPU', 'GPU', 'RAM', 'Motherboard'].map((type) => {
              const options = type === 'Motherboard' ? availableMotherboards : hardwareData[type];

              return (
                <div key={type} style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginBottom: '10px' }}>{type}</h3>
                  <select 
                    onChange={(e) => handleSelectComponent(type, e)} 
                    defaultValue=""
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }}
                  >
                    <option value="">Select {type}</option>
                    {options.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ₹{item.price.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>

                  {type === 'Motherboard' && compatMessage && (
                    <p style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>{compatMessage}</p>
                  )}

                  {build[type] && (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f9f9f9', padding: '15px', border: '1px solid #eee', marginTop: '10px' }}>
                      <div style={{ width: '80px', height: '80px', background: '#fff', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={build[type].img} alt={build[type].name} style={{ maxWidth: '90%', maxHeight: '90%' }} onError={(e) => e.target.src = '/pc-computer.png'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{build[type].name}</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>{build[type].spec}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <span style={{ fontWeight: 'bold' }}>₹{build[type].price.toLocaleString('en-IN')}</span>
                          <button onClick={() => removeComponent(type)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: Summary */}
          <div style={{ background: '#fff', padding: '30px', border: '1px solid #ccc', height: 'fit-content' }}>
            <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>System Status</h2>

            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>Est. Wattage</strong>
                <span style={{ color: totalWattage > 600 ? '#d63031' : '#000' }}>{totalWattage}W</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                {totalWattage > 0 ? `Recommended PSU: ${Math.ceil((totalWattage * 1.5) / 50) * 50}W` : 'Select parts to calculate power.'}
              </p>
            </div>

            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', background: '#fafafa' }}>
              <strong style={{ display: 'block', marginBottom: '10px' }}>Est. Gaming Performance (1080p)</strong>
              {!fpsEstimates ? (
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Select CPU and GPU for estimates.</p>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#666' }}>Cyberpunk</span>
                    <strong>{fpsEstimates.cyberpunk} FPS</strong>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#666' }}>GTA V</span>
                    <strong>{fpsEstimates.gta} FPS</strong>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#666' }}>Valorant</span>
                    <strong>{fpsEstimates.valorant} FPS</strong>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid #000', paddingTop: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '20px' }}>
              <strong>Total</strong>
              <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
            </div>

            <button onClick={handleShareBuild} style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #000', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
              Copy Share Link
            </button>
            <button onClick={handleAddToCart} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              Add Parts to Cart
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

export default BuildPC;