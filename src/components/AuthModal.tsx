import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { ICONS } from '../data/icons';

interface AuthModalProps {
  mode: 'login' | 'register';
  onLogin: (email: string, password: string) => { success: boolean; error?: string };
  onRegister: (username: string, email: string, password: string) => { success: boolean; error?: string };
  onClose: () => void;
  onSwitch: () => void;
}

export const AuthModal = ({ mode, onLogin, onRegister, onClose, onSwitch }: AuthModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register') {
      if (username.length < 3) {
        setError('Имя пользователя должно быть не менее 3 символов');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Пароль должен быть не менее 6 символов');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        setLoading(false);
        return;
      }
      const result = onRegister(username, email, password);
      if (!result.success) {
        setError(result.error || 'Ошибка регистрации');
        setLoading(false);
        return;
      }
    } else {
      const result = onLogin(email, password);
      if (!result.success) {
        setError(result.error || 'Ошибка входа');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-8">
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon src={mode === 'login' ? ICONS.login : ICONS.register} size={32} />
              </div>
              <h2 className="text-xl font-semibold text-white">
                {mode === 'login' ? 'Вход' : 'Регистрация'}
              </h2>
              <p className="text-white/40 mt-1 text-sm">
                {mode === 'login' ? 'Войдите в LostRP Forum' : 'Создайте аккаунт'}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    placeholder="Ваш никнейм"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  placeholder="example@mail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Подтвердите пароль
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onSwitch}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                {mode === 'login' 
                  ? 'Нет аккаунта? Зарегистрируйтесь' 
                  : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Icon src={ICONS.close} size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
