import React, { useState } from 'react';
import { Grid, Bookmark, Users, Settings, Edit, Heart, MessageCircle, Plus, Camera, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { PostDetailModal } from './PostDetailModal';

export const ProfileView = ({ openCreateModal, openPostModal }) => {
  const { currentUser, updateProfile } = useAuth();
  const { posts, updateProfileOnServer } = useSocket();

  const handleOpenCreatePost = openCreateModal || openPostModal;

  const [activeTab, setActiveTab] = useState('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPostModal, setSelectedPostModal] = useState(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editCover, setEditCover] = useState(currentUser.cover || '');

  // Filter posts authored by current user
  const userPosts = posts.filter(p => p.authorId === currentUser.id || p.authorUsername === currentUser.username);

  // File Upload Handlers
  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedData = {
      name: editName,
      username: editUsername,
      bio: editBio,
      website: editWebsite,
      avatar: editAvatar,
      cover: editCover
    };

    updateProfile(updatedData);
    updateProfileOnServer(updatedData);
    setIsEditModalOpen(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Header Banner & Avatar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        {/* Cover Photo */}
        <div style={{ height: '180px', width: '100%', background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)', position: 'relative' }}>
          {currentUser.cover && (
            <img src={currentUser.cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        {/* Profile Info Details */}
        <div style={{ padding: '0 24px 24px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-50px', marginBottom: '16px' }}>
            <div className="story-ring" style={{ width: '110px', height: '110px', padding: '3px', position: 'relative' }}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="story-avatar" 
                style={{ width: '104px', height: '104px', borderWidth: '4px' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={handleOpenCreatePost}
              >
                <Plus size={16} /> + New Post
              </button>

              <button 
                className="btn-secondary-sm" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => {
                  setEditName(currentUser.name);
                  setEditUsername(currentUser.username);
                  setEditBio(currentUser.bio || '');
                  setEditWebsite(currentUser.website || '');
                  setEditAvatar(currentUser.avatar);
                  setEditCover(currentUser.cover || '');
                  setIsEditModalOpen(true);
                }}
              >
                <Edit size={14} /> Edit Profile
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{currentUser.name}</h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{currentUser.username}</span>
            </div>

            {/* Instagram Style Stats Row */}
            <div style={{ display: 'flex', gap: '24px', margin: '6px 0', fontSize: '0.95rem' }}>
              <div><strong style={{ color: '#fff' }}>{userPosts.length}</strong> <span style={{ color: 'var(--text-secondary)' }}>posts</span></div>
              <div><strong style={{ color: '#fff' }}>{currentUser.followersCount || 0}</strong> <span style={{ color: 'var(--text-secondary)' }}>followers</span></div>
              <div><strong style={{ color: '#fff' }}>{currentUser.followingCount || 0}</strong> <span style={{ color: 'var(--text-secondary)' }}>following</span></div>
            </div>

            {/* Bio & Link */}
            {currentUser.bio && (
              <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line', color: 'var(--text-primary)' }}>
                {currentUser.bio}
              </p>
            )}

            {currentUser.website && (
              <a 
                href={currentUser.website} 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '0.85rem', color: 'var(--ig-primary)', textDecoration: 'none', fontWeight: '600' }}
              >
                {currentUser.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: 'var(--text-muted)'
      }}>
        <button 
          className={`nav-item ${activeTab === 'grid' ? 'active' : ''}`}
          style={{ padding: '12px 16px', borderRadius: '0' }}
          onClick={() => setActiveTab('grid')}
        >
          <Grid size={18} />
          <span>POSTS ({userPosts.length})</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          style={{ padding: '12px 16px', borderRadius: '0' }}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={18} />
          <span>SAVED</span>
        </button>
      </div>

      {/* Instagram 3-Column Image Grid View (Clickable to open Post Detail Activity Modal) */}
      {activeTab === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          {userPosts.map(post => (
            <div 
              key={post.id} 
              onClick={() => setSelectedPostModal(post)}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#000'
              }}
              className="grid-post-item"
            >
              <img src={post.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                color: '#fff',
                opacity: 0,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                  <Heart size={20} fill="#fff" />
                  <span>{post.likes.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                  <MessageCircle size={20} fill="#fff" />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </div>
          ))}

          {userPosts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <h3>No posts yet</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Click "+ New Post" above to share your first photo or thought!</p>
              <button 
                className="btn-primary" 
                style={{ marginTop: '16px', padding: '8px 20px' }}
                onClick={handleOpenCreatePost}
              >
                <Plus size={16} /> + New Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* Post Activity Detail Modal */}
      {selectedPostModal && (
        <PostDetailModal post={selectedPostModal} onClose={() => setSelectedPostModal(null)} />
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <span>Edit Profile & Avatar</span>
              <button onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={editAvatar} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                <label className="btn-secondary-sm" style={{ cursor: 'pointer' }}>
                  <Camera size={14} /> Change Avatar Photo
                  <input type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
                </label>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input 
                  type="text" 
                  className="creator-input" 
                  style={{ minHeight: 'auto', padding: '10px' }} 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Username</label>
                <input 
                  type="text" 
                  className="creator-input" 
                  style={{ minHeight: 'auto', padding: '10px' }} 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bio Description</label>
                <textarea 
                  className="creator-input" 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Website Link</label>
                <input 
                  type="text" 
                  className="creator-input" 
                  style={{ minHeight: 'auto', padding: '10px' }} 
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary-sm" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
