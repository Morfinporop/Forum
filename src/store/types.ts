import { User, Category, Topic, Reply, News, Review, Application, Message, Conversation, Notification, Report } from '../types';

export interface ForumState {
  users: User[];
  categories: Category[];
  topics: Topic[];
  replies: Reply[];
  news: News[];
  reviews: Review[];
  applications: Application[];
  messages: Message[];
  conversations: Conversation[];
  notifications: Notification[];
  reports: Report[];
  currentUser: User | null;
}

export type Action =
  | { type: 'SET_STATE'; payload: Partial<ForumState> }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; data: Partial<User> } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; data: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TOPIC'; payload: Topic }
  | { type: 'UPDATE_TOPIC'; payload: { id: string; data: Partial<Topic> } }
  | { type: 'DELETE_TOPIC'; payload: string }
  | { type: 'ADD_REPLY'; payload: Reply }
  | { type: 'UPDATE_REPLY'; payload: { id: string; data: Partial<Reply> } }
  | { type: 'DELETE_REPLY'; payload: string }
  | { type: 'ADD_NEWS'; payload: News }
  | { type: 'UPDATE_NEWS'; payload: { id: string; data: Partial<News> } }
  | { type: 'DELETE_NEWS'; payload: string }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'DELETE_REVIEW'; payload: string }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'UPDATE_APPLICATION'; payload: { id: string; data: Partial<Application> } }
  | { type: 'DELETE_APPLICATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; data: Partial<Message> } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; data: Partial<Notification> } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ'; payload: string }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'UPDATE_REPORT'; payload: { id: string; data: Partial<Report> } };
