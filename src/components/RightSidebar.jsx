import React from 'react';
import { Wifi, WifiOff, UserPlus, Check, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { SearchBar } from './SearchBar';

export const RightSidebar = () => {
  const { currentUser, users } = useAuth();
  const { isConnected, sendFriendRequest, friendRequests } = useSocket();

  const suggestedUsers = users.filter(u => u.id !== currentUser.id);

  const getRequestStatus = (targetUserId) => {
    const req = friendRequests.find(r => 
      (r.fromUserId === currentUser.id && r.toUserId === targetUserId) ||
      (r.fromUserId === targetUserId && r.toUserId === currentUser.id)
    );
    return req ? req.status : null;
  };

  return (
    <aside className="right-widgets">
      {/* Search Bar for Finding Any Random Person ID */}
      <div style={{ marginBottom: '8px' }}>
        <SearchBar />
      </div>

      {/* Active Session & Engine Status */}
      <div className="widget-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MongoDB & WebSockets:</span>
            {isConnected ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.78rem', fontWeight: '700' }}>
                <Wifi size={14} /> Connected
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.78rem', fontWeight: '700' }}>
                <WifiOff size={14} /> Standalone
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-sm" style={{ width: '48px', height: '48px' }} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{currentUser.username}</div>
          </div>
        </div>
      </div>

      {/* Suggested Connections / People You May Know */}
      <div className="widget-card">
        <div className="widget-title">
          <span>Suggested For You</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ig-primary)', cursor: 'pointer' }}>See All</span>
        </div>

        <div className="user-list">
          {suggestedUsers.map(user => {
            const reqStatus = getRequestStatus(user.id);
            return (
              <div key={user.id} className="user-list-item">
                <div className="user-meta">
                  <div style={{ position: 'relative' }}>
                    <img src={user.avatar} alt={user.name} className="user-avatar-sm" />
                    <span className={`status-dot ${user.isOnline ? '' : 'offline'}`} style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--bg-surface)' }} />
                  </div>
                  <div className="user-info-sm">
                    <span className="user-name-sm">{user.name}</span>
                    <span className="user-handle-sm">@{user.username}</span>
                  </div>
                </div>

                {reqStatus === 'pending' ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requested</span>
                ) : reqStatus === 'accepted' ? (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Check size={12} /> Friends
                  </span>
                ) : (
                  <button 
                    className="btn-secondary-sm"
                    onClick={() => sendFriendRequest(user.id)}
                  >
                    Follow
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
