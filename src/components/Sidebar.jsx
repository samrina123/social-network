import React from 'react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageCircle, 
  Heart, 
  User, 
  ShieldCheck, 
  Sparkles,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  openPostModal, 
  openPrivacyModal,
  openAuthModal
}) => {
  const { currentUser, users, switchUser, logoutUser } = useAuth();
  const { notifications, friendRequests } = useSocket();

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;
  const pendingRequestsCount = friendRequests.filter(r => r.toUserId === currentUser?.id && r.status === 'pending').length;
  const totalBadges = unreadNotifsCount + pendingRequestsCount;

  return (
    <aside className="sidebar-container">
      {/* Brand Logo */}
      <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={24} color="#f09433" />
        <span className="brand-name">InstaPulse</span>
      </div>

      {/* Main Navigation Menu */}
      <nav className="nav-menu">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageCircle size={22} />
          <span>Messages</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
          style={{ position: 'relative' }}
        >
          <Heart size={22} />
          <span>Notifications</span>
          {totalBadges > 0 && (
            <span className="badge-count" style={{ position: 'absolute', right: '16px' }}>
              {totalBadges}
            </span>
          )}
        </button>

        <button className="nav-item" onClick={openPostModal}>
          <PlusSquare size={22} />
          <span>Create Post</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={22} />
          <span>Profile</span>
        </button>

        <button className="nav-item" onClick={openPrivacyModal}>
          <ShieldCheck size={22} />
          <span>Privacy & E2EE</span>
        </button>

        {/* Auth Buttons */}
        {currentUser ? (
          <button 
            className="btn-secondary-sm" 
            onClick={() => {
              logoutUser();
              openAuthModal('signin');
            }}
            style={{ 
              marginTop: '12px',
              width: '100%',
              justifyContent: 'center',
              padding: '10px 16px',
              borderRadius: 'var(--radius-full)',
              color: '#ff453a',
              borderColor: 'rgba(255, 69, 58, 0.3)',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <button 
              className="btn-primary" 
              onClick={() => openAuthModal('signin')}
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
            <button 
              className="btn-secondary-sm" 
              onClick={() => openAuthModal('signup')}
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          </div>
        )}
      </nav>

      {/* Account Switcher Footer Card */}
      {currentUser && (
        <div className="user-switcher-card">
          <div className="current-user-info">
            <img src={currentUser.avatar} alt="" className="user-avatar-sm" />
            <div className="user-details">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-handle">@{currentUser.username}</span>
            </div>
          </div>

          {/* User Switcher Dropdown */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '800' }}>
              Switch Active User ({users.length})
            </div>
            <select 
              className="user-select-dropdown"
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} (@{u.username})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </aside>
  );
};
