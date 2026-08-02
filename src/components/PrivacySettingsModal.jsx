import React from 'react';
import { Shield, Eye, Lock, Globe, Users, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PrivacySettingsModal = ({ onClose }) => {
  const { currentUser, updatePrivacy } = useAuth();
  const privacy = currentUser.privacy || {};

  const handleTogglePrivateProfile = () => {
    updatePrivacy({ isPrivateProfile: !privacy.isPrivateProfile });
  };

  const handleToggleOnlineStatus = () => {
    updatePrivacy({ showOnlineStatus: !privacy.showOnlineStatus });
  };

  const handleAllowTaggingChange = (val) => {
    updatePrivacy({ allowTagging: val });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--ig-primary)" />
            <span>Account & Privacy Controls</span>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Private Profile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>Private Account</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                When your account is private, only people you approve can see your photos and videos.
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={privacy.isPrivateProfile || false} 
                onChange={handleTogglePrivateProfile}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                background: privacy.isPrivateProfile ? 'var(--ig-primary)' : 'var(--border-subtle)',
                borderRadius: '24px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: privacy.isPrivateProfile ? '22px' : '3px',
                  bottom: '3px',
                  background: '#fff',
                  borderRadius: '50%',
                  transition: '0.2s'
                }} />
              </span>
            </label>
          </div>

          {/* Activity Status Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>Show Online Status</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Allow accounts you follow to see when you were last active or currently online.
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={privacy.showOnlineStatus !== false} 
                onChange={handleToggleOnlineStatus}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                background: privacy.showOnlineStatus !== false ? 'var(--ig-primary)' : 'var(--border-subtle)',
                borderRadius: '24px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: privacy.showOnlineStatus !== false ? '22px' : '3px',
                  bottom: '3px',
                  background: '#fff',
                  borderRadius: '50%',
                  transition: '0.2s'
                }} />
              </span>
            </label>
          </div>

          {/* Mentions & Tagging Permissions */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.92rem', marginBottom: '4px' }}>Who can tag & mention you</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Choose who can tag your username in comments and posts.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['everyone', 'friends', 'noone'].map(option => (
                <label 
                  key={option} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: privacy.allowTagging === option ? 'rgba(0, 149, 246, 0.1)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.88rem', textTransform: 'capitalize' }}>
                    {option === 'noone' ? 'No One' : option}
                  </span>
                  <input 
                    type="radio" 
                    name="tagging" 
                    checked={privacy.allowTagging === option || (option === 'everyone' && !privacy.allowTagging)}
                    onChange={() => handleAllowTaggingChange(option)}
                  />
                </label>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={onClose} style={{ alignSelf: 'flex-end', marginTop: '10px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
