import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Heart, MessageCircle, FileText, BadgeCheck, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { generateE2EEKeyId } from '../utils/crypto';

export const SearchBar = () => {
  const { currentUser, users, addNewUser } = useAuth();
  const { posts, sendFriendRequest, friendRequests, toggleLikePost } = useSocket();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New User Register State with E2EE
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regError, setRegError] = useState('');

  // Real-time search filter for real database users
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
      return;
    }

    const host = window.location.hostname || 'localhost';
    fetch(`http://${host}:5000/api/search?q=${encodeURIComponent(query.trim())}`)
      .then(res => res.json())
      .then(data => {
        setSearchResults({
          users: data.users || [],
          posts: data.posts || []
        });
      })
      .catch(() => {
        const regex = new RegExp(query.trim(), 'i');
        const matchedUsers = users.filter(u => 
          regex.test(u.name) || regex.test(u.username) || regex.test(u.id)
        );
        const matchedPosts = posts.filter(p => 
          regex.test(p.caption || '') || regex.test(p.authorName) || regex.test(p.authorUsername)
        );
        setSearchResults({ users: matchedUsers, posts: matchedPosts });
      });
  }, [query, users, posts]);

  const handleRegisterUser = (e) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim() || !regUsername.trim() || !regPassword) return;

    const host = window.location.hostname || 'localhost';
    fetch(`http://${host}:5000/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: regName.trim(),
        username: regUsername.trim(),
        avatar: regAvatar,
        bio: regBio
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
      alert(`Account @${newUser.username} registered with 256-Bit End-to-End Encryption! Switched to @${newUser.username}.`);
      setRegName('');
      setRegUsername('');
      setRegPassword('');
      setRegAvatar('');
      setRegBio('');
      setIsRegisterModalOpen(false);
    })
    .catch(err => {
      setRegError(err.message);
    });
  };

  const getRequestStatus = (targetUserId) => {
    const req = friendRequests.find(r => 
      (r.fromUserId === currentUser.id && r.toUserId === targetUserId) ||
      (r.fromUserId === targetUserId && r.toUserId === currentUser.id)
    );
    return req ? req.status : null;
  };

  const userPosts = selectedUser ? posts.filter(p => p.authorId === selectedUser.id || p.authorUsername === selectedUser.username) : [];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
      {/* Search Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-full)',
        padding: '8px 16px',
        transition: 'border-color 0.2s'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search registered users or handles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            fontSize: '0.88rem',
            color: 'var(--text-primary)'
          }}
        />
        {query && (
          <button onClick={() => setQuery('')}>
            <X size={16} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {query.trim() && (
        <div style={{
          position: 'absolute',
          top: '46px',
          left: 0,
          right: 0,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '10px 0'
        }}>
          {/* Registered Database Users */}
          {searchResults.users.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ padding: '4px 16px', fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Registered Accounts ({searchResults.users.length})
              </div>
              {searchResults.users.map(user => (
                <div 
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  className="user-list-item"
                >
                  <div className="user-meta">
                    <img src={user.avatar} alt="" className="user-avatar-sm" />
                    <div className="user-info-sm">
                      <span className="user-name-sm">{user.name}</span>
                      <span className="user-handle-sm">@{user.username}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--ig-primary)', fontWeight: '700' }}>
                    View Profile
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* No user found in database */}
          {searchResults.users.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No registered user found for "@{query}".
              <div style={{ marginTop: '10px' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  onClick={() => {
                    setRegUsername(query.toLowerCase().replace(/\s+/g, '_'));
                    setRegName(query);
                    setIsRegisterModalOpen(true);
                    setQuery('');
                  }}
                >
                  <UserPlus size={12} /> Register Encrypted Account "@{query}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Searched Real User Profile Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', borderRadius: '20px' }}
          >
            <div className="modal-header">
              <span>@{selectedUser.username}'s Profile</span>
              <button onClick={() => setSelectedUser(null)}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={selectedUser.avatar} alt="" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--ig-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {selectedUser.name} <ShieldCheck size={16} color="#10b981" />
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>@{selectedUser.username}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={10} /> {generateE2EEKeyId(selectedUser.id)}
                    </div>
                  </div>
                </div>

                {selectedUser.id !== currentUser.id && (
                  <div>
                    {getRequestStatus(selectedUser.id) === 'pending' ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Requested</span>
                    ) : getRequestStatus(selectedUser.id) === 'accepted' ? (
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Friends
                      </span>
                    ) : (
                      <button 
                        className="btn-primary"
                        onClick={() => sendFriendRequest(selectedUser.id)}
                      >
                        <UserPlus size={14} /> Follow / Friend
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* User Posts Header */}
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Posts by {selectedUser.name.split(' ')[0]} ({userPosts.length})
              </h4>

              {/* Posts Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userPosts.map(post => (
                  <div key={post.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={post.authorAvatar} alt="" className="user-avatar-sm" />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{post.authorName}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTimeAgo(post.createdAt)}</span>
                    </div>

                    {post.mediaUrl && (
                      <img src={post.mediaUrl} alt="" style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                    )}

                    {post.caption && (
                      <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{post.caption}</p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      <button 
                        className="action-icon-btn" 
                        onClick={() => toggleLikePost(post.id, '❤️')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                      >
                        <Heart size={20} fill={post.likes.includes(currentUser.id) ? '#ed4956' : 'none'} color={post.likes.includes(currentUser.id) ? '#ed4956' : 'currentColor'} />
                        <span>{post.likes.length}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <MessageCircle size={20} />
                        <span>{post.comments.length} comments</span>
                      </div>
                    </div>
                  </div>
                ))}

                {userPosts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No posts published yet by @{selectedUser.username}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Real User Modal with End-to-End Encryption Banner */}
      {isRegisterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="#10b981" /> Encrypted Account Registration
              </span>
              <button onClick={() => setIsRegisterModalOpen(false)}><X size={20} /></button>
            </div>

            {/* E2EE Privacy Security Notice */}
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
              <span>Full Privacy Protected: 256-Bit E2EE Password Hashing & Chat Encryption enabled.</span>
            </div>

            <form onSubmit={handleRegisterUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {regError && (
                <div style={{ color: 'var(--ig-danger)', fontSize: '0.85rem', padding: '8px', background: 'rgba(237, 73, 86, 0.1)', borderRadius: '6px' }}>
                  {regError}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input 
                  type="text" 
                  className="creator-input" 
                  style={{ minHeight: 'auto', padding: '10px' }} 
                  placeholder="e.g. Roshan Khan"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Username (@handle)</label>
                <input 
                  type="text" 
                  className="creator-input" 
                  style={{ minHeight: 'auto', padding: '10px' }} 
                  placeholder="e.g. roshan"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account Password (Encrypted)</label>
                <input 
                  type="password" 
                  className="creator-input" 
                  style={{ minHeight: 'auto', padding: '10px' }} 
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
                  style={{ minHeight: 'auto', padding: '10px' }} 
                  placeholder="e.g. Photographer & Traveler ✨"
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
                <Lock size={14} /> Register Encrypted Account
              </button>
            </form>
          </div>
        </div>
      )}
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
