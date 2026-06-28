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

  // bug fixed: Added states for elegant UI feedback and loading prevention
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

    setIsSubmitting(true); // Locking the form while the backend sends the email
    
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
      username: formData.username,
      email: formData.email,
      password: formData.password
    })
      .then(res => {
        // bug fixed: Show the success message (telling them to check their email)
        if (res.data && res.data.message) {
          setSuccessMessage(res.data.message);
        } else {
          setSuccessMessage("Registration successful! Please check your email to verify your account.");
        }
        
        // Clear the form so they can't submit it again
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        setIsSubmitting(false);
      })
      .catch(err => {
        console.error("Registration Error:", err);
        if (err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f4f4f4' }}>
        <h1 style={{ fontWeight: 800, fontSize: '42px', margin: 0 }}>
          Join <span style={{ color: '#000' }}>AstraCore</span>
        </h1>
        <p style={{ color: '#555', marginTop: '10px' }}>Create an account to track your high-performance builds and orders.</p>
      </section>

      <div className="register-container" style={{ maxWidth: '450px', margin: '-40px auto 80px', padding: '40px', background: '#fff', border: '1px solid #eee', borderRadius: '15px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', position: 'relative', zIndex: 2 }}>
        <h2 style={{ marginBottom: '25px', fontWeight: 800, textAlign: 'center', color: '#000' }}>Create Account</h2>
        
        {errorMessage && (
          <div style={{ background: '#ffebee', color: '#d63031', padding: '12px 15px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', border: '1px solid #ffcdd2' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#e3fce0', color: '#009432', padding: '15px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px', border: '1px solid #b8e994', textAlign: 'center' }}>
            <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}></i>
            {successMessage}
            <div style={{ marginTop: '15px' }}>
              <Link to="/login" style={{ display: 'inline-block', padding: '8px 20px', background: '#009432', color: '#fff', textDecoration: 'none', borderRadius: '5px', fontSize: '13px' }}>
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {/* Hide the form if registration was successful */}
        {!successMessage && (
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#333' }}>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required className="auth-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <small style={{ display: 'block', color: '#888', fontSize: '11px', marginTop: '5px', lineHeight: '1.4' }}>
                Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
              </small>
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#333' }}>Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="auth-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#333' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="auth-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <small style={{ display: 'block', color: '#888', fontSize: '11px', marginTop: '5px', lineHeight: '1.4' }}>
                Your password can't be too similar to your other personal information.
              </small>
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#333' }}>Password confirmation</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="auth-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <small style={{ display: 'block', color: '#888', fontSize: '11px', marginTop: '5px', lineHeight: '1.4' }}>
                Enter the same password as before, for verification.
              </small>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                width: '100%', 
                padding: '16px', 
                background: isSubmitting ? '#a29bfe' : '#6b4eff', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '35px', 
                fontWeight: 700, 
                fontSize: '16px', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                transition: '0.3s', 
                marginTop: '10px' 
              }}
            >
              {isSubmitting ? (
                <span><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Creating Account...</span>
              ) : (
                "Register Now"
              )}
            </button>
          </form>
        )}

        <p style={{ marginTop: '25px', fontSize: '14px', textAlign: 'center', color: '#555' }}>
          Already have an account? <Link to="/login" style={{ color: '#6b4eff', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </>
  );
}

export default Register;