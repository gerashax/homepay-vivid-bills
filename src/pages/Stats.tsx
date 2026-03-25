import { useMemo } from 'react';
import { useApp, SERVICE_CONFIG, ServiceType } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts';

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function Stats() {
  const { services } = useApp();

  const barData = useMemo(() => {
    return (Object.keys(SERVICE_CONFIG) as ServiceType[]).map(type => {
      const svc = services.filter(s => s.type === type);
      const now = new Date();
      const total = svc.reduce((sum, s) => {
        return sum + s.payments
          .filter(p => {
            const d = new Date(p.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((s2, p) => s2 + p.amount, 0);
      }, 0);
      return { name: SERVICE_CONFIG[type].icon, type, total, fill: SERVICE_CONFIG[type].hex };
    }).filter(d => d.total > 0);
  }, [services]);

  const lineData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const total = services.reduce((sum, s) =>
        sum + s.payments
          .filter(p => {
            const d = new Date(p.date);
            return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
          })
          .reduce((s2, p) => s2 + p.amount, 0)
      , 0);
      return { month: monthNames[m.getMonth()], total };
    });
  }, [services]);

  const mostExpensive = useMemo(() => {
    const now = new Date();
    let max = { type: '' as ServiceType, total: 0 };
    (Object.keys(SERVICE_CONFIG) as ServiceType[]).forEach(type => {
      const total = services
        .filter(s => s.type === type)
        .reduce((sum, s) =>
          sum + s.payments
            .filter(p => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
            .reduce((s2, p) => s2 + p.amount, 0)
        , 0);
      if (total > max.total) max = { type, total };
    });
    return max;
  }, [services]);

  const monthlyAvg = useMemo(() => {
    const totals = lineData.map(d => d.total).filter(t => t > 0);
    return totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  }, [lineData]);

  const highestMonth = useMemo(() => {
    const max = lineData.reduce((a, b) => a.total > b.total ? a : b, { month: '', total: 0 });
    return max;
  }, [lineData]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Estadísticas</h1>

      {/* Bar Chart */}
      <div className="glass-card p-4 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Gasto por servicio (este mes)</p>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 16 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">Sin datos este mes</p>
        )}
      </div>

      {/* Line Chart */}
      <div className="glass-card p-4 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Más caro del mes</p>
            <p className="font-display font-bold text-foreground mt-1">
              {mostExpensive.type ? `${SERVICE_CONFIG[mostExpensive.type].icon} ${SERVICE_CONFIG[mostExpensive.type].label}` : '—'}
            </p>
          </div>
          <p className="font-display font-bold text-lg" style={{ color: mostExpensive.type ? SERVICE_CONFIG[mostExpensive.type].hex : undefined }}>
            ${mostExpensive.total.toLocaleString()}
          </p>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Mes más alto</p>
            <p className="font-display font-bold text-foreground mt-1">{highestMonth.month || '—'}</p>
          </div>
          <p className="font-display font-bold text-lg text-primary">${highestMonth.total.toLocaleString()}</p>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Promedio mensual</p>
            <p className="font-display font-bold text-foreground mt-1">Total</p>
          </div>
          <p className="font-display font-bold text-lg text-primary">${monthlyAvg.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
