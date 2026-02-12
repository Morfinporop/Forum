import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForumProvider } from './store';
import { useAuth, useForum, useApplications, useAdmin, useMessages } from './hooks';
import { formatDate, formatFullDate, getRankByPosts, getRoleInfo, fileToBase64, APPLICATION_TYPES, APPLICATION_STATUS } from './utils/helpers';
import { User, Reply, Application, MediaFile } from './types';

const API_URL = 'https://your-railway-app.up.railway.app';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <img src={`https://api.iconify.design/${name}.svg?color=white`} alt="" className={`w-5 h-5 ${className}`} />;
}

function IconDark({ name, className = '' }: { name: string; className?: string }) {
  return <img src={`https://api.iconify.design/${name}.svg?color=black`} alt="" className={`w-5 h-5 ${className}`} />;
}

function Avatar({ src, size = 'md', className = '' }: { src: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-24 h-24' };
  return <img src={src} alt="" className={`${sizes[size]} rounded-full object-cover bg-neutral-800 ${className}`} />;
}

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: color + '20', color }}>
      {children}
    </span>
  );
}

function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }: { 
  children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; 
  onClick?: () => void; disabled?: boolean; className?: string 
}) {
  const variants = {
    primary: 'bg-white text-black hover:bg-neutral-200',
    secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-white hover:bg-neutral-800'
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };
  return (
    <button onClick={onClick} disabled={disabled} className={`${variants[variant]} ${sizes[size]} rounded-lg font-medium transition-all disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, className = '', error }: { 
  label?: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string; error?: string 
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-neutral-400 mb-1">{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full bg-neutral-900 border rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none ${error ? 'border-red-500' : 'border-neutral-800 focus:border-neutral-600'}`} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4, className = '' }: { 
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string 
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-neutral-400 mb-1">{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none" />
    </div>
  );
}

