import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import './Notification.css';

const NotificationContext = createContext({
  notify: () => {}
});

function generateId() {
  return `${Date.now().toString(32)}-${Math.random().toString(16).slice(2)}`;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback(id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const notify = useCallback((messageOrConfig, config = {}) => {
    const payload =
      typeof messageOrConfig === 'string'
        ? { message: messageOrConfig }
        : messageOrConfig || {};

    const merged = {
      id: payload.id || generateId(),
      title: payload.title?.trim(),
      message: payload.message?.trim() || payload.title?.trim() || '',
      type: payload.type || config.type || 'info',
      icon: payload.icon || config.icon,
      duration:
        payload.duration ?? config.duration ?? (payload.type === 'error' ? 6000 : 4000)
    };

    if (!merged.message) {
      return;
    }

    setNotifications(prev => [...prev, merged]);

    if (merged.duration !== null) {
      setTimeout(() => {
        removeNotification(merged.id);
      }, merged.duration);
    }
  }, [removeNotification]);

  const value = useMemo(() => ({ notify, removeNotification }), [notify, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-stack" role="status" aria-live="polite">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-toast notification-${notification.type}`}
          >
            <div className="notification-copy">
              {notification.title && <p className="notification-title">{notification.title}</p>}
              <p>{notification.message}</p>
            </div>
            <button
              type="button"
              className="notification-close"
              aria-label="Dismiss notification"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return ctx;
}

export default NotificationProvider;

