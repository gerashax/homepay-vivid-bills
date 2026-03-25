import { useEffect } from 'react';
import { useApp, getServiceStatus, SERVICE_CONFIG } from '@/context/AppContext';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const LAST_NOTIF_KEY = 'homepay-last-notification';

const isNative = () => Capacitor.isNativePlatform();
const isWebNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export function useNotifications() {
  const { reminders, services } = useApp();

  const requestPermission = async (): Promise<boolean> => {
    if (isNative()) {
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        await PushNotifications.register();
        return true;
      }
      return false;
    }
    if (!isWebNotificationSupported()) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  const fireNotifications = () => {
    if (!reminders.enabled) return;

    const pending = services.filter(s => {
      const enabled = reminders.serviceToggles[s.id] !== false;
      const status = getServiceStatus(s);
      return enabled && (status === 'upcoming' || status === 'overdue' || status === 'pending');
    });

    if (pending.length === 0) return;

    const body = pending.map(s => {
      const cfg = SERVICE_CONFIG[s.type];
      const status = getServiceStatus(s);
      return `${cfg.icon} ${cfg.label} — ${status === 'overdue' ? '¡Vencido!' : 'Por vencer'}`;
    }).join('\n');

    if (!isNative() && isWebNotificationSupported() && Notification.permission === 'granted') {
      new Notification('💰 HomePay — Recordatorio de pagos', { body, icon: '/favicon.ico' });
    }

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
    if (isNative()) return;
    if (!isWebNotificationSupported()) return;

    const now = new Date();
    const target = new Date();
    target.setHours(reminders.hour, 0, 0, 0);
    let delay = target.getTime() - now.getTime();
    if (delay < 0) delay += 86400000;

    const timer = setTimeout(() => {
      if (shouldNotify()) fireNotifications();
    }, delay);

    return () => clearTimeout(timer);
  }, [reminders, services]);

  return { requestPermission, fireNotifications };
}