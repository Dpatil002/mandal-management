import React from 'react';
import { formatCurrency } from '../utils/formatters';

export function StatCard({ title, amount, subtitle, icon: Icon, type = 'neutral', trend, onClick }) {
  const typeStyles = {
    income: {
      gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      textColor: 'text-emerald-400'
    },
    expense: {
      gradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
      border: 'border-rose-500/30 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/20 text-rose-400',
      textColor: 'text-rose-400'
    },
    saffron: {
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      border: 'border-amber-500/40 hover:border-amber-500/60',
      iconBg: 'bg-amber-500/20 text-amber-400',
      textColor: 'text-amber-400'
    },
    neutral: {
      gradient: 'from-blue-500/15 via-slate-800/10 to-transparent',
      border: 'border-white/10 hover:border-white/20',
      iconBg: 'bg-blue-500/20 text-blue-400',
      textColor: 'text-white'
    }
  };

  const style = typeStyles[type] || typeStyles.neutral;

  return (
    <div
      onClick={onClick}
      className={`glass-card p-4 sm:p-5 relative overflow-hidden bg-gradient-to-br ${style.gradient} ${style.border} ${
        onClick ? 'glass-card-interactive' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 truncate">
            {title}
          </p>
          <h3 className={`text-xl sm:text-2xl font-black ${style.textColor} tracking-tight`}>
            {typeof amount === 'number' ? formatCurrency(amount) : amount}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-2xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400">{trend.label}</span>
          <span className={`font-bold ${trend.positive ? 'text-emerald-400' : 'text-slate-300'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
