import { useForumContext } from '../store';
import { Category, Topic, Reply, News, Review, User } from '../types';

export function useForum() {
  const { state, dispatch } = useForumContext();

  const createCategory = (name: string, description: string, icon: string, createdBy: string) => {
    const category: Category = {
      id: crypto.randomUUID(),
      name,
      description,
      icon,
      order: state.categories.length,
      createdBy,
      createdAt: Date.now(),
      isLocked: false
    };
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, data } });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  const createTopic = (categoryId: string, authorId: string, title: string, content: string, images: string[] = []) => {
    const topic: Topic = {
      id: crypto.randomUUID(),
      categoryId,
      authorId,
      title,
      content,
      images,
      isPinned: false,
      isLocked: false,
      views: 0,
      likes: [],
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    dispatch({ type: 'ADD_TOPIC', payload: topic });
    const author = state.users.find((u: User) => u.id === authorId);
    if (author) {
      dispatch({ type: 'UPDATE_USER', payload: { id: authorId, data: { posts: author.posts + 1 } } });
    }
    return topic.id;
  };

  const updateTopic = (id: string, data: Partial<Topic>) => {
    dispatch({ type: 'UPDATE_TOPIC', payload: { id, data: { ...data, updatedAt: Date.now() } } });
  };

  const deleteTopic = (id: string) => {
    dispatch({ type: 'DELETE_TOPIC', payload: id });
    state.replies.filter((r: Reply) => r.topicId === id).forEach((r: Reply) => {
      dispatch({ type: 'DELETE_REPLY', payload: r.id });
    });
  };

  const viewTopic = (id: string) => {
    const topic = state.topics.find((t: Topic) => t.id === id);
    if (topic) {
      dispatch({ type: 'UPDATE_TOPIC', payload: { id, data: { views: topic.views + 1 } } });
    }
  };

  const likeTopic = (topicId: string, userId: string) => {
    const topic = state.topics.find((t: Topic) => t.id === topicId);
    if (!topic) return;
    const isLiked = topic.likes.includes(userId);
    const newLikes = isLiked ? topic.likes.filter(id => id !== userId) : [...topic.likes, userId];
    dispatch({ type: 'UPDATE_TOPIC', payload: { id: topicId, data: { likes: newLikes } } });
    const author = state.users.find((u: User) => u.id === topic.authorId);
    if (author) {
      dispatch({ type: 'UPDATE_USER', payload: { id: author.id, data: { reputation: author.reputation + (isLiked ? -1 : 1) } } });
    }
  };

  const createReply = (topicId: string, authorId: string, content: string, images: string[] = [], replyTo?: string) => {
    const reply: Reply = {
      id: crypto.randomUUID(),
      topicId,
      authorId,
      content,
      images,
      likes: [],
      reactions: [],
      replyTo,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    dispatch({ type: 'ADD_REPLY', payload: reply });
    const author = state.users.find((u: User) => u.id === authorId);
    if (author) {
      dispatch({ type: 'UPDATE_USER', payload: { id: authorId, data: { posts: author.posts + 1 } } });
    }
  };

  const updateReply = (id: string, data: Partial<Reply>) => {
    dispatch({ type: 'UPDATE_REPLY', payload: { id, data: { ...data, updatedAt: Date.now() } } });
  };

  const deleteReply = (id: string) => {
    dispatch({ type: 'DELETE_REPLY', payload: id });
  };

  const likeReply = (replyId: string, userId: string) => {
    const reply = state.replies.find((r: Reply) => r.id === replyId);
    if (!reply) return;
    const isLiked = reply.likes.includes(userId);
    const newLikes = isLiked ? reply.likes.filter(id => id !== userId) : [...reply.likes, userId];
    dispatch({ type: 'UPDATE_REPLY', payload: { id: replyId, data: { likes: newLikes } } });
    const author = state.users.find((u: User) => u.id === reply.authorId);
    if (author) {
      dispatch({ type: 'UPDATE_USER', payload: { id: author.id, data: { reputation: author.reputation + (isLiked ? -1 : 1) } } });
    }
  };

  const createNews = (authorId: string, title: string, content: string, image: string, isRule: boolean, isPinned: boolean) => {
    const news: News = {
      id: crypto.randomUUID(),
      authorId,
      title,
      content,
      image,
      isRule,
      isPinned,
      views: 0,
      likes: [],
      createdAt: Date.now()
    };
    dispatch({ type: 'ADD_NEWS', payload: news });
  };

  const updateNews = (id: string, data: Partial<News>) => {
    dispatch({ type: 'UPDATE_NEWS', payload: { id, data } });
  };

  const deleteNews = (id: string) => {
    dispatch({ type: 'DELETE_NEWS', payload: id });
  };

  const likeNews = (newsId: string, userId: string) => {
    const news = state.news.find((n: News) => n.id === newsId);
    if (!news) return;
    const isLiked = news.likes.includes(userId);
    const newLikes = isLiked ? news.likes.filter(id => id !== userId) : [...news.likes, userId];
    dispatch({ type: 'UPDATE_NEWS', payload: { id: newsId, data: { likes: newLikes } } });
  };

  const createReview = (userId: string, authorId: string, rating: number, content: string) => {
    const review: Review = {
      id: crypto.randomUUID(),
      userId,
      authorId,
      rating,
      content,
      createdAt: Date.now()
    };
    dispatch({ type: 'ADD_REVIEW', payload: review });
  };

  const deleteReview = (id: string) => {
    dispatch({ type: 'DELETE_REVIEW', payload: id });
  };

  return {
    categories: state.categories,
    topics: state.topics,
    replies: state.replies,
    news: state.news,
    reviews: state.reviews,
    createCategory,
    updateCategory,
    deleteCategory,
    createTopic,
    updateTopic,
    deleteTopic,
    viewTopic,
    likeTopic,
    createReply,
    updateReply,
    deleteReply,
    likeReply,
    createNews,
    updateNews,
    deleteNews,
    likeNews,
    createReview,
    deleteReview
  };
}
