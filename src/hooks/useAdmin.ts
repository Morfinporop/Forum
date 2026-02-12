import { useForumContext } from '../store';
import { User, Warning, Notification } from '../types';

export function useAdmin() {
  const { state, dispatch } = useForumContext();

  const updateUser = (userId: string, data: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, data } });
  };

  const banUser = (userId: string, reason: string) => {
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, data: { isBanned: true, banReason: reason } } });
    addNotification(userId, 'warning', 'Вы заблокированы', `Причина: ${reason}`);
  };

  const unbanUser = (userId: string) => {
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, data: { isBanned: false, banReason: undefined } } });
  };

  const muteUser = (userId: string, duration: number) => {
    const muteUntil = Date.now() + duration * 60 * 1000;
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, data: { isMuted: true, muteUntil } } });
  };

  const unmuteUser = (userId: string) => {
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, data: { isMuted: false, muteUntil: undefined } } });
  };

  const warnUser = (userId: string, reason: string, issuedBy: string) => {
    const user = state.users.find((u: User) => u.id === userId);
    if (!user) return;
    const warning: Warning = {
      id: crypto.randomUUID(),
      reason,
      issuedBy,
      createdAt: Date.now()
    };
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, data: { warnings: [...user.warnings, warning] } } });
    addNotification(userId, 'warning', 'Предупреждение', reason);
  };

  const changeUserRole = (userId: string, role: User['role']) => {
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, data: { role } } });
  };

  const addNotification = (userId: string, type: Notification['type'], title: string, content: string, link?: string) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      content,
      link,
      isRead: false,
      createdAt: Date.now()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markNotificationRead = (notificationId: string) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id: notificationId, data: { isRead: true } } });
  };

  const markAllNotificationsRead = (userId: string) => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: userId });
  };

  return {
    users: state.users,
    notifications: state.notifications,
    reports: state.reports,
    updateUser,
    banUser,
    unbanUser,
    muteUser,
    unmuteUser,
    warnUser,
    changeUserRole,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead
  };
}
