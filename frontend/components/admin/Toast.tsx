'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

// Global event bus
const listeners: ((toast: ToastItem) => void)[] = [];

export function toast(message: string, type: ToastType = 'info') {
  const item: ToastItem = { id: Math.random().toString(36).slice(2), type, message };
  listeners.forEach((fn) => fn(item));
}

toast.success = (msg: string) => toast(msg, 'success');
toast.error = (msg: string) => toast(msg, 'error');
toast.warning = (msg: string) => toast(msg, 'warning');
toast.info = (msg: string) => toast(msg, 'info');

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100',
  error: 'bg-red-900/90 border-red-500/40 text-red-100',
  warning: 'bg-amber-900/90 border-amber-500/40 text-amber-100',
  info: 'bg-blue-900/90 border-blue-500/40 text-blue-100',
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setToasts((prev) => [...prev.slice(-4), item]);
      setTimeout(() => remove(item.id), 4000);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [remove]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`
              flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl
              backdrop-blur-md pointer-events-auto
              animate-[slideInRight_0.3s_cubic-bezier(0.22,1,0.36,1)]
              max-w-sm ${COLORS[t.type]}
            `}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${ICON_COLORS[t.type]}`} />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
