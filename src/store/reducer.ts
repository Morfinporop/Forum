import { ForumState, Action } from './types';
import { User, Category, Topic, Reply, News, Review, Application, Message, Notification, Report } from '../types';

export const initialState: ForumState = {
  users: [],
  categories: [],
  topics: [],
  replies: [],
  news: [],
  reviews: [],
  applications: [],
  messages: [],
  conversations: [],
  notifications: [],
  reports: [],
  currentUser: null
};

export function forumReducer(state: ForumState, action: Action): ForumState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u: User) => u.id === action.payload.id ? { ...u, ...action.payload.data } : u),
        currentUser: state.currentUser?.id === action.payload.id ? { ...state.currentUser, ...action.payload.data } : state.currentUser
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map((c: Category) => c.id === action.payload.id ? { ...c, ...action.payload.data } : c) };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter((c: Category) => c.id !== action.payload) };
    case 'ADD_TOPIC':
      return { ...state, topics: [...state.topics, action.payload] };
    case 'UPDATE_TOPIC':
      return { ...state, topics: state.topics.map((t: Topic) => t.id === action.payload.id ? { ...t, ...action.payload.data } : t) };
    case 'DELETE_TOPIC':
      return { ...state, topics: state.topics.filter((t: Topic) => t.id !== action.payload) };
    case 'ADD_REPLY':
      return { ...state, replies: [...state.replies, action.payload] };
    case 'UPDATE_REPLY':
      return { ...state, replies: state.replies.map((r: Reply) => r.id === action.payload.id ? { ...r, ...action.payload.data } : r) };
    case 'DELETE_REPLY':
      return { ...state, replies: state.replies.filter((r: Reply) => r.id !== action.payload) };
    case 'ADD_NEWS':
      return { ...state, news: [...state.news, action.payload] };
    case 'UPDATE_NEWS':
      return { ...state, news: state.news.map((n: News) => n.id === action.payload.id ? { ...n, ...action.payload.data } : n) };
    case 'DELETE_NEWS':
      return { ...state, news: state.news.filter((n: News) => n.id !== action.payload) };
    case 'ADD_REVIEW':
      return { ...state, reviews: [...state.reviews, action.payload] };
    case 'DELETE_REVIEW':
      return { ...state, reviews: state.reviews.filter((r: Review) => r.id !== action.payload) };
    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.payload] };
    case 'UPDATE_APPLICATION':
      return { ...state, applications: state.applications.map((a: Application) => a.id === action.payload.id ? { ...a, ...action.payload.data } : a) };
    case 'DELETE_APPLICATION':
      return { ...state, applications: state.applications.filter((a: Application) => a.id !== action.payload) };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return { ...state, messages: state.messages.map((m: Message) => m.id === action.payload.id ? { ...m, ...action.payload.data } : m) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'UPDATE_NOTIFICATION':
      return { ...state, notifications: state.notifications.map((n: Notification) => n.id === action.payload.id ? { ...n, ...action.payload.data } : n) };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map((n: Notification) => n.userId === action.payload ? { ...n, isRead: true } : n) };
    case 'ADD_REPORT':
      return { ...state, reports: [...state.reports, action.payload] };
    case 'UPDATE_REPORT':
      return { ...state, reports: state.reports.map((r: Report) => r.id === action.payload.id ? { ...r, ...action.payload.data } : r) };
    default:
      return state;
  }
}
