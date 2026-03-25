import { useEffect } from 'react';
import { useApp, getServiceStatus, SERVICE_CONFIG } from '@/context/AppContext';

const LAST_NOTIF_KEY = 'homepay-last-notification';

// iOS no soporta Notification API del navegador
const isNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export function useNotifications() {
  const { reminders, services } = useApp();

  const requestPermission = async (): Promise<boolean> => {
    if (!isNotificationSupported()) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  const fireNotifications = () => {
    if (!isNotificationSupported()) return;
    if (!reminders.enabled) return;
    if (Notification.permission !== 'granted') return;

    const pending = services.filter(s => {
      const enabled = reminders.serviceToggles[s.id] !== false;
      const status = getServiceStatus(s);
      return enabled && (status === 'upcoming' || status === 'overdue' || status === 'pending');
    });

    if (pending.length === 0) return;

    const titles = pending.map(s => {
      const cfg = SERVICE_CONFIG[s.type];
      const status = getServiceStatus(s);
      return `${cfg.icon} ${cfg.label} — ${status === 'overdue' ? '¡Vencido!' : 'Por vencer'}`;
    });

    new Notification('💰 HomePay — Recordatorio de pagos', {
      body: titles.join('\n'),
      icon: '/favicon.ico',
    });

    localStorage.setItem(LAST_NOTIF_KEY, new Date().toISOString());
  };

  const shouldNotify = (): boolean => {
    const last = localStorage.getItem(LAST_NOTIF_KEY);
    if (!last) return true;
    const lastDate = new Date(last);
    const now = new Date();
    const diffHours = (now.getTime() - lastDate.getTime()) / 3600000;
    if (reminders.frequency === 'daily') return diffHours >= 24;
    if (reminders.frequency === 'weekly') return diffHours >= 168;
    return false;
  };

  useEffect(() => {
    if (!reminders.enabled) return;
    if (!isNotificationSupported()) return;

    const scheduleForToday = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(reminders.hour, 0, 0, 0);
      let delay = target.getTime() - now.getTime();
      if (delay < 0) delay += 86400000;
      const timer = setTimeout(() => {
        if (shouldNotify()) fireNotifications();
      }, delay);
      return timer;
    };

    const timer = scheduleForToday();
    return () => clearTimeout(timer);
  }, [reminders, services]);

  return { requestPermission, fireNotifications };
}