import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Globe, 
  Users, 
  Lock,
  Smile,
  X,
  Copy,
  Check,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const REACTION_EMOJIS = ['❤️', '🔥', '😍', '😂', '👏', '🙌'];

export const PostCard = ({ post }) => {
  const { currentUser, users } = useAuth();
  const { toggleLikePost, addComment, sendChatMessage, createStory } = useSocket();

  const friends = users.filter(u => u.id !== currentUser.id);

  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Share Post Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedFriends, setSharedFriends] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedToStory, setSharedToStory] = useState(false);

  const isLiked = post.likes.includes(currentUser.id);

  // Double Tap to Like
  const handleDoubleTap = () => {
    setShowHeartBurst(true);
    if (!isLiked) {
      toggleLikePost(post.id, '❤️');
    }
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput);
    setCommentInput('');
    setShowComments(true);
  };

  const handleSendPostToFriend = (friendId, friendName) => {
    const msgText = `📌 Shared Post by @${post.authorUsername}: "${post.caption ? post.caption.substring(0, 40) + '...' : 'Check out this post!'}"`;
    sendChatMessage(friendId, msgText);

    setSharedFriends(prev => ({ ...prev, [friendId]: true }));
    setTimeout(() => {
      setSharedFriends(prev => ({ ...prev, [friendId]: false }));
    }, 2500);
  };

  const handleCopyPostLink = () => {
    const postLink = `${window.location.origin}?post=${post.id}`;
    navigator.clipboard.writeText(postLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareToMyStory = () => {
    createStory({
      mediaUrl: post.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      caption: `Reposting @${post.authorUsername}: ${post.caption ? post.caption.substring(0, 30) : ''} ✨`
    });

    setSharedToStory(true);
    setTimeout(() => setSharedToStory(false), 2500);
  };

  const getPrivacyIcon = (privacy) => {
    switch(privacy) {
      case 'friends': return <Users size={12} />;
      case 'private': return <Lock size={12} />;
      default: return <Globe size={12} />;
    }
  };

  return (
    <>
      <article className="post-card">
        {/* Post Header */}
        <header className="post-header">
          <div className="post-author">
            <img src={post.authorAvatar} alt={post.authorName} className="user-avatar-sm" />
            <div>
              <div className="author-name">
                <span>{post.authorName}</span>
                <span className="privacy-badge">
                  {getPrivacyIcon(post.privacy)} {post.privacy}
                </span>
              </div>
              {post.location && <div className="post-location">{post.location}</div>}
            </div>
          </div>
          <div className="post-time">{formatTimeAgo(post.createdAt)}</div>
        </header>

        {/* Post Media Area */}
        {post.mediaUrl && (
          <div className="post-media-box" onDoubleClick={handleDoubleTap}>
            <img src={post.mediaUrl} alt="Post content" className="post-media-img" />
            
            <div className={`heart-burst ${showHeartBurst ? 'animate' : ''}`}>
              <Heart size={100} fill="#ed4956" color="#ed4956" />
            </div>
          </div>
        )}

        {/* Post Actions & Toolbar */}
        <div className="post-content">
          <div className="post-actions">
            <div className="action-group">
              {/* Reaction Button */}
              <div style={{ position: 'relative' }}>
                <button 
                  className={`action-icon-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => toggleLikePost(post.id, '❤️')}
                  onMouseEnter={() => setShowReactionPicker(true)}
                >
                  <Heart size={24} fill={isLiked ? '#ed4956' : 'none'} color={isLiked ? '#ed4956' : 'currentColor'} />
                </button>

                {showReactionPicker && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '-42px',
                      left: '-10px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      padding: '4px 10px',
                      display: 'flex',
                      gap: '8px',
                      boxShadow: 'var(--shadow-md)',
                      zIndex: 20
                    }}
                    onMouseLeave={() => setShowReactionPicker(false)}
                  >
                    {REACTION_EMOJIS.map(emoji => (
                      <span 
                        key={emoji} 
                        style={{ cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.15s' }}
                        onClick={() => {
                          toggleLikePost(post.id, emoji);
                          setShowReactionPicker(false);
                        }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment Drawer Toggle */}
              <button 
                className="action-icon-btn"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle size={24} />
              </button>

              {/* Share Post Button */}
              <button 
                className="action-icon-btn"
                onClick={() => setIsShareModalOpen(true)}
                title="Share post with friends or to story"
              >
                <Send size={22} />
              </button>
            </div>

            {/* Bookmark Button */}
            <button 
              className="action-icon-btn"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark size={24} fill={isSaved ? 'var(--text-primary)' : 'none'} />
            </button>
          </div>

          {/* Likes & Reactions Counter */}
          <div className="likes-count">
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
            {Object.keys(post.reactions || {}).length > 0 && (
              <span style={{ marginLeft: '8px', fontSize: '0.85rem' }}>
                {Object.keys(post.reactions).join(' ')}
              </span>
            )}
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="post-caption">
              <span className="caption-username">@{post.authorUsername}</span>
              {post.caption}
            </div>
          )}

          {/* Comments Section */}
          {post.comments.length > 0 && !showComments && (
            <button 
              className="view-comments-btn"
              onClick={() => setShowComments(true)}
            >
              View all {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </button>
          )}

          {showComments && (
            <div className="comments-list">
              {post.comments.map(c => (
                <div key={c.id} className="comment-item">
                  <img src={c.userAvatar} alt="" className="user-avatar-sm" style={{ width: '26px', height: '26px' }} />
                  <div>
                    <span className="comment-author">{c.userName}</span>
                    <span className="comment-text">{c.text}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatTimeAgo(c.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input Bar */}
        <form className="comment-input-box" onSubmit={handleCommentSubmit}>
          <Smile size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
          <input
            type="text"
            className="comment-input"
            placeholder="Add a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <button 
            type="submit" 
            className="post-comment-btn"
            disabled={!commentInput.trim()}
          >
            Post
          </button>
        </form>
      </article>

      {/* Share Post Modal */}
      {isShareModalOpen && (
        <div className="modal-overlay" onClick={() => setIsShareModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <span>Share Post with Friends</span>
              <button onClick={() => setIsShareModalOpen(false)}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Share to My Story Option */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(225, 48, 108, 0.1)',
                border: '1px solid rgba(225, 48, 108, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PlusCircle size={20} color="var(--ig-danger)" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>Add Post to Your Story</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share in 24h story feed</div>
                  </div>
                </div>
                <button 
                  className="btn-primary"
                  style={{ background: 'var(--ig-gradient)', padding: '6px 14px', fontSize: '0.78rem' }}
                  onClick={handleShareToMyStory}
                >
                  {sharedToStory ? 'Added! ✓' : '+ Add to Story'}
                </button>
              </div>

              {/* Copy Post Link Option */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Copy size={18} color="var(--ig-primary)" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>Copy Post Link</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share link anywhere</div>
                  </div>
                </div>
                <button 
                  className="btn-secondary-sm"
                  onClick={handleCopyPostLink}
                >
                  {copiedLink ? 'Copied! ✓' : 'Copy Link'}
                </button>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                Send directly to Friends in DMs:
              </div>

              {/* Friends List for Direct Sharing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {friends.map(friend => (
                  <div key={friend.id} className="user-list-item">
                    <div className="user-meta">
                      <img src={friend.avatar} alt="" className="user-avatar-sm" />
                      <div className="user-info-sm">
                        <span className="user-name-sm">{friend.name}</span>
                        <span className="user-handle-sm">@{friend.username}</span>
                      </div>
                    </div>

                    <button 
                      className={sharedFriends[friend.id] ? 'btn-secondary-sm' : 'btn-primary'}
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                      onClick={() => handleSendPostToFriend(friend.id, friend.name)}
                    >
                      {sharedFriends[friend.id] ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                          <Check size={12} /> Sent
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Send size={12} /> Send
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