function Modal({ isOpen, onClose, title, children, size = 'md' }: { 
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' 
}) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className={`bg-neutral-900 border border-neutral-800 rounded-xl ${sizes[size]} w-full max-h-[90vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white"><Icon name="mdi:close" /></button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function UserBadges({ user }: { user: User }) {
  const rank = getRankByPosts(user.posts);
  const role = getRoleInfo(user.role);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {user.role !== 'user' && <Badge color={role.color}>{role.name}</Badge>}
      <Badge color={rank.color}>{rank.name}</Badge>
    </div>
  );
}

function ForumApp() {
  const { currentUser, users, register, login, logout, updateProfile, followUser, bookmarkTopic, checkEmailExists, checkUsernameExists } = useAuth();
  const { categories, topics, replies, news, reviews, createCategory, deleteCategory, createTopic, updateTopic, deleteTopic, viewTopic, likeTopic, createReply, deleteReply, likeReply, createNews, updateNews, deleteNews, likeNews, createReview } = useForum();
  const { applications, createApplication, updateApplicationStatus, addApplicationResponse, deleteApplication } = useApplications();
  const { banUser, unbanUser, updateUser } = useAdmin();
  const { sendMessage, getConversations, getMessagesWith, getUnreadCount } = useMessages();

  const [view, setView] = useState<'news' | 'forum' | 'category' | 'topic' | 'applications' | 'application' | 'profile' | 'members' | 'messages' | 'conversation' | 'admin'>('news');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationUserId, setSelectedConversationUserId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState<'topic' | 'news' | 'category' | 'application' | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin' || isOwner;
  const isModerator = currentUser?.role === 'moderator' || isAdmin;

  const getUser = (id: string) => users.find(u => u.id === id);

  const openCategory = (id: string) => { setSelectedCategoryId(id); setView('category'); };
  const openTopic = (id: string) => { setSelectedTopicId(id); viewTopic(id); setView('topic'); };
  const openApplication = (id: string) => { setSelectedApplicationId(id); setView('application'); };
  const openProfile = (id: string) => { setSelectedUserId(id); setView('profile'); };
  const openConversation = (id: string) => { setSelectedConversationUserId(id); setView('conversation'); };

  const Header = () => (
    <header className="bg-black border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => setView('news')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <IconDark name="mdi:forum" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white">LostRP</span>
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setView('news')} className={`text-sm ${view === 'news' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>Новости</button>
              <button onClick={() => setView('forum')} className={`text-sm ${view === 'forum' || view === 'category' || view === 'topic' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>Форум</button>
              <button onClick={() => setView('applications')} className={`text-sm ${view === 'applications' || view === 'application' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>Заявки</button>
              <button onClick={() => setView('members')} className={`text-sm ${view === 'members' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>Участники</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                {isOwner && (
                  <button onClick={() => setView('admin')} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white">
                    <Icon name="mdi:cog" />
                  </button>
                )}
                <button onClick={() => setView('messages')} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white relative">
                  <Icon name="mdi:message" />
                  {getUnreadCount(currentUser.id) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">{getUnreadCount(currentUser.id)}</span>
                  )}
                </button>
                <button onClick={() => openProfile(currentUser.id)} className="flex items-center gap-2 hover:bg-neutral-800 rounded-lg p-1.5 pr-3">
                  <Avatar src={currentUser.avatar} size="sm" />
                  <span className="text-sm text-white hidden md:block">{currentUser.username}</span>
                </button>
                <button onClick={logout} className="text-neutral-400 hover:text-white"><Icon name="mdi:logout" /></button>
              </>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>Войти</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const AuthModal = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState<'form' | 'verify'>('form');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
      if (resendTimer > 0) {
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [resendTimer]);

    const validateEmail = (value: string) => {
      setEmail(value);
      if (value && checkEmailExists(value)) {
        setEmailError('Этот email уже зарегистрирован');
      } else {
        setEmailError('');
      }
    };

    const validateUsername = (value: string) => {
      setUsername(value);
      if (value && checkUsernameExists(value)) {
        setUsernameError('Это имя уже занято');
      } else {
        setUsernameError('');
      }
    };

    const sendVerificationEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/api/send-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: username })
        });

        const data = await response.json();
        return data.success;
      } catch (err) {
        console.error('Email error:', err);
        return false;
      }
    };

    const handleSubmit = async () => {
      setError('');
      
      if (authMode === 'login') {
        if (!login(email, password)) {
          setError('Неверный email или пароль');
        } else {
          setShowAuthModal(false);
          resetForm();
        }
      } else {
        if (!email || !username || !password) {
          setError('Заполните все поля');
          return;
        }

        if (emailError || usernameError) {
          return;
        }

        if (password.length < 6) {
          setError('Пароль должен быть не менее 6 символов');
          return;
        }

        setLoading(true);
        const sent = await sendVerificationEmail();
        setLoading(false);

        if (sent) {
          setStep('verify');
          setResendTimer(60);
        } else {
          setError('Ошибка отправки кода. Попробуйте позже.');
        }
      }
    };

    const handleVerify = async () => {
      try {
        const response = await fetch(`${API_URL}/api/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode })
        });

        const data = await response.json();
        
        if (data.success) {
          if (register(email, username, password)) {
            setShowAuthModal(false);
            resetForm();
          } else {
            setError('Ошибка регистрации');
          }
        } else {
          setError(data.error || 'Неверный код подтверждения');
        }
      } catch (err) {
        setError('Ошибка проверки кода');
      }
    };

    const handleResend = async () => {
      if (resendTimer > 0) return;
      setLoading(true);
      const sent = await sendVerificationEmail();
      setLoading(false);
      if (sent) {
        setResendTimer(60);
        setError('');
      } else {
        setError('Ошибка отправки кода');
      }
    };

    const resetForm = () => {
      setEmail('');
      setUsername('');
      setPassword('');
      setVerificationCode('');
      setStep('form');
      setError('');
      setEmailError('');
      setUsernameError('');
    };

    const handleClose = () => {
      setShowAuthModal(false);
      resetForm();
    };

    return (
      <Modal isOpen={showAuthModal} onClose={handleClose} title={authMode === 'login' ? 'Вход' : step === 'verify' ? 'Подтверждение' : 'Регистрация'}>
        {step === 'form' ? (
          <div className="space-y-4">
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={authMode === 'register' ? validateEmail : setEmail} 
              placeholder="email@example.com"
              error={emailError}
            />
            {authMode === 'register' && (
              <Input 
                label="Имя пользователя" 
                value={username} 
                onChange={validateUsername} 
                placeholder="username"
                error={usernameError}
              />
            )}
            <Input label="Пароль" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleSubmit} disabled={loading || !!emailError || !!usernameError} className="w-full">
              {loading ? 'Отправка...' : authMode === 'login' ? 'Войти' : 'Продолжить'}
            </Button>
            <p className="text-center text-neutral-400 text-sm">
              {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); resetForm(); }} className="text-white hover:underline">
                {authMode === 'login' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="mdi:email-check" className="w-8 h-8" />
              </div>
              <p className="text-neutral-400">
                Мы отправили код подтверждения на
              </p>
              <p className="text-white font-medium">{email}</p>
            </div>
            <Input 
              label="Код подтверждения" 
              value={verificationCode} 
              onChange={setVerificationCode} 
              placeholder="000000"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleVerify} className="w-full">Подтвердить</Button>
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-neutral-500 text-sm">
                  Отправить повторно через {resendTimer} сек
                </p>
              ) : (
                <button 
                  onClick={handleResend} 
                  disabled={loading}
                  className="text-white hover:underline text-sm"
                >
                  {loading ? 'Отправка...' : 'Отправить код повторно'}
                </button>
              )}
            </div>
            <button onClick={() => setStep('form')} className="w-full text-neutral-400 hover:text-white text-sm">
              ← Назад
            </button>
          </div>
        )}
      </Modal>
    );
  };

  const NewsView = () => {
    const rules = news.filter(n => n.isRule).sort((a, b) => b.createdAt - a.createdAt);
    const regularNews = news.filter(n => !n.isRule).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Новости</h1>
          {isOwner && <Button onClick={() => setShowCreateModal('news')}>Добавить новость</Button>}
        </div>
        {rules.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Icon name="mdi:gavel" /> Правила</h2>
            <div className="space-y-3">
              {rules.map(item => (
                <div key={item.id} className="p-4 bg-black rounded-lg border border-neutral-800">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="text-neutral-400 mt-1 whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-4">
          {regularNews.map(item => {
            const author = getUser(item.authorId);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {item.image && <img src={item.image} alt="" className="w-full h-48 object-cover" />}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.isPinned && <Badge color="#fbbf24">Закреплено</Badge>}
                      <span className="text-neutral-500 text-sm">{formatDate(item.createdAt)}</span>
                    </div>
                    {isOwner && (
                      <div className="flex gap-2">
                        <button onClick={() => updateNews(item.id, { isPinned: !item.isPinned })} className="text-neutral-400 hover:text-white">
                          <Icon name={item.isPinned ? 'mdi:pin-off' : 'mdi:pin'} />
                        </button>
                        <button onClick={() => deleteNews(item.id)} className="text-neutral-400 hover:text-red-500"><Icon name="mdi:delete" /></button>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">{item.title}</h2>
                  <p className="text-neutral-400 whitespace-pre-wrap">{item.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
                    {author && (
                      <button onClick={() => openProfile(author.id)} className="flex items-center gap-2 hover:opacity-80">
                        <Avatar src={author.avatar} size="sm" />
                        <span className="text-sm text-white">{author.username}</span>
                      </button>
                    )}
                    <button onClick={() => currentUser && likeNews(item.id, currentUser.id)} 
                      className={`flex items-center gap-1 ${currentUser && item.likes.includes(currentUser.id) ? 'text-red-500' : 'text-neutral-400'}`}>
                      <Icon name={currentUser && item.likes.includes(currentUser.id) ? 'mdi:heart' : 'mdi:heart-outline'} />
                      <span>{item.likes.length}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const CreateNewsModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [isRule, setIsRule] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleImage = async (file: File) => {
      const base64 = await fileToBase64(file);
      setImage(base64);
    };

    const handleSubmit = () => {
      if (!title || !content || !currentUser) return;
      createNews(currentUser.id, title, content, image, isRule, isPinned);
      setShowCreateModal(null);
    };

    return (
      <Modal isOpen={showCreateModal === 'news'} onClose={() => setShowCreateModal(null)} title="Новая новость" size="lg">
        <div className="space-y-4">
          <Input label="Заголовок" value={title} onChange={setTitle} placeholder="Введите заголовок" />
          <Textarea label="Содержание" value={content} onChange={setContent} placeholder="Введите текст новости" rows={6} />
          <div 
            className="border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-6 text-center cursor-pointer transition-all"
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
            {image ? (
              <img src={image} alt="" className="max-h-32 mx-auto rounded-lg" />
            ) : (
              <>
                <Icon name="mdi:image" className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-neutral-400">Добавить изображение</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isRule} onChange={e => setIsRule(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-neutral-300">Это правило</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-neutral-300">Закрепить</span>
            </label>
          </div>
          <Button onClick={handleSubmit} className="w-full">Опубликовать</Button>
        </div>
      </Modal>
    );
  };

  const ForumView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Форум</h1>
        {isAdmin && <Button onClick={() => setShowCreateModal('category')}>Создать раздел</Button>}
      </div>
      <div className="grid gap-4">
        {categories.sort((a, b) => a.order - b.order).map(cat => {
          const catTopics = topics.filter(t => t.categoryId === cat.id);
          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => openCategory(cat.id)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 cursor-pointer hover:border-neutral-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <Icon name={cat.icon || 'mdi:folder'} className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{cat.name}</h2>
                    <p className="text-neutral-500 text-sm">{cat.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{catTopics.length}</p>
                  <p className="text-neutral-500 text-sm">тем</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const CreateCategoryModal = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('mdi:folder');
    const icons = ['mdi:folder', 'mdi:chat', 'mdi:help-circle', 'mdi:newspaper', 'mdi:palette', 'mdi:code-tags', 'mdi:gamepad-variant', 'mdi:music', 'mdi:movie', 'mdi:book', 'mdi:briefcase', 'mdi:lightbulb'];

    const handleSubmit = () => {
      if (!name || !currentUser) return;
      createCategory(name, description, icon, currentUser.id);
      setShowCreateModal(null);
    };

    return (
      <Modal isOpen={showCreateModal === 'category'} onClose={() => setShowCreateModal(null)} title="Новый раздел">
        <div className="space-y-4">
          <Input label="Название" value={name} onChange={setName} placeholder="Название раздела" />
          <Input label="Описание" value={description} onChange={setDescription} placeholder="Краткое описание" />
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Иконка</label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map(i => (
                <button key={i} onClick={() => setIcon(i)}
                  className={`p-3 rounded-lg border ${icon === i ? 'border-white bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700'}`}>
                  <Icon name={i} />
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">Создать</Button>
        </div>
      </Modal>
    );
  };

  const CategoryView = () => {
    const category = categories.find(c => c.id === selectedCategoryId);
    if (!category) return null;
    const catTopics = topics.filter(t => t.categoryId === category.id).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('forum')} className="text-neutral-400 hover:text-white"><Icon name="mdi:arrow-left" /></button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{category.name}</h1>
            <p className="text-neutral-500">{category.description}</p>
          </div>
          {currentUser && <Button onClick={() => setShowCreateModal('topic')}>Создать тему</Button>}
          {isAdmin && (
            <button onClick={() => deleteCategory(category.id)} className="text-neutral-400 hover:text-red-500"><Icon name="mdi:delete" /></button>
          )}
        </div>
        <div className="space-y-3">
          {catTopics.map(topic => {
            const author = getUser(topic.authorId);
            const topicReplies = replies.filter(r => r.topicId === topic.id);
            return (
              <motion.div key={topic.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => openTopic(topic.id)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 cursor-pointer hover:border-neutral-700 transition-all">
                <div className="flex items-center gap-4">
                  {author && <Avatar src={author.avatar} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {topic.isPinned && <Badge color="#fbbf24">Закреплено</Badge>}
                      {topic.isLocked && <Badge color="#ef4444">Закрыто</Badge>}
                      <h3 className="font-medium text-white truncate">{topic.title}</h3>
                    </div>
                    <p className="text-neutral-500 text-sm">{author?.username} • {formatDate(topic.createdAt)}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-white">{topicReplies.length}</p>
                    <p className="text-neutral-500">ответов</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const CreateTopicModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleImage = async (file: File) => {
      const base64 = await fileToBase64(file);
      setImages([...images, base64]);
    };

    const handleSubmit = () => {
      if (!title || !content || !currentUser || !selectedCategoryId) return;
      createTopic(selectedCategoryId, currentUser.id, title, content, images);
      setShowCreateModal(null);
    };

    return (
      <Modal isOpen={showCreateModal === 'topic'} onClose={() => setShowCreateModal(null)} title="Новая тема" size="lg">
        <div className="space-y-4">
          <Input label="Заголовок" value={title} onChange={setTitle} placeholder="Заголовок темы" />
          <Textarea label="Содержание" value={content} onChange={setContent} placeholder="Напишите что-нибудь..." rows={6} />
          <div 
            className="border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-6 text-center cursor-pointer transition-all"
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
            <Icon name="mdi:image" className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-neutral-400">Добавить изображение</p>
          </div>
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Icon name="mdi:close" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full">Создать тему</Button>
        </div>
      </Modal>
    );
  };

  const TopicView = () => {
    const topic = topics.find(t => t.id === selectedTopicId);
    const [replyContent, setReplyContent] = useState('');
    const [replyImages, setReplyImages] = useState<string[]>([]);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);
    
    if (!topic) return null;
    const author = getUser(topic.authorId);
    const topicReplies = replies.filter(r => r.topicId === topic.id).sort((a, b) => a.createdAt - b.createdAt);

    const handleReplyImage = async (file: File) => {
      const base64 = await fileToBase64(file);
      setReplyImages([...replyImages, base64]);
    };

    const handleReply = () => {
      if (!replyContent || !currentUser) return;
      createReply(topic.id, currentUser.id, replyContent, replyImages, replyTo || undefined);
      setReplyContent('');
      setReplyImages([]);
      setReplyTo(null);
    };

    const ReplyCard = ({ reply }: { reply: Reply }) => {
      const replyAuthor = getUser(reply.authorId);
      const replyToReply = reply.replyTo ? replies.find(r => r.id === reply.replyTo) : null;
      const replyToAuthor = replyToReply ? getUser(replyToReply.authorId) : null;
      
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-4">
              {replyAuthor && (
                <button onClick={() => openProfile(replyAuthor.id)} className="flex-shrink-0">
                  <Avatar src={replyAuthor.avatar} size="lg" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  {replyAuthor && (
                    <div>
                      <button onClick={() => openProfile(replyAuthor.id)} className="font-medium text-white hover:underline">{replyAuthor.username}</button>
                      <div className="mt-1"><UserBadges user={replyAuthor} /></div>
                    </div>
                  )}
                  <span className="text-neutral-500 text-sm">{formatDate(reply.createdAt)}</span>
                </div>
                {replyToReply && replyToAuthor && (
                  <div className="mb-3 p-3 bg-neutral-800 rounded-lg border-l-2 border-neutral-600">
                    <p className="text-neutral-500 text-sm mb-1">Ответ на {replyToAuthor.username}:</p>
                    <p className="text-neutral-400 text-sm line-clamp-2">{replyToReply.content}</p>
                  </div>
                )}
                <p className="text-neutral-300 whitespace-pre-wrap">{reply.content}</p>
                {reply.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {reply.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="max-h-48 rounded-lg" />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-800">
                  <button onClick={() => currentUser && likeReply(reply.id, currentUser.id)}
                    className={`flex items-center gap-1 text-sm ${currentUser && reply.likes.includes(currentUser.id) ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}>
                    <Icon name={currentUser && reply.likes.includes(currentUser.id) ? 'mdi:heart' : 'mdi:heart-outline'} />
                    <span>{reply.likes.length}</span>
                  </button>
                  {currentUser && !topic.isLocked && (
                    <button onClick={() => setReplyTo(reply.id)} className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white">
                      <Icon name="mdi:reply" /> Ответить
                    </button>
                  )}
                  {(currentUser?.id === reply.authorId || isModerator) && (
                    <button onClick={() => deleteReply(reply.id)} className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-500 ml-auto">
                      <Icon name="mdi:delete" /> Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('category')} className="text-neutral-400 hover:text-white"><Icon name="mdi:arrow-left" /></button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {topic.isPinned && <Badge color="#fbbf24">Закреплено</Badge>}
              {topic.isLocked && <Badge color="#ef4444">Закрыто</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-white">{topic.title}</h1>
          </div>
          {isModerator && (
            <div className="flex gap-2">
              <button onClick={() => updateTopic(topic.id, { isPinned: !topic.isPinned })} className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white">
                <Icon name={topic.isPinned ? 'mdi:pin-off' : 'mdi:pin'} />
              </button>
              <button onClick={() => updateTopic(topic.id, { isLocked: !topic.isLocked })} className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white">
                <Icon name={topic.isLocked ? 'mdi:lock-open' : 'mdi:lock'} />
              </button>
              <button onClick={() => { deleteTopic(topic.id); setView('category'); }} className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-500">
                <Icon name="mdi:delete" />
              </button>
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              {author && (
                <button onClick={() => openProfile(author.id)} className="flex-shrink-0">
                  <Avatar src={author.avatar} size="lg" />
                </button>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  {author && (
                    <div>
                      <button onClick={() => openProfile(author.id)} className="font-medium text-white hover:underline">{author.username}</button>
                      <div className="mt-1"><UserBadges user={author} /></div>
                    </div>
                  )}
                  <span className="text-neutral-500 text-sm">{formatFullDate(topic.createdAt)}</span>
                </div>
                <p className="text-neutral-300 whitespace-pre-wrap mt-4">{topic.content}</p>
                {topic.images.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {topic.images.map((img, i) => <img key={i} src={img} alt="" className="max-h-64 rounded-lg" />)}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-neutral-800">
                  <button onClick={() => currentUser && likeTopic(topic.id, currentUser.id)}
                    className={`flex items-center gap-1 ${currentUser && topic.likes.includes(currentUser.id) ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}>
                    <Icon name={currentUser && topic.likes.includes(currentUser.id) ? 'mdi:heart' : 'mdi:heart-outline'} />
                    <span>{topic.likes.length}</span>
                  </button>
                  <span className="text-neutral-500 flex items-center gap-1"><Icon name="mdi:eye" /> {topic.views}</span>
                  <span className="text-neutral-500 flex items-center gap-1"><Icon name="mdi:comment" /> {topicReplies.length}</span>
                  {currentUser && (
                    <button onClick={() => bookmarkTopic(topic.id)}
                      className={`ml-auto ${currentUser.bookmarks.includes(topic.id) ? 'text-yellow-500' : 'text-neutral-400 hover:text-yellow-500'}`}>
                      <Icon name={currentUser.bookmarks.includes(topic.id) ? 'mdi:bookmark' : 'mdi:bookmark-outline'} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {topicReplies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Ответы ({topicReplies.length})</h2>
            {topicReplies.map(reply => <ReplyCard key={reply.id} reply={reply} />)}
          </div>
        )}

        {currentUser && !topic.isLocked && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            {replyTo && (
              <div className="mb-3 p-3 bg-neutral-800 rounded-lg flex items-center justify-between">
                <span className="text-neutral-400 text-sm">Ответ на сообщение</span>
                <button onClick={() => setReplyTo(null)} className="text-neutral-400 hover:text-white"><Icon name="mdi:close" /></button>
              </div>
            )}
            <Textarea value={replyContent} onChange={setReplyContent} placeholder="Написать ответ..." rows={3} />
            <div className="flex items-center justify-between mt-3">
              <button onClick={() => replyInputRef.current?.click()} className="text-neutral-400 hover:text-white">
                <Icon name="mdi:image" />
              </button>
              <input ref={replyInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleReplyImage(e.target.files[0])} />
              <Button onClick={handleReply} size="sm">Отправить</Button>
            </div>
            {replyImages.length > 0 && (
              <div className="flex gap-2 mt-3">
                {replyImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button onClick={() => setReplyImages(replyImages.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <Icon name="mdi:close" className="w-2 h-2" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const ApplicationsView = () => {
    const myApps = currentUser ? applications.filter(a => a.authorId === currentUser.id) : [];
    const otherApps = isModerator ? applications.filter(a => a.authorId !== currentUser?.id) : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Заявки</h1>
          {currentUser && <Button onClick={() => setShowCreateModal('application')}>Подать заявку</Button>}
        </div>
        {myApps.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Мои заявки</h2>
            <div className="space-y-3">
              {myApps.map(app => (
                <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => openApplication(app.id)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 cursor-pointer hover:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color={APPLICATION_STATUS[app.status].color}>{APPLICATION_STATUS[app.status].text}</Badge>
                        <span className="text-neutral-500 text-sm">{APPLICATION_TYPES[app.type]}</span>
                      </div>
                      <h3 className="font-medium text-white">{app.title}</h3>
                    </div>
                    <span className="text-neutral-500 text-sm">{formatDate(app.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        {isModerator && otherApps.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Все заявки</h2>
            <div className="space-y-3">
              {otherApps.map(app => {
                const appAuthor = getUser(app.authorId);
                return (
                  <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => openApplication(app.id)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 cursor-pointer hover:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {appAuthor && <Avatar src={appAuthor.avatar} size="sm" />}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge color={APPLICATION_STATUS[app.status].color}>{APPLICATION_STATUS[app.status].text}</Badge>
                            <span className="text-neutral-500 text-sm">{APPLICATION_TYPES[app.type]}</span>
                          </div>
                          <h3 className="font-medium text-white">{app.title}</h3>
                          <p className="text-neutral-500 text-sm">{appAuthor?.username}</p>
                        </div>
                      </div>
                      <span className="text-neutral-500 text-sm">{formatDate(app.createdAt)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CreateApplicationModal = () => {
    const [type, setType] = useState<Application['type']>('suggestion');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<MediaFile[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
      if (!title || !content || !currentUser) return;
      createApplication(currentUser.id, type, title, content, media);
      setShowCreateModal(null);
    };

    const handleMedia = async (file: File) => {
      const base64 = await fileToBase64(file);
      const mediaType = file.type.startsWith('video') ? 'video' : 'image';
      setMedia([...media, { id: crypto.randomUUID(), type: mediaType, url: base64, name: file.name }]);
    };

    return (
      <Modal isOpen={showCreateModal === 'application'} onClose={() => setShowCreateModal(null)} title="Новая заявка" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Тип заявки</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(APPLICATION_TYPES).map(([key, label]) => (
                <button key={key} onClick={() => setType(key as Application['type'])}
                  className={`p-3 rounded-lg border text-sm text-left ${type === key ? 'border-white bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Input label="Заголовок" value={title} onChange={setTitle} placeholder="Тема заявки" />
          <Textarea label="Описание" value={content} onChange={setContent} placeholder="Подробно опишите..." rows={6} />
          <div 
            className="border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-6 text-center cursor-pointer transition-all"
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="mdi:cloud-upload" className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-neutral-400">Добавить фото или видео</p>
            <p className="text-neutral-600 text-sm mt-1">Перетащите или нажмите для выбора</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => e.target.files?.[0] && handleMedia(e.target.files[0])} />
          {media.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {media.map(m => (
                <div key={m.id} className="relative">
                  {m.type === 'image' ? (
                    <img src={m.url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <video src={m.url} className="w-20 h-20 object-cover rounded-lg" />
                  )}
                  <button onClick={() => setMedia(media.filter(x => x.id !== m.id))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Icon name="mdi:close" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full">Отправить</Button>
        </div>
      </Modal>
    );
  };

  const ApplicationView = () => {
    const app = applications.find(a => a.id === selectedApplicationId);
    const [responseText, setResponseText] = useState('');

    if (!app) return null;
    const author = getUser(app.authorId);
    const canManage = isModerator && app.authorId !== currentUser?.id;

    const handleResponse = () => {
      if (!responseText || !currentUser) return;
      addApplicationResponse(app.id, currentUser.id, responseText);
      setResponseText('');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('applications')} className="text-neutral-400 hover:text-white"><Icon name="mdi:arrow-left" /></button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge color={APPLICATION_STATUS[app.status].color}>{APPLICATION_STATUS[app.status].text}</Badge>
              <span className="text-neutral-500">{APPLICATION_TYPES[app.type]}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{app.title}</h1>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            {author && (
              <button onClick={() => openProfile(author.id)}><Avatar src={author.avatar} size="lg" /></button>
            )}
            <div className="flex-1">
              {author && (
                <div className="flex items-center justify-between">
                  <div>
                    <button onClick={() => openProfile(author.id)} className="font-medium text-white hover:underline">{author.username}</button>
                    <div className="mt-1"><UserBadges user={author} /></div>
                  </div>
                  <span className="text-neutral-500 text-sm">{formatFullDate(app.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-neutral-300 whitespace-pre-wrap">{app.content}</p>
          {app.media.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {app.media.map(m => m.type === 'image' ? (
                <img key={m.id} src={m.url} alt="" className="max-h-48 rounded-lg" />
              ) : (
                <video key={m.id} src={m.url} controls className="max-h-48 rounded-lg" />
              ))}
            </div>
          )}
          {canManage && app.status !== 'closed' && (
            <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-800">
              {app.status === 'pending' && (
                <Button variant="secondary" onClick={() => updateApplicationStatus(app.id, 'reviewing')}>На рассмотрение</Button>
              )}
              <Button onClick={() => updateApplicationStatus(app.id, 'approved')}>Одобрить</Button>
              <Button variant="danger" onClick={() => updateApplicationStatus(app.id, 'rejected')}>Отклонить</Button>
              <Button variant="ghost" onClick={() => updateApplicationStatus(app.id, 'closed')}>Закрыть</Button>
            </div>
          )}
          {app.authorId === currentUser?.id && app.status !== 'closed' && (
            <div className="mt-6 pt-4 border-t border-neutral-800">
              <Button variant="secondary" onClick={() => updateApplicationStatus(app.id, 'closed')}>Закрыть заявку</Button>
            </div>
          )}
        </div>

        {app.responses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Ответы ({app.responses.length})</h2>
            {app.responses.map(resp => {
              const respAuthor = getUser(resp.authorId);
              return (
                <div key={resp.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    {respAuthor && <Avatar src={respAuthor.avatar} />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        {respAuthor && (
                          <div>
                            <span className="font-medium text-white">{respAuthor.username}</span>
                            <div className="mt-1"><UserBadges user={respAuthor} /></div>
                          </div>
                        )}
                        <span className="text-neutral-500 text-sm">{formatDate(resp.createdAt)}</span>
                      </div>
                      <p className="text-neutral-300">{resp.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentUser && app.status !== 'closed' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <Textarea value={responseText} onChange={setResponseText} placeholder="Написать ответ..." rows={3} />
            <div className="flex justify-end mt-3">
              <Button onClick={handleResponse} size="sm">Отправить</Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const MembersView = () => {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'posts' | 'reputation'>('date');

    const filteredUsers = users
      .filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'posts') return b.posts - a.posts;
        if (sortBy === 'reputation') return b.reputation - a.reputation;
        return b.createdAt - a.createdAt;
      });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Участники</h1>
          <span className="text-neutral-500">{users.length} пользователей</span>
        </div>
        <div className="flex gap-4">
          <Input value={search} onChange={setSearch} placeholder="Поиск..." className="flex-1" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'posts' | 'reputation')}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white">
            <option value="date">По дате</option>
            <option value="posts">По постам</option>
            <option value="reputation">По репутации</option>
          </select>
        </div>
        <div className="grid gap-3">
          {filteredUsers.map(user => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => openProfile(user.id)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 cursor-pointer hover:border-neutral-700">
              <div className="flex items-center gap-4">
                <Avatar src={user.avatar} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{user.username}</span>
                    {user.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                  <UserBadges user={user} />
                </div>
                <div className="text-right text-sm">
                  <p className="text-white">{user.posts} постов</p>
                  <p className="text-neutral-500">{user.reputation} репутации</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    const user = users.find(u => u.id === selectedUserId);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [editBio, setEditBio] = useState(false);
    const [bio, setBio] = useState('');
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;
    const userReviews = reviews.filter(r => r.userId === user.id);
    const isOwnProfile = currentUser?.id === user.id;
    const isFollowing = currentUser?.following.includes(user.id);
    const avgRating = userReviews.length ? (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1) : null;

    const handleAvatarUpload = async (file: File) => {
      const base64 = await fileToBase64(file);
      updateProfile({ avatar: base64 });
    };

    const handleBannerUpload = async (file: File) => {
      const base64 = await fileToBase64(file);
      updateProfile({ banner: base64 });
    };

    const handleReview = () => {
      if (!reviewText || !currentUser) return;
      createReview(user.id, currentUser.id, reviewRating, reviewText);
      setReviewText('');
      setReviewRating(5);
    };

    return (
      <div className="space-y-6">
        <button onClick={() => setView('members')} className="flex items-center gap-2 text-neutral-400 hover:text-white">
          <Icon name="mdi:arrow-left" /> Назад
        </button>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="relative h-48 bg-neutral-800">
            <img src={user.banner} alt="" className="w-full h-full object-cover" />
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}>
                <Icon name="mdi:camera" className="w-10 h-10" />
              </div>
            )}
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 relative z-10">
              <div className="relative">
                <Avatar src={user.avatar} size="xl" className="border-4 border-neutral-900" />
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                    onClick={() => avatarInputRef.current?.click()}>
                    <Icon name="mdi:camera" className="w-8 h-8" />
                  </div>
                )}
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                {user.isOnline && <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-neutral-900" />}
              </div>
              <div className="flex-1 pt-16">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <div className="mt-2"><UserBadges user={user} /></div>
              </div>
              {!isOwnProfile && currentUser && (
                <div className="flex gap-2 pt-16">
                  <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={() => followUser(user.id)}>
                    {isFollowing ? 'Отписаться' : 'Подписаться'}
                  </Button>
                  <Button variant="secondary" onClick={() => openConversation(user.id)}>
                    <Icon name="mdi:message" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-black rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.posts}</p>
                <p className="text-neutral-500 text-sm">Постов</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.reputation}</p>
                <p className="text-neutral-500 text-sm">Репутация</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.followers.length}</p>
                <p className="text-neutral-500 text-sm">Подписчиков</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{avgRating || '—'}</p>
                <p className="text-neutral-500 text-sm">Рейтинг</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">О себе</h3>
                {isOwnProfile && !editBio && (
                  <button onClick={() => { setEditBio(true); setBio(user.bio); }} className="text-neutral-400 hover:text-white text-sm">Редактировать</button>
                )}
              </div>
              {editBio && isOwnProfile ? (
                <div className="space-y-2">
                  <Textarea value={bio} onChange={setBio} placeholder="Расскажите о себе..." rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { updateProfile({ bio }); setEditBio(false); }}>Сохранить</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditBio(false)}>Отмена</Button>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-400">{user.bio || 'Пользователь пока ничего не рассказал о себе'}</p>
              )}
            </div>

            <p className="text-neutral-500 text-sm mt-4">На форуме с {formatDate(user.createdAt)}</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Отзывы ({userReviews.length})</h2>
          {currentUser && !isOwnProfile && !userReviews.some(r => r.authorId === currentUser.id) && (
            <div className="mb-6 p-4 bg-black rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-neutral-400">Оценка:</span>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setReviewRating(n)} className={n <= reviewRating ? 'text-yellow-500' : 'text-neutral-600'}>
                    <Icon name="mdi:star" />
                  </button>
                ))}
              </div>
              <Textarea value={reviewText} onChange={setReviewText} placeholder="Напишите отзыв..." rows={2} />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handleReview}>Отправить</Button>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {userReviews.map(review => {
              const reviewAuthor = getUser(review.authorId);
              return (
                <div key={review.id} className="p-4 bg-black rounded-xl">
                  <div className="flex items-start gap-3">
                    {reviewAuthor && <Avatar src={reviewAuthor.avatar} size="sm" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{reviewAuthor?.username}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Icon key={n} name="mdi:star" className={`w-4 h-4 ${n <= review.rating ? 'text-yellow-500' : 'text-neutral-700'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-neutral-500 text-sm">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-neutral-300 mt-2">{review.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const MessagesView = () => {
    if (!currentUser) return null;
    const conversations = getConversations(currentUser.id);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Сообщения</h1>
        {conversations.length === 0 ? (
          <p className="text-neutral-500 text-center py-12">Нет сообщений</p>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => {
              const other = getUser(conv.participants.find(p => p !== currentUser.id) || '');
              if (!other) return null;
              const unread = conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.receiverId === currentUser.id;
              return (
                <motion.div key={conv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => openConversation(other.id)}
                  className={`bg-neutral-900 border rounded-xl p-4 cursor-pointer hover:border-neutral-700 ${unread ? 'border-white' : 'border-neutral-800'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar src={other.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${unread ? 'text-white' : 'text-neutral-300'}`}>{other.username}</span>
                        <span className="text-neutral-500 text-sm">{conv.lastMessage && formatDate(conv.lastMessage.createdAt)}</span>
                      </div>
                      <p className={`text-sm truncate ${unread ? 'text-white' : 'text-neutral-500'}`}>{conv.lastMessage?.content}</p>
                    </div>
                    {unread && <span className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ConversationView = () => {
    const [text, setText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    if (!currentUser || !selectedConversationUserId) return null;
    const other = getUser(selectedConversationUserId);
    const messages = getMessagesWith(currentUser.id, selectedConversationUserId);

    const handleSend = () => {
      if (!text.trim()) return;
      sendMessage(currentUser.id, selectedConversationUserId, text);
      setText('');
    };

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!other) return null;

    return (
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="flex items-center gap-4 pb-4 border-b border-neutral-800">
          <button onClick={() => setView('messages')} className="text-neutral-400 hover:text-white"><Icon name="mdi:arrow-left" /></button>
          <button onClick={() => openProfile(other.id)} className="flex items-center gap-3 hover:opacity-80">
            <Avatar src={other.avatar} />
            <div>
              <span className="font-medium text-white">{other.username}</span>
              <p className="text-neutral-500 text-sm">{other.isOnline ? 'Онлайн' : `Был(а) ${formatDate(other.lastSeen)}`}</p>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map(msg => {
            const isMine = msg.senderId === currentUser.id;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-white text-black rounded-br-sm' : 'bg-neutral-800 text-white rounded-bl-sm'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-neutral-500' : 'text-neutral-400'}`}>{formatDate(msg.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <div className="flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Написать сообщение..." className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white" />
            <Button onClick={handleSend}><Icon name="mdi:send" /></Button>
          </div>
        </div>
      </div>
    );
  };

  const AdminPanel = () => {
    const [tab, setTab] = useState<'users' | 'categories' | 'applications'>('users');
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [banReason, setBanReason] = useState('');
    const [editUserData, setEditUserData] = useState<Partial<User>>({});
    const [showBanModal, setShowBanModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const filteredUsers = users.filter(u => 
      u.username.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveUser = () => {
      if (!selectedUser) return;
      updateUser(selectedUser.id, editUserData);
      setSelectedUser(null);
      setEditUserData({});
      setShowEditModal(false);
    };

    const handleBan = () => {
      if (!selectedUser || !banReason) return;
      banUser(selectedUser.id, banReason);
      setSelectedUser(null);
      setBanReason('');
      setShowBanModal(false);
    };

    const openEditModal = (user: User) => {
      setSelectedUser(user);
      setEditUserData({ username: user.username, email: user.email, bio: user.bio, role: user.role });
      setShowEditModal(true);
    };

    const openBanModal = (user: User) => {
      setSelectedUser(user);
      setBanReason('');
      setShowBanModal(true);
    };

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Админ-панель</h1>

        <div className="flex gap-2">
          {(['users', 'categories', 'applications'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg ${tab === t ? 'bg-white text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}>
              {t === 'users' ? 'Пользователи' : t === 'categories' ? 'Разделы' : 'Заявки'}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="space-y-4">
            <Input value={search} onChange={setSearch} placeholder="Поиск по имени или email..." />
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div key={user.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{user.username}</span>
                          {user.isBanned && <Badge color="#ef4444">Заблокирован</Badge>}
                          {user.isMuted && <Badge color="#f97316">Мут</Badge>}
                        </div>
                        <p className="text-neutral-500 text-sm">{user.email}</p>
                        <UserBadges user={user} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditModal(user)}>
                        Изменить
                      </Button>
                      {!user.isBanned && user.role !== 'owner' && (
                        <Button variant="danger" size="sm" onClick={() => openBanModal(user)}>Бан</Button>
                      )}
                      {user.isBanned && (
                        <Button variant="secondary" size="sm" onClick={() => unbanUser(user.id)}>Разбан</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div className="space-y-4">
            <Button onClick={() => setShowCreateModal('category')}>Создать раздел</Button>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <Icon name={cat.icon} />
                    </div>
                    <div>
                      <span className="font-medium text-white">{cat.name}</span>
                      <p className="text-neutral-500 text-sm">{cat.description}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => deleteCategory(cat.id)}>Удалить</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'applications' && (
          <div className="space-y-2">
            {applications.map(app => {
              const author = getUser(app.authorId);
              return (
                <div key={app.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {author && <Avatar src={author.avatar} size="sm" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge color={APPLICATION_STATUS[app.status].color}>{APPLICATION_STATUS[app.status].text}</Badge>
                          <span className="text-neutral-500 text-sm">{APPLICATION_TYPES[app.type]}</span>
                        </div>
                        <p className="font-medium text-white">{app.title}</p>
                        <p className="text-neutral-500 text-sm">{author?.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openApplication(app.id)}>Открыть</Button>
                      <Button variant="danger" size="sm" onClick={() => deleteApplication(app.id)}>Удалить</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Редактирование пользователя">
          <div className="space-y-4">
            <Input label="Имя" value={editUserData.username || ''} onChange={v => setEditUserData({ ...editUserData, username: v })} />
            <Input label="Email" value={editUserData.email || ''} onChange={v => setEditUserData({ ...editUserData, email: v })} />
            <Textarea label="Описание" value={editUserData.bio || ''} onChange={v => setEditUserData({ ...editUserData, bio: v })} />
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Роль</label>
              <select value={editUserData.role} onChange={e => setEditUserData({ ...editUserData, role: e.target.value as User['role'] })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white">
                <option value="user">Пользователь</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <Button onClick={handleSaveUser} className="w-full">Сохранить</Button>
          </div>
        </Modal>

        <Modal isOpen={showBanModal} onClose={() => setShowBanModal(false)} title="Блокировка пользователя">
          <div className="space-y-4">
            <p className="text-neutral-400">Заблокировать {selectedUser?.username}?</p>
            <Textarea label="Причина блокировки" value={banReason} onChange={setBanReason} placeholder="Укажите причину..." />
            <Button variant="danger" onClick={handleBan} className="w-full">Заблокировать</Button>
          </div>
        </Modal>
      </div>
    );
  };

  const renderView = () => {
    switch (view) {
      case 'news': return <NewsView />;
      case 'forum': return <ForumView />;
      case 'category': return <CategoryView />;
      case 'topic': return <TopicView />;
      case 'applications': return <ApplicationsView />;
      case 'application': return <ApplicationView />;
      case 'members': return <MembersView />;
      case 'profile': return <ProfileView />;
      case 'messages': return <MessagesView />;
      case 'conversation': return <ConversationView />;
      case 'admin': return <AdminPanel />;
      default: return <NewsView />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderView()}
      </main>
      <AuthModal />
      <CreateNewsModal />
      <CreateCategoryModal />
      <CreateTopicModal />
      <CreateApplicationModal />
    </div>
  );
}

export default function App() {
  return (
    <ForumProvider>
      <ForumApp />
    </ForumProvider>
  );
}
