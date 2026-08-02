import React, { useState } from 'react';
import { X, Heart, MessageCircle, Share2, Send, Bookmark, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const QUICK_COMMENT_EMOJIS = ['❤️', '🔥', '😍', '😎', '👏', '🥳', '✨', '💯'];
const COMMENT_EMOJI_PICKER = ['✨', '🌸', '💖', '🔥', '❤️', '😍', '😎', '📸', '🌊', '🥳', '🎉', '💫', '🌟', '🚀', '☕', '😂', '💯', '👏', '👑', '⚡', '🤩', '🎯', '🙌', '🎈', '🎁', '🎂', '🍷', '🍕', '🏆', '💎', '🌺', '🦋'];

export const PostDetailModal = ({ post, onClose }) => {
  const { currentUser } = useAuth();
  const { posts, toggleLikePost, addComment } = useSocket();

  // Find live updated post reference from global Socket state
  const livePost = posts.find(p => p.id === post.id) || post;

  const [commentText, setCommentText] = useState('');
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isLiked = livePost.likes.includes(currentUser.id);

  const handleDoubleTap = () => {
    if (!isLiked) {
      toggleLikePost(livePost.id, '❤️');
    }
    setDoubleTapHeart(true);
    setTimeout(() => setDoubleTapHeart(false), 900);
  };

  // Append emoji directly into comment text field
  const handleAppendEmoji = (emoji) => {
    setCommentText(prev => prev + emoji);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(livePost.id, commentText.trim());
    setCommentText('');
    setShowEmojiPicker(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '940px',
          height: '82vh',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          borderRadius: '24px',
          overflow: 'hidden'
        }}
      >
        {/* Left Post Image View */}
        <div 
          style={{
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            userSelect: 'none',
            overflow: 'hidden'
          }}
          onDoubleClick={handleDoubleTap}
        >
          <img src={livePost.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

          {/* Double Tap Bursting Heart Animation */}
          {doubleTapHeart && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              animation: 'heartBurst 0.8s ease-out forwards'
            }}>
              <Heart size={95} fill="#ed4956" color="#ed4956" />
            </div>
          )}
        </div>

        {/* Right Comments & Activity Drawer */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)', position: 'relative' }}>
          {/* Post Author Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={livePost.authorAvatar} alt="" className="user-avatar-sm" />
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>{livePost.authorName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{livePost.authorUsername} • {livePost.location || 'Public'}</div>
              </div>
            </div>

            <button onClick={onClose}><X size={20} color="var(--text-muted)" /></button>
          </div>

          {/* Caption & Comments Stream */}
          <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Author Caption */}
            {livePost.caption && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <img src={livePost.authorAvatar} alt="" className="user-avatar-sm" />
                <div style={{ fontSize: '0.88rem', flex: 1 }}>
                  <strong style={{ marginRight: '6px' }}>{livePost.authorUsername}</strong>
                  <span>{livePost.caption}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{formatTimeAgo(livePost.createdAt)}</div>
                </div>
              </div>
            )}

            {/* Comments List (Live Updated) */}
            {livePost.comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                <img src={c.userAvatar} alt="" className="user-avatar-sm" />
                <div style={{ fontSize: '0.88rem', flex: 1 }}>
                  <strong style={{ marginRight: '6px' }}>{c.userName}</strong>
                  <span>{c.text}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{formatTimeAgo(c.createdAt)}</div>
                </div>
              </div>
            ))}

            {livePost.comments.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No comments yet. Be the first to comment on this post!
              </div>
            )}
          </div>

          {/* Activity Bar (Likes, Reactions, Date) */}
          <div style={{ borderTop: '1px solid var(--border-color)', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button className="action-icon-btn" onClick={() => toggleLikePost(livePost.id, '❤️')}>
                  <Heart size={22} fill={isLiked ? '#ed4956' : 'none'} color={isLiked ? '#ed4956' : 'currentColor'} />
                </button>
                <button className="action-icon-btn">
                  <MessageCircle size={22} />
                </button>
                <button className="action-icon-btn" onClick={() => alert('Post link copied to clipboard!')}>
                  <Share2 size={20} />
                </button>
              </div>

              <button className="action-icon-btn">
                <Bookmark size={20} />
              </button>
            </div>

            {/* Total Likes Count */}
            <div style={{ fontWeight: '800', fontSize: '0.88rem' }}>
              {livePost.likes.length} likes • {livePost.comments.length} comments
            </div>

            {/* Quick Clickable Emojis (Inserts directly into Comment Box!) */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {QUICK_COMMENT_EMOJIS.map((emoji, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => handleAppendEmoji(emoji)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s' }}
                  title={`Add ${emoji} to comment`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Emoji Picker Popover Box */}
          {showEmojiPicker && (
            <div style={{
              position: 'absolute',
              bottom: '70px',
              left: '16px',
              right: '16px',
              background: 'rgba(20, 20, 24, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '18px',
              padding: '12px 16px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.85)',
              zIndex: 100
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)' }}>Click Emoji to Insert into Comment</span>
                <button type="button" onClick={() => setShowEmojiPicker(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px',
                textAlign: 'center',
                maxHeight: '140px',
                overflowY: 'auto'
              }}>
                {COMMENT_EMOJI_PICKER.map((emoji, idx) => (
                  <span 
                    key={idx}
                    style={{ fontSize: '1.3rem', cursor: 'pointer', padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', transition: 'transform 0.15s' }}
                    onClick={() => handleAppendEmoji(emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Always-Visible Fixed Bottom Comment Input Bar */}
          <form onSubmit={handleCommentSubmit} style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-surface)' }}>
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
              title="Open Emoji Picker"
            >
              <Smile size={22} color="#fcb045" />
            </button>

            <input 
              type="text" 
              className="creator-input"
              style={{ minHeight: 'auto', padding: '10px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', flex: 1 }}
              placeholder="Add a comment... (Click 😊 or emojis above)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!commentText.trim()} 
              style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', opacity: commentText.trim() ? 1 : 0.5, cursor: commentText.trim() ? 'pointer' : 'not-allowed' }}
            >
              Post
            </button>
          </form>
        </div>
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
