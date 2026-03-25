import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp, SERVICE_CONFIG, ServiceType } from '@/context/AppContext';
import { Receipt } from 'lucide-react';

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function History() {
  const { services } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [filterType, setFilterType] = useState<ServiceType | 'all'>('all');

  const allPayments = useMemo(() => {
    return services.flatMap(s =>
      s.payments.map(p => ({ ...p, serviceType: s.type }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services]);

  const filtered = allPayments.filter(p => {
    const d = new Date(p.date);
    const monthMatch = d.getMonth() === selectedMonth;
    const typeMatch = filterType === 'all' || services.find(s => s.id === p.serviceId)?.type === filterType;
    return monthMatch && typeMatch;
  });

  const monthTotal = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Historial</h1>

      {/* Month Total */}
      <div className="glass-card p-4 mb-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total {months[selectedMonth]}</p>
        <p className="text-3xl font-display font-bold text-foreground mt-1">${monthTotal.toLocaleString()}</p>
      </div>

      {/* Month Selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {months.map((m, i) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedMonth === i ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Service Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-1 px-1">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
          }`}
        >
          Todos
        </button>
        {(Object.keys(SERVICE_CONFIG) as ServiceType[]).map(st => {
          const cfg = SERVICE_CONFIG[st];
          return (
            <button
              key={st}
              onClick={() => setFilterType(st)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors"
              style={{
                backgroundColor: filterType === st ? `${cfg.hex}25` : 'hsl(var(--card))',
                color: filterType === st ? cfg.hex : 'hsl(var(--muted-foreground))',
              }}
            >
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Payment List */}
      <div className="space-y-2">
        {filtered.map((p, i) => {
          const svc = services.find(s => s.id === p.serviceId);
          const cfg = svc ? SERVICE_CONFIG[svc.type] : null;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: cfg ? `${cfg.hex}20` : 'hsl(var(--card))' }}
              >
                {cfg?.icon || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{cfg?.label || 'Servicio'}</p>
                <p className="text-xs text-muted-foreground">{p.paidBy} · {p.date}</p>
              </div>
              <p className="font-display font-bold text-foreground">${p.amount.toLocaleString()}</p>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Receipt size={48} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Sin pagos registrados</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Los pagos aparecerán aquí</p>
        </div>
      )}
    </div>
  );
}
