import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export default function Welcome() {
  const { setUserName } = useApp();
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm text-center"
      >
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-6"
        >
          🏠
        </motion.p>

        <h1 className="text-3xl font-display font-bold text-foreground mb-2">HomePay</h1>
        <p className="text-muted-foreground text-sm mb-10">Gestor visual de pagos del hogar</p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="¿Cómo te llamas?"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full h-14 rounded-2xl bg-card border border-border px-5 text-foreground placeholder:text-muted-foreground text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-lg disabled:opacity-30 transition-opacity"
          >
            Comenzar
          </motion.button>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Tus datos se guardan solo en este dispositivo
        </p>
      </motion.div>
    </div>
  );
}
