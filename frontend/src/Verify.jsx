import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); 
  const [message, setMessage] = useState('Verifying your secure token...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    axios.get(`http://localhost:8080/api/auth/verify?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Account successfully verified!');
      })
      .catch(err => {
        console.error("Verification Error:", err);
        setStatus('error');
        if (err.response && err.response.data && err.response.data.error) {
          setMessage(err.response.data.error);
        } else {
          setMessage('Verification failed. The link may be invalid or expired.');
        }
      });
  }, [token]);

  return (
    <section style={{ padding: '100px 20px', minHeight: '60vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-white)', padding: '40px', borderRadius: '15px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
        
        {/* LOADING STATE */}
        {status === 'loading' && (
          <>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '40px', color: 'var(--primary)', marginBottom: '20px' }}></i>
            <h2 style={{ margin: '0 0 10px', color: 'var(--text-main)' }}>Verifying Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{message}</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '50px', color: '#009432', marginBottom: '20px' }}></i>
            <h2 style={{ margin: '0 0 10px', color: 'var(--text-main)' }}>Verification Complete!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>{message}</p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', borderRadius: '30px', padding: '12px 30px' }}>
              Proceed to Login
            </Link>
          </>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <>
            <i className="fa-solid fa-circle-xmark" style={{ fontSize: '50px', color: '#d63031', marginBottom: '20px' }}></i>
            <h2 style={{ margin: '0 0 10px', color: 'var(--text-main)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>{message}</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link to="/register" className="btn-secondary" style={{ padding: '10px 20px', border: 'none', background: 'var(--bg-light)' }}>
                Register Again
              </Link>
              <Link to="/contact" className="btn-secondary" style={{ padding: '10px 20px' }}>
                Contact Support
              </Link>
            </div>
          </>
        )}

      </div>
    </section>
  );
}

export default Verify;