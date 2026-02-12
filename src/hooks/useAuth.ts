import { useForumContext } from '../store';
import { User } from '../types';

export function useAuth() {
  const { state, dispatch } = useForumContext();

  const register = (email: string, username: string, password: string): boolean => {
    if (state.users.some(u => u.email === email)) return false;
    const isOwner = email === 'energoferon41@gmail.com';
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      username,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      banner: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200',
      bio: '',
      role: isOwner ? 'owner' : 'user',
      rank: 'Новичок',
      posts: 0,
      reputation: 0,
      createdAt: Date.now(),
      lastSeen: Date.now(),
      isOnline: true,
      isBanned: false,
      isMuted: false,
      followers: [],
      following: [],
      bookmarks: [],
      blockedUsers: [],
      achievements: [],
      warnings: [],
      settings: { showOnline: true, allowMessages: true, allowMentions: true, emailNotifications: true }
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    dispatch({ type: 'SET_CURRENT_USER', payload: newUser });
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (!user) return false;
    if (user.isBanned) return false;
    dispatch({ type: 'UPDATE_USER', payload: { id: user.id, data: { isOnline: true, lastSeen: Date.now() } } });
    dispatch({ type: 'SET_CURRENT_USER', payload: { ...user, isOnline: true, lastSeen: Date.now() } });
    return true;
  };

  const logout = () => {
    if (state.currentUser) {
      dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, data: { isOnline: false, lastSeen: Date.now() } } });
    }
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const updateProfile = (data: Partial<User>) => {
    if (!state.currentUser) return;
    dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, data } });
  };

  const followUser = (userId: string) => {
    if (!state.currentUser || state.currentUser.id === userId) return;
    const isFollowing = state.currentUser.following.includes(userId);
    const newFollowing = isFollowing
      ? state.currentUser.following.filter(id => id !== userId)
      : [...state.currentUser.following, userId];
    dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, data: { following: newFollowing } } });
    const targetUser = state.users.find(u => u.id === userId);
    if (targetUser) {
      const newFollowers = isFollowing
        ? targetUser.followers.filter(id => id !== state.currentUser!.id)
        : [...targetUser.followers, state.currentUser.id];
      dispatch({ type: 'UPDATE_USER', payload: { id: userId, data: { followers: newFollowers } } });
    }
  };

  const blockUser = (userId: string) => {
    if (!state.currentUser || state.currentUser.id === userId) return;
    const isBlocked = state.currentUser.blockedUsers.includes(userId);
    const newBlocked = isBlocked
      ? state.currentUser.blockedUsers.filter(id => id !== userId)
      : [...state.currentUser.blockedUsers, userId];
    dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, data: { blockedUsers: newBlocked } } });
  };

  const bookmarkTopic = (topicId: string) => {
    if (!state.currentUser) return;
    const isBookmarked = state.currentUser.bookmarks.includes(topicId);
    const newBookmarks = isBookmarked
      ? state.currentUser.bookmarks.filter(id => id !== topicId)
      : [...state.currentUser.bookmarks, topicId];
    dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, data: { bookmarks: newBookmarks } } });
  };

  return { 
    currentUser: state.currentUser, 
    users: state.users, 
    register, 
    login, 
    logout, 
    updateProfile, 
    followUser, 
    blockUser, 
    bookmarkTopic 
  };
}
