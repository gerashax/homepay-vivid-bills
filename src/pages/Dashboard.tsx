import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useApp, SERVICE_CONFIG, getServiceStatus, getDaysUntilDue } from '@/context/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { services, userName } = useApp();

  const totalSpent = services.reduce((sum, s) => {
    const thisMonth = s.payments.filter(p => {
      const d = new Date(p.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return sum + thisMonth.reduce((s2, p) => s2 + p.amount, 0);
  }, 0);

  const unpaidCount = services.filter(s => !s.paid).length;

  const statusColors = {
    paid: 'bg-status-paid',
    upcoming: 'bg-status-upcoming',
    overdue: 'bg-status-overdue',
    pending: 'bg-muted-foreground',
  };

  const statusLabels = {
    paid: 'Pagado',
    upcoming: 'Por vencer',
    overdue: 'Vencido',
    pending: 'Pendiente',
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Hola, {userName ?? 'Usuario'} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Gestor de pagos del hogar</p>
      </div>

      {/* Summary */}
      <div className="glass-card p-4 mb-6 flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Gastado este mes</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">
            ${totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1 text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Por pagar</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">
            {unpaidCount}
            <span className="text-sm text-muted-foreground ml-1">servicios</span>
          </p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="space-y-3">
        {services.map((service, i) => {
          const config = SERVICE_CONFIG[service.type];
          const status = getServiceStatus(service);
          const days = getDaysUntilDue(service.dueDate);

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/service/${service.id}`)}
              className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              style={{ '--glow-color': `${config.hex}20` } as React.CSSProperties}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${config.hex}20` }}
              >
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-foreground">{config.label}</p>
                <p className="text-sm text-muted-foreground">
                  {status === 'paid' ? 'Pagado ✓' : status === 'pending' ? `Vence en ${days} días` : days >= 0 ? `Vence en ${days} días` : `Venció hace ${Math.abs(days)} días`}
                </p>
              </div>
              <div className="text-right flex items-center gap-3">
                <p className="font-display font-bold text-foreground">${service.amount.toLocaleString()}</p>
                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-muted-foreground">No hay servicios registrados</p>
          <p className="text-sm text-muted-foreground mt-1">Toca + para agregar uno</p>
        </div>
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/add')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-40"
      >
        <Plus size={28} className="text-primary-foreground" />
      </motion.button>
    </div>
  );
}
