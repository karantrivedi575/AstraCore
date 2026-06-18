import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if(formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    
    if(formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    
    axios.post('http://localhost:8080/api/auth/register', {
      username: formData.username,
      email: formData.email,
      password: formData.password
    })
      .then(res => {
        setSuccessMessage("Registration successful! Redirecting to login...");
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch(err => {
        console.error("Registration Error:", err);
        if (err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f4f4f4' }}>
        <h1 style={{ fontSize: '36px', margin: 0 }}>Create Account</h1>
        <p style={{ color: '#555', marginTop: '10px' }}>Join AstraCore to track your high-performance builds.</p>
      </section>

      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#fff', border: '1px solid #ccc' }}>
        
        {errorMessage && (
          <div style={{ background: '#ffebee', color: '#d63031', padding: '10px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', marginBottom: '20px', border: '1px solid #c8e6c9', textAlign: 'center' }}>
            {successMessage}
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit}>
            
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
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
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
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#000', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </>
  );
}

export default Register;