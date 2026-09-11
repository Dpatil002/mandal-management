import React from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { StatCard } from '../components/StatCard';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { 
  IndianRupee, 
  Receipt, 
  Wallet, 
  QrCode, 
  PlusCircle, 
  Share2, 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export function Dashboard({ onOpenAddVargani, onOpenAddExpense, onOpenQr, onOpenReceipt, onNavigate }) {
  const { vargani, expenses, tasks, stats, toggleTask, config } = useMandalData();

  const recentVargani = vargani.slice(0, 5);

  return (
    <div className="space-y-5 pb-12">
      {/* Target Progress Banner */}
      <div className="glass-card p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 border-amber-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Festival Target Collection (संकल्प)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {stats.progressPercent}% Achieved
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {formatCurrency(stats.totalReceived)}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {formatCurrency(stats.targetGoal)} Goal
              </span>
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Remaining to Target</span>
            <span className="text-sm font-bold text-amber-300">
              {formatCurrency(Math.max(0, stats.targetGoal - stats.totalReceived))}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-900/80 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, stats.progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Today's Collection"
          amount={stats.todayReceived}
          subtitle="Collected Today"
          icon={IndianRupee}
          type="income"
        />

        <StatCard
          title="Today's Expenses"
          amount={stats.todayExpenses}
          subtitle="Spent Today"
          icon={Receipt}
          type="expense"
        />

        <StatCard
          title="Net Cash in Hand"
          amount={stats.netBalance}
          subtitle="Total Balance"
          icon={Wallet}
          type="saffron"
        />

        <StatCard
          title="Total Vargani"
          amount={stats.totalReceived}
          subtitle={`${stats.donorCount} Devotees`}
          icon={TrendingUp}
          type="neutral"
        />
      </div>

      {/* Quick Action Tray */}
      <div className="glass-card p-4 bg-slate-900/80 border-white/10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Pandal Actions (त्वरित कृती)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onOpenAddVargani}
            className="btn-saffron py-3 px-3 text-xs flex-col sm:flex-row gap-2 text-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Record Vargani</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="btn-secondary py-3 px-3 text-xs flex-col sm:flex-row gap-2 text-center hover:text-rose-400 hover:border-rose-500/30"
          >
            <Receipt className="w-4 h-4 text-rose-400" />
            <span>+ Record Expense</span>
          </button>

          <button
            onClick={() => onOpenQr('')}
            className="btn-secondary py-3 px-3 text-xs flex-col sm:flex-row gap-2 text-center hover:text-amber-400 hover:border-amber-500/30"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Mandal UPI QR</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="btn-secondary py-3 px-3 text-xs flex-col sm:flex-row gap-2 text-center hover:text-blue-400 hover:border-blue-500/30"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Audit Reports</span>
          </button>
        </div>
      </div>

      {/* Two-Column Section: Live Activity Feed & Daily Aarti Duties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Vargani Contributions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" /> Recent Contributions
              </h3>
              <p className="text-xs text-slate-400">Latest donor vargani entries</p>
            </div>
            <button
              onClick={() => onNavigate('vargani')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View All ({vargani.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentVargani.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No contributions recorded yet. Tap "+ Record Vargani" to start!
              </div>
            ) : (
              recentVargani.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenReceipt(item)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate">
                        {item.donorName}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 bg-slate-800 rounded">
                        {item.receiptNo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.mode} • {formatDate(item.createdAt)} {item.address ? `• ${item.address}` : ''}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-emerald-400 block">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      item.status === 'Received' ? 'text-emerald-500' : 'text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Aarti Schedule & Volunteer Duties */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-400" /> Today's Aarti & Pandal Duties
              </h3>
              <p className="text-xs text-slate-400">Daily volunteer checklist & schedule</p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Full Roster <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-emerald-950/20 border-emerald-500/20 opacity-75'
                    : 'bg-slate-900/60 border-white/5 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-600 hover:border-amber-400'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Assigned to: <strong className="text-slate-300">{task.assignedTo}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-slate-950/60 px-2 py-1 rounded-lg flex-shrink-0 border border-white/5">
                  <Clock className="w-3 h-3" />
                  {task.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
