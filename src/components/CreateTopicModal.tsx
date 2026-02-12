import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { ICONS } from '../data/icons';
import { Category } from '../types';

interface CreateTopicModalProps {
  category: Category;
  onSubmit: (title: string, content: string) => void;
  onClose: () => void;
}

export const CreateTopicModal = ({ category, onSubmit, onClose }: CreateTopicModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/95" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Новая тема</h2>
              <p className="text-sm text-white/40">{category.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Icon src={ICONS.close} size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">
                Заголовок
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                placeholder="Название темы"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">
                Содержание
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none text-sm"
                placeholder="Напишите ваше сообщение..."
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 text-white/70 font-medium rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim()}
                className="flex-1 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Создать тему
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
