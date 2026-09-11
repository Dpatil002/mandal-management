import React from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export function OrganiserDashboard({
  onOpenAddVargani,
  onOpenAddExpense,
  onOpenReport,
  onOpenEditPublic,
  onOpenOrganisers,
  onOpenProof,
  onNavigateToVargani,
  onNavigateToExpenses,
  onNavigateToTasks,
  onNavigateToDhol
}) {
  const { stats, vargani, tasks, toggleTask } = useMandalData();
  const { currentOrganizer, logout, organizers } = useAuth();

  const pendingVargani = vargani.filter((v) => v.status === 'pending');
  const pendingVarganiSum = pendingVargani.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className="flex flex-col w-full px-4 py-4 max-w-xl mx-auto space-y-4 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      {/* Portal Context & Header Bar */}
      <div className="flex flex-col gap-2 bg-white/95 border border-[#F0DFD5] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Admin Mode</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 text-xs text-[#6B5E57] hover:text-[#8B2616] transition-colors py-1 px-2.5 rounded-full hover:bg-[#F0DFD5]/40 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>बाहेर पडा (Log out)</span>
          </button>
        </div>

        <div className="flex flex-row items-baseline justify-between gap-1 pt-1">
          <div>
            <h2 className="text-xl font-bold text-[#8B2616]">Organiser Portal</h2>
            <span className="text-xs text-[#6B5E57]">उत्सव समिती २०२६</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-[#F0DFD5]/50 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[#8B2616] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <span className="text-xs text-[#241913] font-medium">Mandal Sevekari</span>
          </div>
        </div>

        <div className="mt-2 pt-2.5 border-t border-[#F0DFD5]/70 flex items-center justify-between gap-2 bg-[#FFF1EB]/50 rounded-xl p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#8B2616] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
              {currentOrganizer?.name?.slice(0, 2).toUpperCase() || 'RS'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#241913] truncate">{currentOrganizer?.name || 'Ramesh Shinde'}</span>
              <span className="text-[11px] text-[#6B5E57]">मो. {currentOrganizer?.phone || '98220-12345'}</span>
            </div>
          </div>
          {onOpenOrganisers && (
            <button
              onClick={onOpenOrganisers}
              type="button"
              className="px-2.5 py-1 rounded-lg bg-white border border-[#DECDB9] text-[#7A1C16] text-[11px] font-bold hover:bg-[#FAF6EE] transition-colors shrink-0 shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">manage_accounts</span>
              <span>Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Management Actions Grid (Cultural Events, Public Schedule & Manage Organisers) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Cultural Events Day-Wise CTA */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#FFF1EB] via-[#FFEAE0] to-[#FAF4ED] border border-[#8B2616]/20 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#8B2616] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">theater_comedy</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-xs font-bold text-[#241913] leading-tight truncate">Cultural Events</h3>
              <span className="text-[10.5px] text-[#8B2616] font-semibold truncate">Day 1 to 10 कार्यक्रम</span>
            </div>
          </div>
          <button
            onClick={() => onOpenEditPublic && onOpenEditPublic('cultural')}
            type="button"
            className="rounded-xl py-1.5 px-2.5 font-bold text-xs bg-[#8B2616] text-white hover:bg-[#6b0e03] active:scale-95 transition-all inline-flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>Edit</span>
          </button>
        </div>

        {/* Edit Public View / Aarti & Mankari CTA */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#FFFDF9] border border-[#EAE0D2] shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#EAE0D2] text-[#7A1C16] flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-xs font-bold text-[#241913] leading-tight truncate">Aarti &amp; Mankari</h3>
              <span className="text-[10.5px] text-[#6B5E57] truncate">वेळापत्रक व मानकरी</span>
            </div>
          </div>
          <button
            onClick={() => onOpenEditPublic && onOpenEditPublic('mankari')}
            type="button"
            className="rounded-xl py-1.5 px-2.5 font-bold text-xs bg-white border border-[#DECDB9] text-[#7A1C16] hover:bg-[#FAF6EE] active:scale-95 transition-all inline-flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>Set</span>
          </button>
        </div>

        {/* Manage Organisers CTA */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#F5FBFD] via-[#EAF5F8] to-[#FAF6EE] border border-[#1C5D6C]/20 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#1C5D6C] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-xs font-bold text-[#241913] leading-tight truncate">Organisers List</h3>
              <span className="text-[10.5px] text-[#6B5E57] truncate">कार्यकर्ते व्यवस्थापन</span>
            </div>
          </div>
          <button
            onClick={onOpenOrganisers}
            type="button"
            className="rounded-xl py-1.5 px-2.5 font-bold text-xs bg-[#1C5D6C] text-white hover:bg-[#154652] active:scale-95 transition-all inline-flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">person_add</span>
            <span>Team</span>
          </button>
        </div>
      </div>

      {/* Key Metrics / Summary Cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* Total Collected Card */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#8B2616]/10 flex items-center justify-center text-[#8B2616]">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  savings
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base text-[#241913] font-semibold leading-tight">Total Collected</span>
                <span className="text-xs text-[#6B5E57]">एकूण जमा वर्गणी</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-0.5 bg-[#B1F0CE] text-[#002114] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
            </span>
          </div>
          <div className="flex items-baseline gap-2 z-10 pt-1">
            <span className="text-3xl font-extrabold text-[#8B2616] tracking-tight">
              {formatCurrency(stats.totalReceived)}
            </span>
            <span className="text-sm text-[#6B5E57]">/ {formatCurrency(stats.targetGoal)}</span>
          </div>
          <div className="w-full bg-[#F0DFD5] h-2 rounded-full overflow-hidden z-10">
            <div
              className="bg-[#8B2616] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, stats.progressPercent))}%` }}
            ></div>
          </div>
        </div>

        {/* Total Spent & Treasury Balance Card */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#FD8359]/15 flex items-center justify-center text-[#A23F1A]">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base text-[#241913] font-semibold leading-tight">Total Spent</span>
                <span className="text-xs text-[#6B5E57]">एकूण खर्च</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#A23F1A] tracking-tight">
                {formatCurrency(stats.totalExpenses)}
              </span>
            </div>
          </div>
          <div className="bg-[#FFF1EB] p-2.5 rounded-xl flex items-center justify-between z-10 border border-[#F0DFD5]/60">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-800 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
              <span className="text-xs text-[#241913] font-semibold">Treasury Balance:</span>
            </div>
            <span className="text-base text-emerald-900 font-bold">
              {formatCurrency(stats.netBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Download Financial Report */}
      <div className="flex flex-col gap-2.5 bg-white/95 border border-[#F0DFD5] p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#8B2616]/10 flex items-center justify-center text-[#8B2616] shrink-0">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[#241913] leading-tight truncate">Financial Reports</span>
              <span className="text-xs text-[#6B5E57] truncate">हिशोब व वर्गणी अहवाल २०२६</span>
            </div>
          </div>
          <button
            onClick={onOpenReport}
            type="button"
            className="rounded-xl py-2 px-3.5 font-bold text-xs bg-[#8B2616] text-white hover:bg-[#6b0e03] active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download</span>
          </button>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#F0DFD5]/60">
          <button
            onClick={onOpenReport}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-[#D9C4B7] bg-white text-xs font-semibold text-[#8B2616] hover:bg-[#FFF5EE] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#A23F1A]">picture_as_pdf</span>
            <span>PDF Report</span>
          </button>
          <button
            onClick={onOpenReport}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-[#D9C4B7] bg-white text-xs font-semibold text-emerald-800 hover:bg-[#FFF5EE] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-700">table_view</span>
            <span>Google Sheet</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] px-1">Quick Actions</span>
        <div className="grid grid-cols-2 gap-3">
          {/* Add Vargani */}
          <button
            onClick={onOpenAddVargani}
            className="group flex flex-col justify-between text-left rounded-2xl p-4 bg-[#8B2616] text-white shadow-xs min-h-[100px] active:scale-[0.98] transition-all hover:bg-[#6b0e03] cursor-pointer"
            type="button"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-white">add_circle</span>
              </div>
              <span className="material-symbols-outlined text-white/70 group-hover:translate-x-0.5 transition-transform text-[18px]">arrow_forward</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-sm font-bold text-white leading-tight">Add Vargani</span>
              <span className="text-[11px] text-white/80 font-medium mt-0.5">नवीन वर्गणी</span>
            </div>
          </button>

          {/* Add Expense */}
          <button
            onClick={onOpenAddExpense}
            className="group flex flex-col justify-between text-left rounded-2xl p-4 bg-white border border-[#F0DFD5] shadow-xs min-h-[100px] active:scale-[0.98] hover:bg-[#FFF5EE] transition-all cursor-pointer"
            type="button"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-full bg-[#8B2616]/10 flex items-center justify-center text-[#8B2616]">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <span className="material-symbols-outlined text-[#6B5E57] group-hover:translate-x-0.5 transition-transform text-[18px]">arrow_forward</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-sm font-bold text-[#241913] leading-tight">Add Expense</span>
              <span className="text-[11px] text-[#6B5E57] font-medium mt-0.5">खर्च नोंदवा</span>
            </div>
          </button>

          {/* Tasks */}
          <button
            onClick={onNavigateToTasks}
            className="group flex flex-col justify-between text-left rounded-2xl p-4 bg-white border border-[#F0DFD5] shadow-xs min-h-[100px] active:scale-[0.98] hover:bg-[#FFF5EE] transition-all cursor-pointer"
            type="button"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-full bg-[#8B2616]/10 flex items-center justify-center text-[#8B2616]">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  checklist
                </span>
              </div>
              <span className="bg-[#FD8359] text-[#390C00] px-2 py-0.5 rounded-full text-xs font-bold">
                {pendingTasksCount}
              </span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-sm font-bold text-[#241913] leading-tight">Tasks</span>
              <span className="text-[11px] text-[#6B5E57] font-medium mt-0.5">कामे व वाटप</span>
            </div>
          </button>

          {/* Dhol-Tasha */}
          <button
            onClick={onNavigateToDhol}
            className="group flex flex-col justify-between text-left rounded-2xl p-4 bg-white border border-[#F0DFD5] shadow-xs min-h-[100px] active:scale-[0.98] hover:bg-[#FFF5EE] transition-all cursor-pointer"
            type="button"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-full bg-[#8B2616]/10 flex items-center justify-center text-[#8B2616]">
                <span className="material-symbols-outlined text-[20px]">music_note</span>
              </div>
              <span className="material-symbols-outlined text-[#6B5E57] group-hover:translate-x-0.5 transition-transform text-[18px]">arrow_forward</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-sm font-bold text-[#241913] leading-tight">Dhol-Tasha</span>
              <span className="text-[11px] text-[#6B5E57] font-medium mt-0.5">पथक नियोजन</span>
            </div>
          </button>
        </div>
      </div>

      {/* Pending Tasks Section */}
      <div className="flex flex-col gap-3 rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs">
        <div className="flex items-center justify-between pb-1 border-b border-[#F0DFD5]/60">
          <div>
            <h3 className="text-lg font-bold text-[#8B2616] leading-tight">Pending Tasks</h3>
            <span className="text-xs text-[#6B5E57] font-medium">तातडीची कामे</span>
          </div>
          <button
            onClick={onNavigateToTasks}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8B2616] hover:underline cursor-pointer"
          >
            <span>View All ({tasks.length})</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-2.5">
          {/* Pending online vargani review task (if any pending) */}
          {pendingVargani.length > 0 && (
            <div className="rounded-xl p-3.5 bg-white border border-[#F0DFD5] flex flex-col gap-2.5 hover:bg-[#FFF5EE] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 min-w-[20px] mt-0.5 flex items-center justify-center text-[#8B2616]">
                  <span className="material-symbols-outlined text-[20px]">pending</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="task-text text-sm text-[#241913] font-semibold leading-snug">
                      Verify {pendingVargani.length} online UPI Vargani
                    </span>
                    <span className="bg-[#FFDBD0] text-[#390C00] text-xs px-2 py-0.5 rounded-full font-bold">
                      {formatCurrency(pendingVarganiSum)}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B5E57] mt-0.5">Needs transaction approval</span>
                </div>
              </div>
              <div className="flex justify-end pl-8">
                <button
                  onClick={onNavigateToVargani}
                  className="rounded-xl py-2 px-3.5 font-semibold text-xs border border-[#D9C4B7] bg-white text-[#8B2616] hover:bg-[#FFF5EE] active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Review Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Dynamic tasks from state */}
          {tasks.slice(0, 3).map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={task.id}
                className={`rounded-xl p-3.5 border flex items-start gap-3 transition-colors ${
                  isDone ? 'bg-white/70 border-[#F0DFD5]/70 opacity-75' : 'bg-white border-[#F0DFD5] hover:bg-[#FFF5EE]'
                }`}
              >
                <label className="relative flex items-center justify-center w-5 h-5 min-w-[20px] mt-0.5 cursor-pointer">
                  <input
                    checked={isDone}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 rounded accent-[#8B2616] cursor-pointer"
                    type="checkbox"
                  />
                </label>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`task-text text-sm leading-snug font-medium ${isDone ? 'line-through text-[#6B5E57]' : 'text-[#241913]'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-[#A23F1A] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> {task.time || 'Today'}
                    </span>
                    <span className="text-[#6B5E57] text-[11px]">• {task.assignedTo || 'Sevekari'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organisers Directory Card */}
      <div className="flex flex-col gap-3 rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0DFD5]/60">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8B2616] text-[20px]">contacts</span>
              <h3 className="text-base font-bold text-[#8B2616] leading-tight">Organisers Directory</h3>
            </div>
            <span className="text-xs text-[#6B5E57] font-medium">व्यवस्थापक संपर्क यादी ({organizers?.length || 0} सेवेकरी)</span>
          </div>
          <button
            type="button"
            onClick={onOpenOrganisers}
            className="text-xs font-bold text-[#8B2616] bg-[#FFF1EB] hover:bg-[#FFE5DB] px-3 py-1.5 rounded-xl border border-[#F0DFD5] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">edit</span>
            <span>Edit यादी</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {organizers && organizers.map((org) => {
            const cleanPhone = (org.phone || '').replace(/\D/g, '').slice(-10);
            return (
              <div
                key={org.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-[#F0DFD5] hover:border-[#DECDB9] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FAF6EE] border border-[#EAE0D2] text-[#7A1C16] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {org.name ? org.name.slice(0, 2).toUpperCase() : 'OK'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-[#241913] truncate">{org.name}</span>
                    <span className="text-xs text-[#6B5E57] font-medium">मो. +91 {cleanPhone || 'XXXXXXXXXX'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenOrganisers}
                    className="w-8 h-8 rounded-xl bg-white border border-[#DECDB9] text-[#7A1C16] hover:bg-[#F2EADB] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    title="Change Name / Edit"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  {cleanPhone && (
                    <>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="w-8 h-8 rounded-xl bg-white border border-[#D9C4B7] text-[#8B2616] hover:bg-[#FFDBD0] flex items-center justify-center transition-colors shadow-xs"
                        title="Call"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-600 text-emerald-800 hover:bg-emerald-200 flex items-center justify-center transition-colors shadow-xs"
                        title="WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Broadcast Banner */}
      <div className="flex items-center justify-between rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8B2616]/10 flex items-center justify-center text-[#8B2616] shrink-0">
            <span className="material-symbols-outlined text-[20px]">campaign</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#241913] leading-tight">WhatsApp Broadcast</span>
            <span className="text-xs text-[#6B5E57]">Evening Aarti notice pending</span>
          </div>
        </div>
        <a
          href="https://wa.me/?text=इंद्रायणी%20विहार%20गणेशोत्सव%20२०२६:%20आज%20संध्याकाळी%20७:३०%20वाजता%20महाआरती%20आहे.%20सर्व%20भक्तांनी%20उपस्थित%20राहावे."
          target="_blank"
          rel="noreferrer"
          aria-label="Send WhatsApp Notice"
          className="rounded-xl py-2.5 px-4 font-semibold text-xs border border-[#D9C4B7] bg-white text-[#8B2616] hover:bg-[#FFF5EE] active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-xs"
        >
          <span>Send</span>
          <span className="material-symbols-outlined text-[16px]">send</span>
        </a>
      </div>
    </div>
  );
}

