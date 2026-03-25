import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Pencil } from 'lucide-react';
import { useApp, SERVICE_CONFIG, getServiceStatus, getDaysUntilDue } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { services, markAsPaid } = useApp();
  const service = services.find(s => s.id === id);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Servicio no encontrado</p>
      </div>
    );
  }

  const config = SERVICE_CONFIG[service.type];
  const status = getServiceStatus(service);
  const days = getDaysUntilDue(service.dueDate);

  const statusInfo = {
    paid: { label: 'Pagado', color: 'text-status-paid', bg: 'bg-status-paid' },
    upcoming: { label: 'Próximo a vencer', color: 'text-status-upcoming', bg: 'bg-status-upcoming' },
    overdue: { label: 'Vencido', color: 'text-status-overdue', bg: 'bg-status-overdue' },
  };

  const lastPayments = service.payments.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 px-4 pt-6"
    >
      <button onClick={() => navigate(-1)} className="text-muted-foreground mb-6 flex items-center gap-1">
        <ChevronLeft size={24} />
        <span className="text-sm">Volver</span>
      </button>

      {/* Hero */}
      <div className="text-center mb-8">
        <div
          className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-4"
          style={{ backgroundColor: `${config.hex}20` }}
        >
          {config.icon}
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">{config.label}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={`w-3 h-3 rounded-full ${statusInfo[status].bg}`} />
          <span className={`text-sm font-medium ${statusInfo[status].color}`}>{statusInfo[status].label}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Monto</p>
          <p className="text-xl font-display font-bold text-foreground mt-1" style={{ color: config.hex }}>
            ${service.amount.toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Vencimiento</p>
          <p className="text-xl font-display font-bold text-foreground mt-1">
            {service.paid ? '—' : days >= 0 ? `${days} días` : `${Math.abs(days)}d atrás`}
          </p>
        </div>
      </div>

      {/* Responsible */}
      <div className="glass-card p-4 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Responsable</p>
        <div className="flex flex-wrap gap-2">
          {service.members.map(m => (
            <span key={m} className="px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
              {m}
            </span>
          ))}
        </div>
        {service.notes && (
          <p className="text-sm text-muted-foreground mt-3 italic">"{service.notes}"</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-8">
        {!service.paid && (
          <Button
            onClick={() => markAsPaid(service.id, 'Yo')}
            className="w-full h-14 text-base font-display font-semibold rounded-xl"
            style={{ backgroundColor: config.hex }}
          >
            <CheckCircle2 size={22} className="mr-2" />
            Marcar como Pagado
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate(`/add`)}
          className="w-full h-12 rounded-xl border-border"
        >
          <Pencil size={18} className="mr-2" />
          Editar
        </Button>
      </div>

      {/* Payment History */}
      {lastPayments.length > 0 && (
        <div>
          <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Últimos pagos</h2>
          <div className="space-y-2">
            {lastPayments.map(p => (
              <div key={p.id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">${p.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{p.paidBy}</p>
                </div>
                <p className="text-xs text-muted-foreground">{p.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
