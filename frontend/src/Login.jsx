import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    
    axios.post('http://localhost:8080/api/auth/login', formData)
      .then(res => {
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate('/products');
      })
      .catch(err => {
        console.error("Login Error:", err);
        if (err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage("Invalid username or password. Please try again.");
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f4f4f4' }}>
        <h1 style={{ fontSize: '36px', margin: 0 }}>Account Login</h1>
        <p style={{ color: '#555', marginTop: '10px' }}>Securely access your AstraCore dashboard.</p>
      </section>

      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#fff', border: '1px solid #ccc' }}>
        
        <form onSubmit={handleSubmit}>
          
          {errorMessage && (
            <div style={{ background: '#ffebee', color: '#d63031', padding: '10px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>
              {errorMessage}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: isSubmitting ? '#888' : '#000', 
              color: '#fff', 
              border: 'none', 
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Authenticating...' : 'Login'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: '#000', fontWeight: 'bold' }}>Register here</Link>
        </p>
      </div>
    </>
  );
}

export default Login;