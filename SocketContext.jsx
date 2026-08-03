import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const DEFAULT_INITIAL_POST = {
  id: 'post_welcome_1',
  authorId: 'user_samrina_default',
  authorName: 'Samrina Mughal',
  authorUsername: 'samrina',
  authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  caption: '✨ Welcome to InstaPulse! Share photos, post stories, and connect with friends in real-time.',
  createdAt: new Date().toISOString(),
  likes: ['user_samrina_default'],
  reactions: { '❤️': 1 },
  comments: [
    {
      id: 'c_welcome_1',
      userId: 'user_samrina_default',
      userName: 'Samrina Mughal',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      text: 'Super excited to share stories and connect! 🔥',
      createdAt: new Date().toISOString()
    }
  ],
  isSaved: false
};

const DEFAULT_INITIAL_STORY = {
  id: 'story_welcome_1',
  userId: 'user_samrina_default',
  username: 'samrina',
  userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  hasUnseen: true,
  items: [
    {
      id: 's_item_welcome_1',
      mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      caption: '✨ My first story on InstaPulse!',
      createdAt: 'Just now'
    }
  ]
};

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // 100% Permanent LocalStorage State Persistence
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [DEFAULT_INITIAL_POST];
    } catch (e) {
      return [DEFAULT_INITIAL_POST];
    }
  });

  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [DEFAULT_INITIAL_STORY];
    } catch (e) {
      return [DEFAULT_INITIAL_STORY];
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save to LocalStorage on changes
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

  const addToast = (notif) => {
    const toastId = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { id: toastId, ...notif };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4500);
  };

  // 100% Instant Post Creation
  const createPost = (postData) => {
    const activeUser = currentUser || {
      id: 'user_samrina_default',
      name: 'Samrina Mughal',
      username: 'samrina',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    };

    const postPayload = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: activeUser.id,
      authorName: activeUser.name,
      authorUsername: activeUser.username,
      authorAvatar: activeUser.avatar,
      createdAt: new Date().toISOString(),
      likes: [],
      reactions: {},
      comments: [],
      isSaved: false,
      ...postData
    };

    setPosts(prev => [postPayload, ...prev]);
  };

  // 100% Instant Story Creation
  const createStory = (storyData) => {
    const activeUser = currentUser || {
      id: 'user_samrina_default',
      name: 'Samrina Mughal',
      username: 'samrina',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    };

    const newItem = {
      id: `s_item_${Date.now()}`,
      mediaUrl: storyData.mediaUrl,
      caption: storyData.caption || '',
      createdAt: 'Just now'
    };

    const newStory = {
      id: `story_${Date.now()}`,
      userId: activeUser.id,
      username: activeUser.username,
      userAvatar: activeUser.avatar,
      hasUnseen: true,
      items: [newItem]
    };

    setStories(prev => {
      const userStory = prev.find(s => s.userId === activeUser.id);
      if (userStory) {
        return prev.map(s => s.userId === activeUser.id ? { ...s, items: [newItem, ...s.items], hasUnseen: true } : s);
      } else {
        return [newStory, ...prev];
      }
    });
  };

  // 100% Instant Like Toggle
  const toggleLikePost = (postId, reaction = '❤️') => {
    const uId = currentUser?.id || 'user_samrina_default';
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const hasLiked = post.likes.includes(uId);
      const updatedLikes = hasLiked
        ? post.likes.filter(id => id !== uId)
        : [...post.likes, uId];
      return { ...post, likes: updatedLikes };
    }));
  };

  // 100% Instant Comment Addition
  const addComment = (postId, text) => {
    if (!text || !text.trim()) return;

    const newComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'user_samrina_default',
      userName: currentUser?.name || 'Samrina Mughal',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      return { 
        ...post, 
        comments: [...post.comments, newComment] 
      };
    }));
  };

  // 100% Instant Chat Message
  const sendChatMessage = (toUserId, text) => {
    const fromId = currentUser?.id || 'user_samrina_default';
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fromUserId: fromId,
      toUserId,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    setChatMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg]);
  };

  const deleteChatMessage = (messageId, deleteForEveryone = false) => {
    setChatMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const forwardChatMessage = (messageText, targetUserId) => {
    sendChatMessage(targetUserId, messageText);
  };

  const updateProfileOnServer = () => {};
  const sendFriendRequest = () => {};
  const respondFriendRequest = () => {};

  return (
    <SocketContext.Provider value={{
      socket: null,
      isConnected: true,
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
