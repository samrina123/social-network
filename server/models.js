import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
  cover: { type: String, default: '' },
  bio: { type: String, default: '' },
  website: { type: String, default: '' },
  postsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  privacy: {
    isPrivateProfile: { type: Boolean, default: false },
    showOnlineStatus: { type: Boolean, default: true },
    allowTagging: { type: String, default: 'everyone' }
  }
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorUsername: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  caption: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, default: 'image' },
  location: { type: String, default: '' },
  privacy: { type: String, default: 'public' },
  likes: [{ type: String }],
  reactions: { type: Map, of: [String], default: {} },
  comments: [{
    id: String,
    userId: String,
    userName: String,
    userAvatar: String,
    text: String,
    createdAt: String
  }],
  isSaved: { type: Boolean, default: false }
}, { timestamps: true });

const StorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  userAvatar: { type: String, default: '' },
  hasUnseen: { type: Boolean, default: true },
  items: [{
    id: String,
    mediaUrl: String,
    caption: String,
    createdAt: String
  }]
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String, default: '' },
  type: { type: String, required: true },
  text: { type: String, required: true },
  targetPostId: { type: String, default: '' },
  requestId: { type: String, default: '' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const FriendRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  fromUserName: { type: String, required: true },
  fromUserUsername: { type: String, required: true },
  fromUserAvatar: { type: String, default: '' },
  toUserId: { type: String, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Post = mongoose.model('Post', PostSchema);
export const Story = mongoose.model('Story', StorySchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);
export const Message = mongoose.model('Message', MessageSchema);
