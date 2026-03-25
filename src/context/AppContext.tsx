import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ServiceType = 'water' | 'electricity' | 'internet' | 'gas' | 'phone';

export interface Payment {
  id: string;
  serviceId: string;
  amount: number;
  date: string;
  paidBy: string;
}

export interface Service {
  id: string;
  type: ServiceType;
  amount: number;
  dueDate: string;
  responsible: 'solo' | 'shared';
  members: string[];
  notes: string;
  paid: boolean;
  payments: Payment[];
}

export interface ReminderConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  hour: number;
  serviceToggles: Record<string, boolean>;
}

export interface AppState {
  services: Service[];
  members: string[];
  reminders: ReminderConfig;
  userName: string | null;
}

interface AppContextType extends AppState {
  setUserName: (name: string) => void;
  addService: (service: Omit<Service, 'id' | 'payments' | 'paid'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  markAsPaid: (serviceId: string, paidBy: string) => void;
  addMember: (name: string) => void;
  removeMember: (name: string) => void;
  updateReminders: (config: Partial<ReminderConfig>) => void;
  clearHistory: () => void;
  clearAllServices: () => void;
  getAllPayments: () => Payment[];
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'homepay-data';

const defaultState: AppState = {
  services: [],
  members: ['Yo'],
  reminders: {
    enabled: true,
    frequency: 'weekly',
    hour: 9,
    serviceToggles: {},
  },
  userName: null,
};

const STORAGE_VERSION = '2';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const version = localStorage.getItem(STORAGE_KEY + '-version');
    if (version === STORAGE_VERSION) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try { return JSON.parse(stored); } catch { /* ignore */ }
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY + '-version', STORAGE_VERSION);
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addService = (service: Omit<Service, 'id' | 'payments' | 'paid'>) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      payments: [],
      paid: false,
    };
    setState(s => ({ ...s, services: [...s.services, newService] }));
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setState(s => ({
      ...s,
      services: s.services.map(svc => svc.id === id ? { ...svc, ...updates } : svc),
    }));
  };

  const deleteService = (id: string) => {
    setState(s => ({ ...s, services: s.services.filter(svc => svc.id !== id) }));
  };

  const markAsPaid = (serviceId: string, paidBy: string) => {
    const payment: Payment = {
      id: Date.now().toString(),
      serviceId,
      amount: state.services.find(s => s.id === serviceId)?.amount || 0,
      date: new Date().toISOString().split('T')[0],
      paidBy,
    };
    setState(s => ({
      ...s,
      services: s.services.map(svc =>
        svc.id === serviceId
          ? { ...svc, paid: true, payments: [payment, ...svc.payments] }
          : svc
      ),
    }));
  };

  const addMember = (name: string) => {
    if (!state.members.includes(name)) {
      setState(s => ({ ...s, members: [...s.members, name] }));
    }
  };

  const removeMember = (name: string) => {
    if (name !== 'Yo') {
      setState(s => ({ ...s, members: s.members.filter(m => m !== name) }));
    }
  };

  const updateReminders = (config: Partial<ReminderConfig>) => {
    setState(s => ({ ...s, reminders: { ...s.reminders, ...config } }));
  };

  const clearHistory = () => {
    setState(s => ({
      ...s,
      services: s.services.map(svc => ({ ...svc, payments: [] })),
    }));
  };

  const clearAllServices = () => {
    setState(s => ({ ...s, services: [] }));
  };

  const setUserName = (name: string) => {
    setState(s => ({ ...s, userName: name }));
  };

  const getAllPayments = (): Payment[] => {
    return state.services
      .flatMap(s => s.payments.map(p => ({ ...p, serviceId: s.id })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setUserName, addService, updateService, deleteService, markAsPaid,
      addMember, removeMember, updateReminders, clearHistory, clearAllServices, getAllPayments,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Utility functions
export const SERVICE_CONFIG: Record<ServiceType, { label: string; icon: string; colorClass: string; hex: string }> = {
  water: { label: 'Agua', icon: '💧', colorClass: 'text-service-water', hex: '#2196F3' },
  electricity: { label: 'Luz', icon: '⚡', colorClass: 'text-service-electricity', hex: '#FFC107' },
  internet: { label: 'Internet', icon: '🌐', colorClass: 'text-service-internet', hex: '#4CAF50' },
  gas: { label: 'Gas', icon: '🔥', colorClass: 'text-service-gas', hex: '#FF5722' },
  phone: { label: 'Teléfono', icon: '📱', colorClass: 'text-service-phone', hex: '#9C27B0' },
};

export function getServiceStatus(service: Service): 'paid' | 'upcoming' | 'overdue' | 'pending' {
  if (service.paid) return 'paid';
  const now = new Date();
  const due = new Date(service.dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 5) return 'upcoming';
  return 'pending';
}

export function getDaysUntilDue(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}
