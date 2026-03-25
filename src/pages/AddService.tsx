import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Save } from 'lucide-react';
import { useApp, SERVICE_CONFIG, ServiceType } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const serviceTypes: ServiceType[] = ['water', 'electricity', 'internet', 'gas', 'phone'];

export default function AddService() {
  const navigate = useNavigate();
  const { addService, members } = useApp();
  const [type, setType] = useState<ServiceType | null>(null);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [responsible, setResponsible] = useState<'solo' | 'shared'>('solo');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['Yo']);
  const [notes, setNotes] = useState('');

  const activeColor = type ? SERVICE_CONFIG[type].hex : undefined;

  const handleSave = () => {
    if (!type || !amount || !dueDate) return;
    addService({
      type,
      amount: parseFloat(amount),
      dueDate,
      responsible,
      members: responsible === 'shared' ? selectedMembers : ['Yo'],
      notes,
    });
    navigate('/');
  };

  const toggleMember = (m: string) => {
    setSelectedMembers(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 px-4 pt-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Nuevo Servicio</h1>
      </div>

      {/* Service Type Selector */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wider">Tipo de servicio</p>
        <div className="grid grid-cols-5 gap-2">
          {serviceTypes.map(st => {
            const cfg = SERVICE_CONFIG[st];
            const selected = type === st;
            return (
              <button
                key={st}
                onClick={() => setType(st)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                style={{
                  backgroundColor: selected ? `${cfg.hex}20` : 'hsl(var(--card))',
                  border: selected ? `2px solid ${cfg.hex}` : '2px solid transparent',
                }}
              >
                <span className="text-2xl">{cfg.icon}</span>
                <span className="text-[10px] font-medium text-foreground">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-5">
        <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-2">Monto mensual</label>
        <Input
          type="number"
          placeholder="$0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="text-lg font-display h-12 bg-card border-border"
          style={activeColor ? { borderColor: `${activeColor}50` } : {}}
        />
      </div>

      {/* Due Date */}
      <div className="mb-5">
        <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-2">Fecha límite</label>
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="h-12 bg-card border-border"
          style={activeColor ? { borderColor: `${activeColor}50` } : {}}
        />
      </div>

      {/* Responsible */}
      <div className="mb-5">
        <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-2">Responsable</label>
        <div className="flex gap-2">
          {(['solo', 'shared'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setResponsible(opt)}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: responsible === opt
                  ? (activeColor ? `${activeColor}20` : 'hsl(var(--primary) / 0.15)')
                  : 'hsl(var(--card))',
                color: responsible === opt
                  ? (activeColor || 'hsl(var(--primary))')
                  : 'hsl(var(--muted-foreground))',
                border: responsible === opt
                  ? `1px solid ${activeColor || 'hsl(var(--primary))'}50`
                  : '1px solid transparent',
              }}
            >
              {opt === 'solo' ? 'Yo solo' : 'Compartido'}
            </button>
          ))}
        </div>
      </div>

      {/* Members (if shared) */}
      {responsible === 'shared' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-5 overflow-hidden"
        >
          <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-2">Miembros</label>
          <div className="flex flex-wrap gap-2">
            {members.map(m => (
              <button
                key={m}
                onClick={() => toggleMember(m)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: selectedMembers.includes(m)
                    ? (activeColor ? `${activeColor}25` : 'hsl(var(--primary) / 0.15)')
                    : 'hsl(var(--card))',
                  color: selectedMembers.includes(m) ? (activeColor || 'hsl(var(--foreground))') : 'hsl(var(--muted-foreground))',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notes */}
      <div className="mb-8">
        <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-2">Notas (opcional)</label>
        <Textarea
          placeholder="Agrega una nota..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="bg-card border-border resize-none"
          rows={3}
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!type || !amount || !dueDate}
        className="w-full h-14 text-base font-display font-semibold rounded-xl"
        style={activeColor && type && amount && dueDate ? {
          backgroundColor: activeColor,
          color: '#fff',
        } : {}}
      >
        <Save size={20} className="mr-2" />
        Guardar Servicio
      </Button>
    </motion.div>
  );
}
