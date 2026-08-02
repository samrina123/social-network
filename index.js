import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { User, Post, Story, Notification, FriendRequest, Message } from './models.js';
import {
  INITIAL_USERS,
  INITIAL_STORIES,
  INITIAL_POSTS,
  INITIAL_FRIEND_REQUESTS,
  INITIAL_NOTIFICATIONS
} from './mockData.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let isMongoConnected = false;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instapulse';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 3000
}).then(async () => {
  console.log('🍃 MongoDB Connected successfully to Instapulse Database!');
  isMongoConnected = true;
  await seedDatabase();
}).catch(err => {
  console.warn('⚠️ MongoDB connection warning (Using hybrid memory store):', err.message);
  isMongoConnected = false;
});

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial database records...');
      await User.insertMany(INITIAL_USERS);
      await Post.insertMany(INITIAL_POSTS);
      await Story.insertMany(INITIAL_STORIES);
      await FriendRequest.insertMany(INITIAL_FRIEND_REQUESTS);
      await Notification.insertMany(INITIAL_NOTIFICATIONS);
      console.log('✅ Database seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding DB:', err);
  }
}

let memUsers = [...INITIAL_USERS];
let memPosts = [...INITIAL_POSTS];
let memStories = [...INITIAL_STORIES];
let memFriendRequests = [...INITIAL_FRIEND_REQUESTS];
let memNotifications = [...INITIAL_NOTIFICATIONS];
let memMessages = [];

const connectedUsers = new Map();

const sendNotificationToUser = async (targetUserId, notificationObj) => {
  if (isMongoConnected) {
    await Notification.create(notificationObj);
  } else {
    memNotifications.unshift(notificationObj);
  }
  const targetSocketId = connectedUsers.get(targetUserId);
  if (targetSocketId) {
    io.to(targetSocketId).emit('notification:new', notificationObj);
  }
};

// --- REST API ENDPOINTS ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongo: isMongoConnected, time: new Date() });
});

// Pure Real Database Search Endpoint
app.get('/api/search', async (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) return res.json({ users: [], posts: [] });

  const regex = new RegExp(query.trim(), 'i');

  let matchedUsers = [];
  let matchedPosts = [];

  if (isMongoConnected) {
    try {
      matchedUsers = await User.find({
        $or: [{ name: regex }, { username: regex }, { id: regex }]
      }).limit(15);

      matchedPosts = await Post.find({
        $or: [{ caption: regex }, { location: regex }, { authorName: regex }, { authorUsername: regex }]
      }).limit(15);
    } catch (e) {
      console.error(e);
    }
  } else {
    matchedUsers = memUsers.filter(u => regex.test(u.name) || regex.test(u.username) || regex.test(u.id));
    matchedPosts = memPosts.filter(p => regex.test(p.caption || '') || regex.test(p.authorName) || regex.test(p.authorUsername));
  }

  res.json({ users: matchedUsers, posts: matchedPosts });
});

// Register Real User Endpoint
app.post('/api/users/register', async (req, res) => {
  const { name, username, avatar, bio, website } = req.body;
  if (!name || !username) return res.status(400).json({ error: 'Name and username are required' });

  const cleanUsername = username.toLowerCase().replace(/\s+/g, '_');

  let existing;
  if (isMongoConnected) {
    existing = await User.findOne({ username: cleanUsername });
  } else {
    existing = memUsers.find(u => u.username === cleanUsername);
  }

  if (existing) {
    return res.status(400).json({ error: `Username @${cleanUsername} is already registered!` });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    username: cleanUsername,
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    bio: bio || '✨ Real registered user on InstaPulse.',
    website: website || '',
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    isOnline: true,
    privacy: { isPrivateProfile: false, showOnlineStatus: true, allowTagging: 'everyone' }
  };

  if (isMongoConnected) {
    await User.create(newUser);
  } else {
    memUsers.push(newUser);
  }

  const allUsers = isMongoConnected ? await User.find() : memUsers;
  io.emit('users:status', allUsers);
  res.status(201).json(newUser);
});

// Get Users
app.get('/api/users', async (req, res) => {
  if (isMongoConnected) {
    return res.json(await User.find());
  }
  res.json(memUsers);
});

// Get Posts
app.get('/api/posts', async (req, res) => {
  if (isMongoConnected) {
    return res.json(await Post.find().sort({ createdAt: -1 }));
  }
  res.json(memPosts);
});

