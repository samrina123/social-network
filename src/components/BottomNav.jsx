import React from 'react';
import { Home, Compass, PlusSquare, Heart, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const BottomNav = ({ activeTab, setActiveTab, openCreateModal }) => {
  const { notifications } = useSocket();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="bottom-nav">
      <button 
        className={`bottom-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => setActiveTab('feed')}
      >
        <Home size={24} />
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
        onClick={() => setActiveTab('explore')}
      >
        <Compass size={24} />
      </button>

      <button 
        className="bottom-nav-item"
        onClick={openCreateModal}
        style={{ color: 'var(--ig-primary)' }}
      >
        <PlusSquare size={28} />
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
        onClick={() => setActiveTab('notifications')}
        style={{ position: 'relative' }}
      >
        <Heart size={24} />
        {unreadCount > 0 && <span className="badge-dot" style={{ top: '4px', left: '20px' }}>{unreadCount}</span>}
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <User size={24} />
      </button>
    </nav>
  );
};
