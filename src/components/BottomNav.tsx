import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusCircle, ClipboardList, BarChart3, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/add', icon: PlusCircle, label: 'Agregar' },
  { path: '/history', icon: ClipboardList, label: 'Historial' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/settings', icon: Bell, label: 'Alertas' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-nav-background/95 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-nav-active rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon
                size={22}
                className={isActive ? 'text-nav-active' : 'text-nav-inactive'}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-nav-active' : 'text-nav-inactive'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for notched phones */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
