import { useState } from 'react';
import { useApp, SERVICE_CONFIG, ServiceType } from '@/context/AppContext';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Trash2, UserPlus, X } from 'lucide-react';

export default function Settings() {
  const { services, members, reminders, updateReminders, addMember, removeMember, clearHistory, clearAllServices } = useApp();
  const [newMember, setNewMember] = useState('');

  const handleAddMember = () => {
    if (newMember.trim()) {
      addMember(newMember.trim());
      setNewMember('');
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Recordatorios</h1>

      {/* Main Toggle */}
      <div className="glass-card p-4 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-primary" />
            <div>
              <p className="font-medium text-foreground">Notificaciones</p>
              <p className="text-xs text-muted-foreground">Recordatorios de pago</p>
            </div>
          </div>
          <Switch
            checked={reminders.enabled}
            onCheckedChange={v => updateReminders({ enabled: v })}
          />
        </div>
      </div>

      {/* Frequency & Hour */}
      {reminders.enabled && (
        <div className="glass-card p-4 mb-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Frecuencia</p>
            <div className="flex gap-2">
              {(['weekly', 'daily'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => updateReminders({ frequency: f })}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                    reminders.frequency === f
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-card text-muted-foreground'
                  }`}
                >
                  {f === 'weekly' ? '📅 Semanal' : '🔔 Diario'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Hora preferida</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[8, 9, 10, 12, 14, 18, 20].map(h => (
                <button
                  key={h}
                  onClick={() => updateReminders({ hour: h })}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    reminders.hour === h
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground'
                  }`}
                >
                  {h}:00
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Per-service toggles */}
      {reminders.enabled && (
        <div className="glass-card p-4 mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Por servicio</p>
          <div className="space-y-3">
            {services.map(s => {
              const cfg = SERVICE_CONFIG[s.type];
              const key = s.id;
              const on = reminders.serviceToggles[key] !== false;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cfg.icon}</span>
                    <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                  </div>
                  <Switch
                    checked={on}
                    onCheckedChange={v =>
                      updateReminders({ serviceToggles: { ...reminders.serviceToggles, [key]: v } })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <h2 className="text-lg font-display font-bold text-foreground mb-4 mt-8">Configuración</h2>

      {/* Members */}
      <div className="glass-card p-4 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Miembros del hogar</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {members.map(m => (
            <span key={m} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm">
              {m}
              {m !== 'Yo' && (
                <button onClick={() => removeMember(m)} className="text-muted-foreground hover:text-destructive">
                  <X size={14} />
                </button>
              )}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nuevo miembro"
            value={newMember}
            onChange={e => setNewMember(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMember()}
            className="bg-card border-border h-10"
          />
          <Button onClick={handleAddMember} size="sm" className="h-10 px-4">
            <UserPlus size={16} />
          </Button>
        </div>
      </div>

      {/* Clear History */}
      <div className="glass-card p-4">
        <button
          onClick={clearHistory}
          className="flex items-center gap-3 text-destructive w-full"
        >
          <Trash2 size={18} />
          <span className="text-sm font-medium">Limpiar historial de pagos</span>
        </button>
      </div>
    </div>
  );
}
