import React, { useState } from 'react';
import { Send, MessageSquare, ShieldCheck, Lock, Trash2, Share2, CornerUpRight, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { encryptE2EE, decryptE2EE } from '../utils/crypto';

export const MessagesDrawer = () => {
  const { currentUser, users } = useAuth();
  const { chatMessages, sendChatMessage, deleteChatMessage, forwardChatMessage } = useSocket();

  const friends = users.filter(u => u.id !== currentUser.id);
  const [selectedFriend, setSelectedFriend] = useState(friends[0] || null);
  const [messageInput, setMessageInput] = useState('');

  // Modals for Delete & Forward
  const [targetDeleteMsg, setTargetDeleteMsg] = useState(null);
  const [targetForwardMsg, setTargetForwardMsg] = useState(null);

  // Active messages isolated for current user & selected contact
  const activeMessages = chatMessages.filter(m => 
    (m.fromUserId === currentUser.id && m.toUserId === selectedFriend?.id) ||
    (m.fromUserId === selectedFriend?.id && m.toUserId === currentUser.id)
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedFriend) return;

    // Encrypt message using End-to-End Encryption (E2EE)
    const encryptedMsgText = encryptE2EE(messageInput.trim());

    sendChatMessage(selectedFriend.id, encryptedMsgText);
    setMessageInput('');
  };

  const handleConfirmDelete = (deleteForEveryone = false) => {
    if (targetDeleteMsg) {
      deleteChatMessage(targetDeleteMsg.id, deleteForEveryone);
      setTargetDeleteMsg(null);
    }
  };

  const handleConfirmForward = (targetUserId) => {
    if (targetForwardMsg) {
      forwardChatMessage(targetForwardMsg.text, targetUserId);
      alert('Message forwarded successfully!');
      setTargetForwardMsg(null);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '840px',
      height: '620px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      overflow: 'hidden'
    }}>
      {/* Left Contacts List */}
      <div style={{ borderRight: '1px solid var(--border-color)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Direct Messages</h3>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Lock size={12} /> E2EE Encrypted & Saved
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {friends.map(friend => (
            <div 
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: selectedFriend?.id === friend.id ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
                border: selectedFriend?.id === friend.id ? '1px solid var(--ig-primary)' : '1px solid transparent'
              }}
            >
              <div style={{ position: 'relative' }}>
                <img src={friend.avatar} alt="" className="user-avatar-sm" />
                <span className={`status-dot ${friend.isOnline ? '' : 'offline'}`} style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--bg-surface)' }} />
              </div>
              <div className="user-info-sm">
                <span className="user-name-sm">{friend.name}</span>
                <span className="user-handle-sm">@{friend.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Conversation Window */}
      {selectedFriend ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={selectedFriend.avatar} alt="" className="user-avatar-sm" />
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>{selectedFriend.name}</div>
                <div style={{ fontSize: '0.75rem', color: selectedFriend.isOnline ? '#10b981' : 'var(--text-muted)' }}>
                  {selectedFriend.isOnline ? 'Active Now' : 'Offline'}
                </div>
              </div>
            </div>

            {/* E2EE Security Badge */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#10b981',
              fontWeight: '700'
            }}>
              <ShieldCheck size={14} /> Encrypted Chat
            </div>
          </div>

          {/* E2EE Info Security Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '8px 16px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <Lock size={12} color="#10b981" />
            <span>Messages in this chat are saved in your account with 256-bit E2EE encryption.</span>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeMessages.map(msg => {
              const isMine = msg.fromUserId === currentUser.id;
              const decryptedText = decryptE2EE(msg.text);

              return (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '72%',
                    position: 'relative'
                  }}
                  className="chat-bubble-group"
                >
                  <div style={{
                    background: isMine ? 'var(--ig-primary)' : 'var(--bg-card)',
                    color: isMine ? '#fff' : 'var(--text-primary)',
                    padding: '10px 16px',
                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: '0.88rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div>{decryptedText}</div>
                    
                    {/* Action Bar (Delete & Forward Icons) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.68rem',
                      opacity: 0.8,
                      marginTop: '4px',
                      paddingTop: '4px',
                      borderTop: isMine ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-color)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={10} /> Encrypted</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Forward Message Button */}
                        <button 
                          onClick={() => setTargetForwardMsg(msg)}
                          style={{ background: 'none', border: 'none', color: isMine ? '#fff' : 'var(--text-muted)', cursor: 'pointer' }}
                          title="Forward Message"
                        >
                          <CornerUpRight size={13} />
                        </button>

                        {/* Delete Message Button */}
                        <button 
                          onClick={() => setTargetDeleteMsg(msg)}
                          style={{ background: 'none', border: 'none', color: isMine ? '#fff' : 'var(--text-muted)', cursor: 'pointer' }}
                          title="Delete Message"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeMessages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Say hi to {selectedFriend.name.split(' ')[0]}! Send an Encrypted message below.
              </div>
            )}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSend} style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="creator-input"
              style={{ minHeight: 'auto', padding: '10px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
              placeholder={`Send encrypted message to ${selectedFriend.name.split(' ')[0]}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={!messageInput.trim()} style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)' }}>
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Select a friend to start an E2EE Encrypted conversation
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {targetDeleteMsg && (
        <div className="modal-overlay" onClick={() => setTargetDeleteMsg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>Delete Message?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to delete this message?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-primary" 
                style={{ background: 'var(--ig-danger)', justifyContent: 'center' }}
                onClick={() => handleConfirmDelete(true)}
              >
                Delete for Everyone
              </button>
              <button 
                className="btn-secondary-sm" 
                style={{ padding: '10px' }}
                onClick={() => handleConfirmDelete(false)}
              >
                Delete for Me
              </button>
              <button 
                className="btn-secondary-sm" 
                style={{ padding: '10px', opacity: 0.7 }}
                onClick={() => setTargetDeleteMsg(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {targetForwardMsg && (
        <div className="modal-overlay" onClick={() => setTargetForwardMsg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Forward Message To...</h3>
              <button onClick={() => setTargetForwardMsg(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
              "{decryptE2EE(targetForwardMsg.text)}"
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {friends.map(friend => (
                <div 
                  key={friend.id}
                  onClick={() => handleConfirmForward(friend.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={friend.avatar} alt="" className="user-avatar-sm" />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{friend.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{friend.username}</div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--ig-primary)', fontWeight: '700' }}>Send ↪️</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
