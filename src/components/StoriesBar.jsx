import React, { useState } from 'react';
import { Plus, X, Image, Send, Smile, Heart, Share2, Check, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const EMOJI_PRESETS = ['✨', '🔥', '❤️', '😍', '😎', '📸', '🌊', '🥳', '🎉', '💫', '🌟', '💖', '🚀', '☕', '😂', '💯', '🌸', '👏'];
const QUICK_REACTION_EMOJIS = ['❤️', '🔥', '😂', '😍', '😮', '👏', '💖', '🎉'];

export const StoriesBar = () => {
  const { currentUser, users } = useAuth();
  const { stories, createStory, sendChatMessage } = useSocket();

  const friends = users.filter(u => u.id !== currentUser?.id);

  const [selectedStory, setSelectedStory] = useState(null);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [storyImage, setStoryImage] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [storyReactionAnim, setStoryReactionAnim] = useState(null);
  const [storyReplyText, setStoryReplyText] = useState('');

  // Share Story Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedFriends, setSharedFriends] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishStory = (e) => {
    e.preventDefault();
    if (!storyImage) return;

    createStory({
      mediaUrl: storyImage,
      caption: storyCaption
    });

    setStoryImage('');
    setStoryCaption('');
    setShowEmojiPicker(false);
    setIsAddStoryOpen(false);
  };

  const handleAppendEmoji = (emoji) => {
    setStoryCaption(prev => prev + emoji);
  };

  const handleStoryReaction = (emoji) => {
    setStoryReactionAnim(emoji);
    setTimeout(() => setStoryReactionAnim(null), 1200);
  };

  const handleSendStoryToFriend = (friendId, friendName) => {
    if (!selectedStory) return;
    const msgText = `📸 Shared Story by @${selectedStory.username}: "${selectedStory.items[0].caption || 'Check out this story!'}"`;
    sendChatMessage(friendId, msgText);

    setSharedFriends(prev => ({ ...prev, [friendId]: true }));
    setTimeout(() => {
      setSharedFriends(prev => ({ ...prev, [friendId]: false }));
    }, 2500);
  };

  const handleCopyStoryLink = () => {
    const storyLink = `${window.location.origin}?story=${selectedStory?.id || '123'}`;
    navigator.clipboard.writeText(storyLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <div className="stories-bar">
        {/* Your Story Add Button */}
        {currentUser && (
          <div className="story-item" onClick={() => setIsAddStoryOpen(true)}>
            <div className="story-ring" style={{ background: 'var(--border-color)', position: 'relative' }}>
              <img src={currentUser.avatar} alt="Your Story" className="story-avatar" />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'var(--ig-primary)',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-surface)'
              }}>
                <Plus size={14} color="#fff" />
              </div>
            </div>
            <span className="story-username">Your Story</span>
          </div>
        )}

        {/* Stories from Friends / Real Registered Accounts */}
        {stories.map(story => (
          <div 
            key={story.id} 
            className="story-item"
            onClick={() => setSelectedStory(story)}
          >
            <div className={`story-ring ${story.hasUnseen ? '' : 'seen'}`}>
              <img src={story.userAvatar} alt={story.username} className="story-avatar" />
            </div>
            <span className="story-username">@{story.username}</span>
          </div>
        ))}
      </div>

      {/* Story Playback Viewer Modal */}
      {selectedStory && (
        <div className="modal-overlay" onClick={() => setSelectedStory(null)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '420px', background: '#000', padding: '0', borderRadius: '20px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', height: '620px', display: 'flex', flexDirection: 'column' }}>
              <img 
                src={selectedStory.items[0].mediaUrl} 
                alt="Story" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
              />

              {/* Floating Story Reaction Animation */}
              {storyReactionAnim && (
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '4.5rem',
                  animation: 'heartPop 1s ease forwards',
                  zIndex: 20,
                  filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))'
                }}>
                  {storyReactionAnim}
                </div>
              )}

              {/* Top Bar inside story */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                padding: '16px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={selectedStory.userAvatar} alt="" className="user-avatar-sm" />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>@{selectedStory.username}</span>
                  <span style={{ fontSize: '0.75rem', color: '#ccc' }}>{selectedStory.items[0].createdAt}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Share Story Button */}
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    title="Share story with friends"
                    style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%' }}
                  >
                    <Share2 size={18} color="#fff" />
                  </button>

                  <button onClick={() => setSelectedStory(null)}>
                    <X size={24} color="#fff" />
                  </button>
                </div>
              </div>

              {/* Bottom Caption, Reactions & Share Bar */}
              <div style={{
                marginTop: 'auto',
                position: 'relative',
                zIndex: 10,
                padding: '16px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 75%, transparent)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Story Caption with Emojis */}
                {selectedStory.items[0].caption && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(12px)',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '0.95rem',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    lineHeight: '1.4'
                  }}>
                    {selectedStory.items[0].caption}
                  </div>
                )}

                {/* Quick Emoji Reactions Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {QUICK_REACTION_EMOJIS.map(emoji => (
                    <span 
                      key={emoji}
                      style={{ fontSize: '1.3rem', cursor: 'pointer', transition: 'transform 0.15s' }}
                      className="action-icon-btn"
                      onClick={() => handleStoryReaction(emoji)}
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>

                {/* Reply Input Box & Share Icon */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder={`Reply to @${selectedStory.username}...`}
                    value={storyReplyText}
                    onChange={(e) => setStoryReplyText(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 'var(--radius-full)',
                      padding: '10px 16px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />

                  <button 
                    className="btn-primary" 
                    style={{ padding: '10px', borderRadius: '50%' }}
                    onClick={() => setIsShareModalOpen(true)}
                    title="Send story in DM"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {isAddStoryOpen && (
        <div className="modal-overlay" onClick={() => setIsAddStoryOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <span>Create Story with Emojis</span>
              <button onClick={() => setIsAddStoryOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handlePublishStory} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {storyImage ? (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '250px' }}>
                  <img src={storyImage} alt="Story Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    className="remove-media-btn"
                    onClick={() => setStoryImage('')}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '14px',
                  height: '170px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}>
                  <Image size={32} color="var(--ig-primary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Click to select photo for Story</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Story Caption & Emojis</label>
                  <button 
                    type="button" 
                    style={{ fontSize: '0.8rem', color: 'var(--ig-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile size={16} />
                    <span>{showEmojiPicker ? 'Hide Emojis' : 'Add Emojis'}</span>
                  </button>
                </div>

                <input 
                  type="text"
                  className="creator-input"
                  style={{ minHeight: 'auto', padding: '12px', fontSize: '0.95rem' }}
                  placeholder="Type your story caption (e.g. My Day ✨🔥)..."
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                />
              </div>

              {showEmojiPicker && (
                <div style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '10px',
                  textAlign: 'center'
                }}>
                  {EMOJI_PRESETS.map((emoji, idx) => (
                    <span 
                      key={idx}
                      style={{ fontSize: '1.4rem', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                      className="tool-btn"
                      onClick={() => handleAppendEmoji(emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={!storyImage}
                style={{ justifyContent: 'center', marginTop: '6px', padding: '10px' }}
              >
                <span>Share Story</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
