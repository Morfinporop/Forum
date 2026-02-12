import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { ICONS, CATEGORY_ICONS } from '../data/icons';

interface CreateCategoryModalProps {
  onSubmit: (name: string, description: string, icon: string) => void;
  onClose: () => void;
}

export const CreateCategoryModal = ({ onSubmit, onClose }: CreateCategoryModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onSubmit(name.trim(), description.trim(), selectedIcon);
      onClose();
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
        className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Новый раздел</h2>
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
                Название
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                placeholder="Название раздела"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none text-sm"
                placeholder="Краткое описание раздела"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">
                Иконка
              </label>
              <div className="grid grid-cols-8 gap-2">
                {CATEGORY_ICONS.map((icon, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      selectedIcon === icon 
                        ? 'bg-white/20 border border-white/30' 
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <Icon src={icon} size={20} />
                  </button>
                ))}
              </div>
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
                disabled={!name.trim() || !description.trim()}
                className="flex-1 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
