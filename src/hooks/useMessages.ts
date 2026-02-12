import { useForumContext } from '../store';
import { Message, Conversation } from '../types';

export function useMessages() {
  const { state, dispatch } = useForumContext();

  const sendMessage = (senderId: string, receiverId: string, content: string, images: string[] = []) => {
    const message: Message = {
      id: crypto.randomUUID(),
      senderId,
      receiverId,
      content,
      images,
      isRead: false,
      createdAt: Date.now()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const markMessageRead = (messageId: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, data: { isRead: true } } });
  };

  const getConversations = (userId: string): Conversation[] => {
    const userMessages = state.messages.filter(
      (m: Message) => m.senderId === userId || m.receiverId === userId
    );
    
    const convMap = new Map<string, Conversation>();
    
    userMessages.forEach((msg: Message) => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const existing = convMap.get(otherId);
      
      if (!existing || msg.createdAt > (existing.lastMessage?.createdAt || 0)) {
        convMap.set(otherId, {
          id: otherId,
          participants: [userId, otherId],
          lastMessage: msg,
          updatedAt: msg.createdAt
        });
      }
    });
    
    return Array.from(convMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  };

  const getMessagesWith = (userId: string, otherId: string): Message[] => {
    return state.messages
      .filter((m: Message) => 
        (m.senderId === userId && m.receiverId === otherId) ||
        (m.senderId === otherId && m.receiverId === userId)
      )
      .sort((a: Message, b: Message) => a.createdAt - b.createdAt);
  };

  const getUnreadCount = (userId: string): number => {
    return state.messages.filter((m: Message) => m.receiverId === userId && !m.isRead).length;
  };

  return {
    messages: state.messages,
    sendMessage,
    markMessageRead,
    getConversations,
    getMessagesWith,
    getUnreadCount
  };
}
