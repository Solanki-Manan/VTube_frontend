import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, User, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    avatar: null,
    coverImage: null,
  });

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { register, verifyEmail } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      
      await register(data);
      setStep(2); // Move to OTP
    } catch (err) {
      setError(err);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await verifyEmail(formData.email, otp);
      navigate('/login');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div className="auth-header">
          <div className="logo-icon-large">
            <Video size={36} color="var(--accent-primary)" />
          </div>
          <h2>{step === 1 ? 'Create an Account' : 'Verify Your Email'}</h2>
          <p>{step === 1 ? 'Join VTube and start sharing!' : `We sent an OTP to ${formData.email}`}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="auth-form" encType="multipart/form-data">
            <div className="input-row">
              <div className="input-group">
                <label>Full Name *</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-group">
                <label>Username *</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" name="username" placeholder="johndoe123" value={formData.username} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Password *</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="password" name="password" placeholder="Create a strong password" minLength={8} value={formData.password} onChange={handleChange} required />
              </div>
              <p className="input-helper">Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.</p>
            </div>

            <div className="input-group">
              <label>Avatar (Required) *</label>
              <div className="file-input-wrapper">
                <ImageIcon className="input-icon" size={18} />
                <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Cover Image (Optional)</label>
              <div className="file-input-wrapper">
                <ImageIcon className="input-icon" size={18} />
                <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div className="auth-actions">
              <button type="submit" className="primary-btn">Sign Up & Send OTP</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="auth-form">
            <div className="input-group">
              <label>Enter OTP</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" />
              </div>
            </div>
            
            <div className="auth-actions">
              <button type="submit" className="primary-btn">Verify Email</button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>
        )}
      </div>

      <style>{`
        /* Styles reuse many classes from Login page via global CSS, but here are Register specific ones */
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 24px;
        }

        .auth-card {
          width: 100%;
          max-width: 550px; /* Slightly wider for register */
          padding: 40px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .auth-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .logo-icon-large {
          background: rgba(123, 44, 191, 0.15);
          padding: 16px;
          border-radius: var(--radius-lg);
          margin-bottom: 8px;
        }

        .auth-header h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-row {
          display: flex;
          gap: 16px;
        }
        
        .input-row .input-group {
          flex: 1;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .input-wrapper, .file-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-secondary);
        }

        .input-wrapper input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          padding: 12px 16px 12px 48px;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(123, 44, 191, 0.2);
        }
        
        .file-input-wrapper input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          padding: 10px 16px 10px 48px;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .file-input-wrapper input::file-selector-button {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          margin-right: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .file-input-wrapper input::file-selector-button:hover {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .primary-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px var(--accent-glow);
        }

        .auth-footer {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--accent-secondary);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 600px) {
          .input-row {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
