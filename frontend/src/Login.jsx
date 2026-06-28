import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  // bug fixed: Added success toast state to replace jarring alert()
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSuccessfulLogin = (data) => {
    localStorage.setItem('user', JSON.stringify(data));
    window.dispatchEvent(new Event('authUpdated')); 
    
    // bug fixed: Show an elegant in-page success banner instead of window.alert()
    setSuccessMessage(`Welcome back, ${data.username}!`);
    setTimeout(() => {
      navigate('/products');
    }, 1200); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, formData)
      .then(res => handleSuccessfulLogin(res.data))
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

  const handleGoogleSuccess = (credentialResponse) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google`, { token: credentialResponse.credential })
      .then(res => handleSuccessfulLogin(res.data))
      .catch(err => {
        console.error("Google Login Error:", err);
        if (err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage("Google Login Failed. Please try again.");
        }
      });
  };

  return (
    <>
      <section style={{ padding: '100px 20px', textAlign: 'center', background: '#f4f4f4' }}>
        <h1 style={{ fontWeight: 800, fontSize: '42px', margin: 0 }}>
          Welcome <span style={{ color: '#000' }}>Back</span>
        </h1>
        <p style={{ color: '#555', marginTop: '10px' }}>Login to view your AstraCore order history.</p>
      </section>

      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '40px', background: '#fff', border: '1px solid #eee', borderRadius: '15px' }}>
        
        {/* Google Login Section */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMessage('Google Login Failed')}
            theme="filled_blue"
            shape="pill"
          />
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#aaa', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
          OR LOGIN WITH USERNAME
        </div>

        <form onSubmit={handleSubmit}>
          
          {errorMessage && (
            <div style={{ background: '#ffebee', color: '#d63031', padding: '12px 15px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', border: '1px solid #ffcdd2' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{ background: '#e3fce0', color: '#009432', padding: '15px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px', border: '1px solid #b8e994', textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '20px', display: 'block', marginBottom: '8px' }}></i>
              {successMessage}
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#333' }}>
              Username
            </label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="auth-input"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#333' }}>
              Password
            </label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              width: '100%', 
              padding: '15px', 
              background: isSubmitting ? '#a29bfe' : '#6b4eff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '30px', 
              fontWeight: 700, 
              cursor: isSubmitting ? 'not-allowed' : 'pointer', 
              transition: '0.3s' 
            }}
          >
            {isSubmitting ? (
              <span><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Logging in...</span>
            ) : (
              "Login to Account"
            )}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center', color: '#555' }}>
          New to AstraCore? <Link to="/register" style={{ color: '#6b4eff', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </>
  );
}

export default Login;