import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { StoriesBar } from './components/StoriesBar';
import { PostCreator } from './components/PostCreator';
import { PostCard } from './components/PostCard';
import { ProfileView } from './components/ProfileView';
import { MessagesDrawer } from './components/MessagesDrawer';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { SearchBar } from './components/SearchBar';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { Sparkles, UserPlus, LogIn, LogOut } from 'lucide-react';

const MainAppLayout = () => {
  const { currentUser, logoutUser } = useAuth();
  const { posts } = useSocket();

  const [activeTab, setActiveTab] = useState('home');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');

  const openAuth = (tab = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="app-viewport">
      {/* Sidebar for Desktop */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        openPostModal={() => setIsPostModalOpen(true)}
        openPrivacyModal={() => setIsPrivacyModalOpen(true)}
        openAuthModal={openAuth}
      />

      {/* Main Content Feed Container */}
      <main className="feed-container">
        {/* Top Sticky Header */}
        <header className="top-header">
          <div className="mobile-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#f09433" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.2rem' }}>InstaPulse</span>
          </div>

          <SearchBar />

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn-secondary-sm" 
                onClick={() => openAuth('signin')}
                style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button 
                className="btn-primary" 
                onClick={() => openAuth('signup')}
                style={{ 
                  padding: '6px 14px', 
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(45deg, #f09433, #dc2743)'
                }}
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" onClick={() => openAuth('signin')}>
                <LogIn size={14} /> Sign In
              </button>
              <button className="btn-secondary-sm" onClick={() => openAuth('signup')}>
                <UserPlus size={14} /> Sign Up
              </button>
            </div>
          )}
        </header>

        {/* Tab Routing Container */}
        {activeTab === 'home' && (
          <div>
            <StoriesBar />
            {currentUser && <PostCreator />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}

              {posts.length === 0 && (
                <div style={{
                  background: 'var(--bg-card)',
                  backdropFilter: 'var(--glass-blur)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <Sparkles size={36} color="var(--ig-primary)" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Welcome to InstaPulse! ✨
                  </h3>
                  <p style={{ fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 18px auto', lineHeight: '1.5' }}>
                    No posts published yet. Share a photo or write your first post above to start the feed!
                  </p>
                  {currentUser && (
                    <button className="btn-primary" onClick={() => setIsPostModalOpen(true)} style={{ margin: '0 auto' }}>
                      + Create First Post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          currentUser ? (
            <ProfileView openPostModal={() => setIsPostModalOpen(true)} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <h2>Sign In to View Your Profile</h2>
              <p style={{ marginTop: '8px', marginBottom: '16px' }}>Please Sign In or Sign Up to view your profile and create posts.</p>
              <button className="btn-primary" onClick={() => openAuth('signin')}>Sign In</button>
            </div>
          )
        )}

        {activeTab === 'messages' && (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <MessagesDrawer />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <NotificationsDrawer />
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        openPostModal={() => setIsPostModalOpen(true)}
      />

      {/* Modals & Triggers */}
      {isPostModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPostModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <PostCreator isModal={true} onClose={() => setIsPostModalOpen(false)} />
          </div>
        </div>
      )}

      {isPrivacyModalOpen && (
        <PrivacySettingsModal onClose={() => setIsPrivacyModalOpen(false)} />
      )}

      {isAuthModalOpen && (
        <AuthModal initialTab={authModalTab} onClose={() => setIsAuthModalOpen(false)} />
      )}

      {/* Socket Notifications Toast Container */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainAppLayout />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
