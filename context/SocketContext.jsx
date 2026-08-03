import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from '../utils/apiConfig';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Restore persisted posts from localStorage so refresh NEVER wipes user posts & comments!
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_posts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Restore persisted stories from localStorage
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_stories');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Restore persisted chat messages from localStorage per account
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save posts, stories, and chat messages to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem('instapulse_posts', JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('instapulse_stories', JSON.stringify(stories));
    } catch (e) {}
  }, [stories]);

  useEffect(() => {
    try {
      localStorage.setItem('instapulse_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  // Initialize Socket.io Connection dynamically with getApiBaseUrl()
  useEffect(() => {
    const serverUrl = getApiBaseUrl();

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to backend:', serverUrl);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Fetch initial posts from server and merge with local storage
    fetch(`${serverUrl}/api/posts`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(fetchedPosts => {
        if (Array.isArray(fetchedPosts) && fetchedPosts.length > 0) {
          setPosts(prev => {
            const merged = [...fetchedPosts];
            prev.forEach(p => {
              if (!merged.some(m => m.id === p.id)) {
                merged.unshift(p);
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});

    return () => newSocket.close();
  }, []);

  // Register current user on socket
  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('user:connect', currentUser.id);
    }
  }, [socket, currentUser]);

  // Listen to Socket Events & Deduplicate State
  useEffect(() => {
    if (!socket) return;

    socket.on('post:created', (newPost) => {
      setPosts(prev => [newPost, ...prev.filter(p => p.id !== newPost.id)]);
    });

    socket.on('post:updated', (updatedPost) => {
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    });

    socket.on('posts:all', (allPosts) => {
      setPosts(allPosts);
    });

    socket.on('story:created', (newStory) => {
      setStories(prev => [newStory, ...prev.filter(s => s.id !== newStory.id)]);
    });

    socket.on('story:updated', (updatedStories) => {
      setStories(updatedStories);
    });

    socket.on('notification:new', (notif) => {
      setNotifications(prev => [notif, ...prev.filter(n => n.id !== notif.id)]);
      addToast(notif);
    });

    // Deduplicate chat messages by ID to prevent double delivery!
    socket.on('chat:message', (msg) => {
      setChatMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    socket.on('chat:message_deleted', ({ messageId }) => {
      setChatMessages(prev => prev.filter(m => m.id !== messageId));
    });

    socket.on('friend:request_received', (req) => {
      setFriendRequests(prev => [...prev.filter(r => r.id !== req.id), req]);
    });

    socket.on('friend:request_updated', (updatedReq) => {
      setFriendRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
    });

    return () => {
      socket.off('post:created');
      socket.off('post:updated');
      socket.off('posts:all');
      socket.off('story:created');
      socket.off('story:updated');
      socket.off('notification:new');
      socket.off('chat:message');
      socket.off('chat:message_deleted');
      socket.off('friend:request_received');
      socket.off('friend:request_updated');
    };
  }, [socket]);

  // Toast Helper
  const addToast = (notif) => {
    const toastId = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { id: toastId, ...notif };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4500);
  };

  // Socket Actions Emitters
  const createPost = (postData) => {
    if (!currentUser) return;
    const postPayload = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
      likes: [],
      reactions: {},
      comments: [],
      isSaved: false,
      ...postData
    };

    // 1. Instantly update local React state and save to LocalStorage
    setPosts(prev => [postPayload, ...prev]);

    // 2. Emit to backend socket
    if (socket && isConnected) {
      socket.emit('post:create', postPayload);
    }
  };

  // 100% Guaranteed Instant Optimistic Story Creation
  const createStory = (storyData) => {
    if (!currentUser) return;

    const newItem = {
      id: `s_item_${Date.now()}`,
      mediaUrl: storyData.mediaUrl,
      caption: storyData.caption || '',
      createdAt: 'Just now'
    };

    const newStory = {
      id: `story_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      hasUnseen: true,
      items: [newItem]
    };

    // 1. Instantly update local React state and save to LocalStorage
    setStories(prev => {
      const userStory = prev.find(s => s.userId === currentUser.id);
      if (userStory) {
        return prev.map(s => s.userId === currentUser.id ? { ...s, items: [newItem, ...s.items], hasUnseen: true } : s);
      } else {
        return [newStory, ...prev];
      }
    });

    // 2. Emit to backend socket
    if (socket && isConnected) {
      socket.emit('story:create', {
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        mediaUrl: storyData.mediaUrl,
        caption: storyData.caption
      });
    }
  };

  const toggleLikePost = (postId, reaction = '❤️') => {
    if (!currentUser) return;
    // Optimistic UI Update
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const hasLiked = post.likes.includes(currentUser.id);
      const updatedLikes = hasLiked
        ? post.likes.filter(id => id !== currentUser.id)
        : [...post.likes, currentUser.id];
      return { ...post, likes: updatedLikes };
    }));

    if (socket && isConnected) {
      socket.emit('post:like', { postId, userId: currentUser.id, reaction });
    }
  };

  // 100% Reliable Optimistic Comment Addition
  const addComment = (postId, text) => {
    if (!text || !text.trim()) return;

    const newComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'User',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    // 1. Instantly update local React state so comment appears in modal & feed without waiting!
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      return { 
        ...post, 
        comments: [...post.comments, newComment] 
      };
    }));

    // 2. Emit to backend socket to sync across all connected clients
    if (socket && isConnected) {
      socket.emit('comment:add', { 
        postId, 
        userId: currentUser?.id, 
        text: text.trim(),
        userName: currentUser?.name,
        userAvatar: currentUser?.avatar
      });
    }
  };

  const sendChatMessage = (toUserId, text) => {
    if (!currentUser) return;
    if (socket && isConnected) {
      socket.emit('chat:send', { fromUserId: currentUser.id, toUserId, text });
    } else {
      const newMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fromUserId: currentUser.id,
        toUserId,
        text: text.trim(),
        createdAt: new Date().toISOString()
      };
      setChatMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg]);
    }
  };

  // Delete Chat Message
  const deleteChatMessage = (messageId, deleteForEveryone = false) => {
    if (socket && isConnected) {
      socket.emit('chat:delete', { messageId, userId: currentUser?.id, deleteForEveryone });
    }
    setChatMessages(prev => prev.filter(m => m.id !== messageId));
  };

  // Forward Chat Message to Another Contact
  const forwardChatMessage = (messageText, targetUserId) => {
    sendChatMessage(targetUserId, messageText);
  };

  const updateProfileOnServer = (profileData) => {
    if (!currentUser) return;
    if (socket && isConnected) {
      socket.emit('user:update_profile', { userId: currentUser.id, profileData });
    }
  };

  const sendFriendRequest = (toUserId) => {
    if (!currentUser) return;
    if (socket && isConnected) {
      socket.emit('friend:request', { fromUserId: currentUser.id, toUserId });
    }
  };

  const respondFriendRequest = (requestId, action) => {
    if (socket && isConnected) {
      socket.emit('friend:respond', { requestId, action });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      posts,
      stories,
      notifications,
      friendRequests,
      toasts,
      chatMessages,
      createPost,
      createStory,
      toggleLikePost,
      addComment,
      sendChatMessage,
      deleteChatMessage,
      forwardChatMessage,
      updateProfileOnServer,
      sendFriendRequest,
      respondFriendRequest
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
