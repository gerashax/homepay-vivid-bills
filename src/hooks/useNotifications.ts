import { useEffect } from 'react';
import { useApp, getServiceStatus, SERVICE_CONFIG } from '@/context/AppContext';

const LAST_NOTIF_KEY = 'homepay-last-notification';

export function useNotifications() {
  const { reminders, services } = useApp();

  // Pedir permiso
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  // Disparar notificaciones de servicios pendientes
  const fireNotifications = () => {
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

  // Verificar si ya toca notificar según frecuencia
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

  // Programar para la hora correcta del día
  useEffect(() => {
    if (!reminders.enabled) return;

    const scheduleForToday = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(reminders.hour, 0, 0, 0);

      let delay = target.getTime() - now.getTime();
      if (delay < 0) delay += 86400000; // mañana si ya pasó la hora

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