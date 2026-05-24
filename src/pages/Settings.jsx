import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { Camera, Save, Lock, User, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { currentUser, logout } = useAuth(); // Need to potentially refresh context, but for now we'll rely on local state updates if it doesn't auto-refresh.
  const navigate = useNavigate();

  // State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [loadingObj, setLoadingObj] = useState({ details: false, password: false, avatar: false, cover: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      setFullName(currentUser.fullName || '');
      setEmail(currentUser.email || '');
      setAvatarPreview(currentUser.avatar || 'https://i.pravatar.cc/150?img=11');
      setCoverPreview(currentUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
    }
  }, [currentUser, navigate]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setLoadingObj(prev => ({ ...prev, details: true }));
      await userApi.updateAccountDetails(fullName, email);
      showMessage('success', 'Account details updated successfully!');
      // Ideally update context or window.location.reload
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update details');
    } finally {
      setLoadingObj(prev => ({ ...prev, details: false }));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setLoadingObj(prev => ({ ...prev, password: true }));
      await userApi.changePassword(oldPassword, newPassword);
      showMessage('success', 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoadingObj(prev => ({ ...prev, password: false }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setLoadingObj(prev => ({ ...prev, avatar: true }));
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      await userApi.updateAvatar(formData);
      showMessage('success', 'Avatar updated successfully!');
      setAvatarFile(null);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setLoadingObj(prev => ({ ...prev, avatar: false }));
    }
  };

  const uploadCover = async () => {
    if (!coverFile) return;
    try {
      setLoadingObj(prev => ({ ...prev, cover: true }));
      const formData = new FormData();
      formData.append('coverImage', coverFile);
      await userApi.updateCoverImage(formData);
      showMessage('success', 'Cover image updated successfully!');
      setCoverFile(null);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update cover image');
    } finally {
      setLoadingObj(prev => ({ ...prev, cover: false }));
    }
  };

  if (!currentUser) return null;

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, security, and preferences</p>
      </div>

      {message.text && (
        <div className={`alert-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {/* Images Section */}
        <div className="settings-card glass">
          <div className="card-header">
            <ImageIcon size={20} color="var(--accent-primary)" />
            <h2>Profile Images</h2>
          </div>
          
          <div className="cover-section">
            <label className="image-label">Cover Image</label>
            <div className="cover-preview" style={{ backgroundImage: `url(${coverPreview})` }}>
              <div className="upload-overlay">
                <label htmlFor="cover-upload" className="upload-btn">
                  <Camera size={20} />
                  <span>Change Cover</span>
                </label>
                <input id="cover-upload" type="file" accept="image/*" onChange={handleCoverChange} hidden />
              </div>
            </div>
            {coverFile && (
              <button className="save-btn" onClick={uploadCover} disabled={loadingObj.cover}>
                {loadingObj.cover ? 'Uploading...' : 'Save Cover Image'}
              </button>
            )}
          </div>

          <div className="avatar-section">
            <label className="image-label">Avatar</label>
            <div className="avatar-preview-wrapper">
              <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" />
              <div className="upload-overlay circle">
                <label htmlFor="avatar-upload" className="upload-btn icon-only">
                  <Camera size={20} />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </div>
            </div>
            {avatarFile && (
              <button className="save-btn" onClick={uploadAvatar} disabled={loadingObj.avatar}>
                {loadingObj.avatar ? 'Uploading...' : 'Save Avatar'}
              </button>
            )}
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="settings-card glass">
          <div className="card-header">
            <User size={20} color="var(--accent-secondary)" />
            <h2>Personal Information</h2>
          </div>
          <form onSubmit={handleUpdateDetails} className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={'@' + currentUser.username} 
                disabled 
                className="disabled-input"
              />
              <span className="helper-text">Usernames cannot be changed.</span>
            </div>
            <button type="submit" className="save-btn full-width" disabled={loadingObj.details}>
              {loadingObj.details ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="settings-card glass">
          <div className="card-header">
            <Lock size={20} color="#ff4757" />
            <h2>Security</h2>
          </div>
          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                required 
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" className="save-btn full-width danger" disabled={loadingObj.password}>
              {loadingObj.password ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .settings-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .settings-header p {
          color: var(--text-secondary);
        }

        .alert-banner {
          padding: 16px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          font-weight: 500;
        }

        .alert-banner.success {
          background: rgba(46, 213, 115, 0.1);
          color: #2ed573;
          border: 1px solid rgba(46, 213, 115, 0.2);
        }

        .alert-banner.error {
          background: rgba(255, 71, 87, 0.1);
          color: #ff4757;
          border: 1px solid rgba(255, 71, 87, 0.2);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .settings-card {
          padding: 24px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 16px;
        }

        .card-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .image-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 12px;
          display: block;
        }

        .cover-section, .avatar-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cover-preview {
          width: 100%;
          height: 120px;
          border-radius: var(--radius-md);
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
        }

        .avatar-preview-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
        }

        .avatar-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .cover-preview:hover .upload-overlay,
        .avatar-preview-wrapper:hover .upload-overlay {
          opacity: 1;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          color: #fff;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .upload-btn.icon-only {
          padding: 8px;
        }

        .upload-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .save-btn {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          align-self: flex-start;
        }

        .save-btn.full-width {
          width: 100%;
          align-self: auto;
          margin-top: 8px;
        }

        .save-btn.danger {
          background: #ff4757;
        }

        .save-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(123, 44, 191, 0.2);
        }

        .form-group input.disabled-input {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .helper-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
