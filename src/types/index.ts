export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  avatar: string;
  banner: string;
  bio: string;
  role: 'user' | 'moderator' | 'admin' | 'owner';
  rank: string;
  posts: number;
  reputation: number;
  createdAt: number;
  lastSeen: number;
  isOnline: boolean;
  isBanned: boolean;
  banReason?: string;
  isMuted: boolean;
  muteUntil?: number;
  followers: string[];
  following: string[];
  bookmarks: string[];
  blockedUsers: string[];
  achievements: Achievement[];
  warnings: Warning[];
  settings: UserSettings;
}

export interface UserSettings {
  showOnline: boolean;
  allowMessages: boolean;
  allowMentions: boolean;
  emailNotifications: boolean;
}

export interface Warning {
  id: string;
  reason: string;
  issuedBy: string;
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  createdBy: string;
  createdAt: number;
  isLocked: boolean;
}

export interface Topic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  likes: string[];
  tags: string[];
  images: string[];
}

export interface Reply {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  createdAt: number;
  updatedAt: number;
  likes: string[];
  images: string[];
  replyTo?: string;
  reactions: Reaction[];
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Review {
  id: string;
  userId: string;
  authorId: string;
  rating: number;
  content: string;
  createdAt: number;
}

export interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  authorId: string;
  createdAt: number;
  isPinned: boolean;
  isRule: boolean;
  views: number;
  likes: string[];
}

export interface Application {
  id: string;
  type: 'admin' | 'moderator' | 'complaint' | 'appeal' | 'suggestion' | 'partnership' | 'bug' | 'other';
  title: string;
  content: string;
  media: MediaFile[];
  authorId: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'closed';
  createdAt: number;
  updatedAt: number;
  closedAt?: number;
  responses: ApplicationResponse[];
}

export interface ApplicationResponse {
  id: string;
  authorId: string;
  content: string;
  createdAt: number;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  images: string[];
  createdAt: number;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'reply' | 'mention' | 'follow' | 'message' | 'warning' | 'achievement' | 'application';
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: number;
}

export interface Report {
  id: string;
  type: 'topic' | 'reply' | 'user';
  targetId: string;
  reason: string;
  reporterId: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface ForumStats {
  totalUsers: number;
  totalTopics: number;
  totalReplies: number;
  totalApplications: number;
  onlineUsers: number;
}
