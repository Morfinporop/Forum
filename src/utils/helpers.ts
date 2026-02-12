export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  if (diff < 60000) return 'Только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин. назад`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч. назад`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн. назад`;
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getRankByPosts(posts: number): { name: string; color: string } {
  if (posts >= 500) return { name: 'Легенда', color: '#ef4444' };
  if (posts >= 250) return { name: 'Мастер', color: '#f97316' };
  if (posts >= 100) return { name: 'Эксперт', color: '#a855f7' };
  if (posts >= 50) return { name: 'Активист', color: '#3b82f6' };
  if (posts >= 10) return { name: 'Участник', color: '#22c55e' };
  return { name: 'Новичок', color: '#6b7280' };
}

export function getRoleInfo(role: string): { name: string; color: string; icon: string } {
  switch (role) {
    case 'owner': return { name: 'Владелец', color: '#fbbf24', icon: 'mdi:crown' };
    case 'admin': return { name: 'Администратор', color: '#ec4899', icon: 'mdi:shield-account' };
    case 'moderator': return { name: 'Модератор', color: '#22c55e', icon: 'mdi:shield-check' };
    default: return { name: 'Пользователь', color: '#6b7280', icon: 'mdi:account' };
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return crypto.randomUUID();
}

export const APPLICATION_TYPES: Record<string, string> = {
  admin: 'Набор в администрацию',
  moderator: 'Набор в модераторы',
  complaint: 'Жалоба',
  appeal: 'Апелляция',
  suggestion: 'Предложение',
  partnership: 'Партнёрство',
  bug: 'Баг-репорт',
  other: 'Другое'
};

export const APPLICATION_STATUS: Record<string, { text: string; color: string }> = {
  pending: { text: 'Ожидает', color: '#fbbf24' },
  reviewing: { text: 'На рассмотрении', color: '#3b82f6' },
  approved: { text: 'Одобрено', color: '#22c55e' },
  rejected: { text: 'Отклонено', color: '#ef4444' },
  closed: { text: 'Закрыто', color: '#6b7280' }
};
