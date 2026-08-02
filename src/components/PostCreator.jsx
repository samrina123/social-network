import React, { useState } from 'react';
import { Image, MapPin, Globe, Lock, Users, X, Send, Sparkles, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const EMOJI_PRESETS = ['✨', '🔥', '❤️', '😍', '😎', '📸', '🌊', '🥳', '🎉', '💫', '🌟', '💖', '🚀', '☕', '😂', '💯', '🌸', '👏'];

const PRESET_SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&q=80&w=1000"
];

export const PostCreator = ({ onClose, isModal = false }) => {
  const { currentUser } = useAuth();
  const { createPost } = useSocket();

  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [showPresets, setShowPresets] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // File Upload / Base64 Conversion
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAppendEmoji = (emoji) => {
    setCaption(prev => prev + emoji);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim() && !mediaUrl) return;

    createPost({
      caption,
      mediaUrl: mediaUrl || PRESET_SAMPLE_PHOTOS[0],
      mediaType: 'image',
      location: location.trim() || 'Lahore, Pakistan',
      privacy
    });

    setCaption('');
    setMediaUrl('');
    setLocation('');
    setShowPresets(false);
    setShowEmojiPicker(false);
    if (onClose) onClose();
  };

  return (
    <div className={`post-creator-card ${isModal ? 'modal-content' : ''}`}>
      <div className="creator-top">
        <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-sm" />
        <textarea
          className="creator-input"
          placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}? Share photos & emojis... ✨`}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      {/* Attached Media Preview */}
      {mediaUrl && (
        <div className="media-preview-container">
          <img src={mediaUrl} alt="Post attachment preview" className="media-preview-img" />
          <button className="remove-media-btn" onClick={() => setMediaUrl('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Interactive Emoji Selector Grid */}
      {showEmojiPicker && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '8px',
          textAlign: 'center'
        }}>
          {EMOJI_PRESETS.map((emoji, idx) => (
            <span 
              key={idx}
              style={{ fontSize: '1.3rem', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'transform 0.15s' }}
              className="tool-btn"
              onClick={() => handleAppendEmoji(emoji)}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Quick Sample Presets Picker */}
      {showPresets && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Choose demo sample image:</span>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {PRESET_SAMPLE_PHOTOS.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Sample"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: mediaUrl === img ? '2px solid var(--ig-primary)' : '1px solid var(--border-color)',
                  transition: 'transform 0.2s'
                }}
                onClick={() => {
                  setMediaUrl(img);
                  setShowPresets(false);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Creator Toolbar & Privacy Controls */}
      <div className="creator-actions">
        <div className="action-tools">
          <label className="tool-btn" style={{ cursor: 'pointer' }}>
            <Image size={17} color="var(--ig-primary)" />
            <span>Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button className="tool-btn" type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile size={17} color="#fcb045" />
            <span>Emojis</span>
          </button>

          <button className="tool-btn" type="button" onClick={() => setShowPresets(!showPresets)}>
            <Sparkles size={17} color="#e6683c" />
            <span>Sample</span>
          </button>

          <select 
            className="privacy-select"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <option value="public">🌎 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="private">🔒 Only Me</option>
          </select>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleSubmit}
          disabled={!caption.trim() && !mediaUrl}
          style={{ padding: '9px 20px', borderRadius: 'var(--radius-full)' }}
        >
          <span>Share</span>
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
