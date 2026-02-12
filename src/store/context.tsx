import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ForumState, Action } from './types';
import { forumReducer, initialState } from './reducer';
import { Application } from '../types';

const STORAGE_KEY = 'lostrp_forum_data';

interface ForumContextType {
  state: ForumState;
  dispatch: React.Dispatch<Action>;
}

const ForumContext = createContext<ForumContextType | null>(null);

export function ForumProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(forumReducer, initialState, () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      } catch { return initialState; }
    }
    return initialState;
  });

  useEffect(() => {
    const { currentUser, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      state.applications.forEach((app: Application) => {
        if (app.status === 'closed' && app.closedAt && now - app.closedAt > 30 * 60 * 1000) {
          dispatch({ type: 'DELETE_APPLICATION', payload: app.id });
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [state.applications]);

  return (
    <ForumContext.Provider value={{ state, dispatch }}>
      {children}
    </ForumContext.Provider>
  );
}

export function useForumContext() {
  const context = useContext(ForumContext);
  if (!context) throw new Error('useForumContext must be used within ForumProvider');
  return context;
}