// Create Post REST
app.post('/api/posts', async (req, res) => {
  const newPost = {
    id: `post_${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: [],
    reactions: {},
    comments: [],
    isSaved: false,
    ...req.body
  };

  if (isMongoConnected) {
    await Post.create(newPost);
  } else {
    memPosts.unshift(newPost);
  }

  io.emit('post:created', newPost);
  res.status(201).json(newPost);
});

// --- WEBSOCKETS REAL-TIME ENGINE ---

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on('user:connect', async (userId) => {
    connectedUsers.set(userId, socket.id);
    if (isMongoConnected) {
      await User.updateOne({ id: userId }, { isOnline: true });
      io.emit('users:status', await User.find());
    } else {
      memUsers = memUsers.map(u => u.id === userId ? { ...u, isOnline: true } : u);
      io.emit('users:status', memUsers);
    }
  });

  socket.on('post:create', async (postData) => {
    const newPost = {
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: [],
      reactions: {},
      comments: [],
      isSaved: false,
      ...postData
    };

    if (isMongoConnected) {
      await Post.create(newPost);
      await User.updateOne({ id: postData.authorId }, { $inc: { postsCount: 1 } });
    } else {
      memPosts.unshift(newPost);
    }

    io.emit('post:created', newPost);
  });

  // Story Creation Event Listener
  socket.on('story:create', async (storyData) => {
    const newItem = {
      id: `s_item_${Date.now()}`,
      mediaUrl: storyData.mediaUrl,
      caption: storyData.caption || '',
      createdAt: 'Just now'
    };

    const newStory = {
      id: `story_${Date.now()}`,
      userId: storyData.userId,
      username: storyData.username,
      userAvatar: storyData.userAvatar,
      hasUnseen: true,
      items: [newItem]
    };

    if (isMongoConnected) {
      await Story.create(newStory);
      io.emit('story:created', newStory);
    } else {
      memStories.unshift(newStory);
      io.emit('story:created', newStory);
    }
  });

  socket.on('post:like', async ({ postId, userId, reaction = '❤️' }) => {
    let post, user;
    if (isMongoConnected) {
      post = await Post.findOne({ id: postId });
      user = await User.findOne({ id: userId });
    } else {
      post = memPosts.find(p => p.id === postId);
      user = memUsers.find(u => u.id === userId);
    }

    if (!post) return;

    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
      if (post.authorId !== userId && user) {
        const notif = {
          id: `notif_${Date.now()}`,
          userId: post.authorId,
          senderId: userId,
          senderName: user.name,
          senderAvatar: user.avatar,
          type: 'like',
          text: `liked your post`,
          targetPostId: postId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        sendNotificationToUser(post.authorId, notif);
      }
    }

    if (isMongoConnected) {
      await Post.updateOne({ id: postId }, { likes: post.likes });
    }

    io.emit('post:updated', post);
  });

  socket.on('comment:add', async ({ postId, userId, text, userName, userAvatar }) => {
    let post, user;
    if (isMongoConnected) {
      post = await Post.findOne({ id: postId });
      user = await User.findOne({ id: userId });
    } else {
      post = memPosts.find(p => p.id === postId);
      user = memUsers.find(u => u.id === userId);
    }

    if (!post || !text.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      userId,
      userName: user ? user.name : (userName || 'User'),
      userAvatar: user ? user.avatar : (userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'),
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);

    if (post.authorId !== userId) {
      const notif = {
        id: `notif_${Date.now()}`,
        userId: post.authorId,
        senderId: userId,
        senderName: newComment.userName,
        senderAvatar: newComment.userAvatar,
        type: 'comment',
        text: `commented: "${text.trim().substring(0, 30)}"`,
        targetPostId: postId,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      sendNotificationToUser(post.authorId, notif);
    }

    if (isMongoConnected) {
      await Post.updateOne({ id: postId }, { comments: post.comments });
    }

    io.emit('post:updated', post);
  });

  // Chat Message Send Event
  socket.on('chat:send', async ({ fromUserId, toUserId, text }) => {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fromUserId,
      toUserId,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      await Message.create(newMsg);
    } else {
      memMessages.push(newMsg);
    }

    const targetSocketId = connectedUsers.get(toUserId);
    if (targetSocketId && targetSocketId !== socket.id) {
      io.to(targetSocketId).emit('chat:message', newMsg);
    }
    socket.emit('chat:message', newMsg);
  });

  // Chat Message Delete Event
  socket.on('chat:delete', async ({ messageId, userId, deleteForEveryone = false }) => {
    if (isMongoConnected) {
      if (deleteForEveryone) {
        await Message.deleteOne({ id: messageId });
      }
    } else {
      if (deleteForEveryone) {
        memMessages = memMessages.filter(m => m.id !== messageId);
      }
    }
    io.emit('chat:message_deleted', { messageId, deleteForEveryone, deletedBy: userId });
  });

  socket.on('user:update_profile', async ({ userId, profileData }) => {
    if (isMongoConnected) {
      await User.updateOne({ id: userId }, profileData);
      await Post.updateMany({ authorId: userId }, {
        authorName: profileData.name,
        authorAvatar: profileData.avatar
      });
      io.emit('users:status', await User.find());
      io.emit('posts:all', await Post.find().sort({ createdAt: -1 }));
    } else {
      memUsers = memUsers.map(u => u.id === userId ? { ...u, ...profileData } : u);
      memPosts = memPosts.map(p => p.authorId === userId ? {
        ...p,
        authorName: profileData.name || p.authorName,
        authorAvatar: profileData.avatar || p.authorAvatar
      } : p);
      io.emit('users:status', memUsers);
      io.emit('posts:all', memPosts);
    }
  });

  socket.on('friend:request', async ({ fromUserId, toUserId }) => {
    let sender;
    if (isMongoConnected) {
      sender = await User.findOne({ id: fromUserId });
    } else {
      sender = memUsers.find(u => u.id === fromUserId);
    }
    if (!sender) return;

    const newReq = {
      id: `req_${Date.now()}`,
      fromUserId,
      fromUserName: sender.name,
      fromUserUsername: sender.username,
      fromUserAvatar: sender.avatar,
      toUserId,
      status: 'pending'
    };

    if (isMongoConnected) {
      await FriendRequest.create(newReq);
    } else {
      memFriendRequests.push(newReq);
    }

    const targetSocketId = connectedUsers.get(toUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('friend:request_received', newReq);
    }
  });

  socket.on('disconnect', async () => {
    for (const [uId, sId] of connectedUsers.entries()) {
      if (sId === socket.id) {
        connectedUsers.delete(uId);
        if (isMongoConnected) {
          await User.updateOne({ id: uId }, { isOnline: false });
          io.emit('users:status', await User.find());
        } else {
          memUsers = memUsers.map(u => u.id === uId ? { ...u, isOnline: false } : u);
          io.emit('users:status', memUsers);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

// Only listen on port if not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 InstaPulse Server listening on 0.0.0.0:${PORT}`);
  });
}

export default app;
