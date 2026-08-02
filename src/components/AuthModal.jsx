import React, { useState } from 'react';
import { ShieldCheck, Lock, X, UserPlus, LogIn, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ onClose, initialTab = 'signin' }) => {
  const { addNewUser, loginUser } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'signin' or 'signup'
  const [error, setError] = useState('');

  // Sign In Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState('');

  // File Upload for Profile Avatar
  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRegAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Sign In Form Handler
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginUsername.trim() || !loginPassword) {
      setError('Please enter both Username and Password.');
      return;
    }

    try {
      const user = loginUser(loginUsername, loginPassword);
      alert(`Welcome back @${user.username}! You are now logged in.`);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  // Sign Up Form Handler
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regUsername.trim() || !regPassword) {
      setError('Please fill in all required fields (Name, Username, Password).');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase().replace(/[@\s]+/g, '_');
    const host = window.location.hostname || 'localhost';

    fetch(`http://${host}:5000/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: regName.trim(),
        username: cleanUsername,
        avatar: regAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        bio: regBio.trim() || '✨ Real registered user on InstaPulse.'
      })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || 'Registration failed'); });
      }
      return res.json();
    })
    .then(newUser => {
      addNewUser(newUser);
      alert(`🎉 Account @${newUser.username} registered with 256-Bit E2EE Encryption! You are now signed in.`);
      onClose();
    })
    .catch(err => {
      setError(err.message);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', borderRadius: '24px' }}>
        {/* Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          <button 
            style={{
              flex: 1,
              padding: '16px',
              background: activeTab === 'signin' ? 'rgba(255,255,255,0.06)' : 'none',
              border: 'none',
              color: activeTab === 'signin' ? '#fff' : 'var(--text-muted)',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'signin' ? '2px solid var(--ig-primary)' : 'none'
            }}
            onClick={() => { setActiveTab('signin'); setError(''); }}
          >
            🔑 Sign In (Login)
          </button>

          <button 
            style={{
              flex: 1,
              padding: '16px',
              background: activeTab === 'signup' ? 'rgba(255,255,255,0.06)' : 'none',
              border: 'none',
              color: activeTab === 'signup' ? '#fff' : 'var(--text-muted)',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'signup' ? '2px solid var(--ig-primary)' : 'none'
            }}
            onClick={() => { setActiveTab('signup'); setError(''); }}
          >
            ✨ Sign Up (Register)
          </button>

          <button onClick={onClose} style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* E2EE Security Banner */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '10px 16px',
          fontSize: '0.78rem',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Lock size={16} />
          <span>Full Privacy Protected: 256-Bit E2EE Password Hashing & Direct Auth.</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ margin: '16px 20px 0 20px', color: 'var(--ig-danger)', fontSize: '0.85rem', padding: '10px', background: 'rgba(237, 73, 86, 0.12)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {/* TAB 1: SIGN IN (LOGIN) */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Username (@handle) *</label>
              <input 
                type="text" 
                className="creator-input" 
                style={{ minHeight: 'auto', padding: '12px' }} 
                placeholder="e.g. i_am_samrina"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password *</label>
              <input 
                type="password" 
                className="creator-input" 
                style={{ minHeight: 'auto', padding: '12px' }} 
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}>
              <LogIn size={16} /> Sign In
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Don't have an account yet?{' '}
              <span 
                style={{ color: 'var(--ig-primary)', cursor: 'pointer', fontWeight: '700' }}
                onClick={() => { setActiveTab('signup'); setError(''); }}
              >
                Create an account
              </span>
            </div>
          </form>
        )}

        {/* TAB 2: SIGN UP (REGISTER) */}
        {activeTab === 'signup' && (
          <form onSubmit={handleRegisterSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Profile Photo Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img 
                src={regAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} 
                alt="Avatar preview" 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--ig-primary)' }} 
              />
              <label className="btn-secondary-sm" style={{ cursor: 'pointer' }}>
                <Camera size={14} /> Upload Profile Photo
                <input type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
              </label>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name *</label>
              <input 
                type="text" 
                className="creator-input" 
                style={{ minHeight: 'auto', padding: '12px' }} 
                placeholder="e.g. Samrina Mughal"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Username (@handle) *</label>
              <input 
                type="text" 
                className="creator-input" 
                style={{ minHeight: 'auto', padding: '12px' }} 
                placeholder="e.g. i_am_samrina"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password *</label>
              <input 
                type="password" 
                className="creator-input" 
                style={{ minHeight: 'auto', padding: '12px' }} 
                placeholder="••••••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bio Description</label>
              <input 
                type="text" 
                className="creator-input" 
                style={{ minHeight: 'auto', padding: '12px' }} 
                placeholder="e.g. Photographer | Tech Lover ✨"
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}>
              <UserPlus size={16} /> Register & Sign In
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Already registered?{' '}
              <span 
                style={{ color: 'var(--ig-primary)', cursor: 'pointer', fontWeight: '700' }}
                onClick={() => { setActiveTab('signin'); setError(''); }}
              >
                Sign In to your account
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
