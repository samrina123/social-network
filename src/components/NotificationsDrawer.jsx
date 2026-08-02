import React from 'react';
import { Heart, MessageCircle, UserPlus, Check, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const NotificationsDrawer = () => {
  const { notifications, respondFriendRequest } = useSocket();

  const getNotifIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={16} fill="#ed4956" color="#ed4956" />;
      case 'comment': return <MessageCircle size={16} color="var(--ig-primary)" />;
      default: return <UserPlus size={16} color="#10b981" />;
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        Notifications & Activity
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map(n => (
          <div 
            key={n.id} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: n.isRead ? 'transparent' : 'rgba(0, 149, 246, 0.08)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img src={n.senderAvatar} alt="" className="user-avatar-sm" />
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: 'var(--bg-surface)',
                  borderRadius: '50%',
                  padding: '2px'
                }}>
                  {getNotifIcon(n.type)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.88rem' }}>
                  <strong style={{ color: '#fff' }}>{n.senderName}</strong> {n.text}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatTimeAgo(n.createdAt)}
                </div>
              </div>
            </div>

            {/* Friend Request Action Buttons */}
            {n.type === 'friend_request' && n.requestId && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => respondFriendRequest(n.requestId, 'accepted')}
                >
                  <Check size={12} /> Accept
                </button>
                <button 
                  className="btn-secondary-sm" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => respondFriendRequest(n.requestId, 'declined')}
                >
                  <X size={12} /> Decline
                </button>
              </div>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No new notifications yet. When friends interact with your posts, updates will appear in real time!
          </div>
        )}
      </div>
    </div>
  );
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};
