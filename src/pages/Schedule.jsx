import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarClock, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  Trash2, 
  Bell, 
  Flame, 
  Users, 
  Sparkles 
} from 'lucide-react';

export function Schedule() {
  const { tasks, toggleTask, addTask, deleteTask } = useMandalData();
  const { organizers } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('07:30 PM');
  const [newAssignee, setNewAssignee] = useState(organizers[0]?.name || 'All Organisers');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      time: newTime,
      assignedTo: newAssignee
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-400" /> Daily Aarti & Duty Roster (आरती व सेवा)
          </h2>
          <p className="text-xs text-slate-400">
            {completedCount} of {tasks.length} duties completed today
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-saffron py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Cancel' : '+ Add Duty / Aarti'}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="glass-card p-4 bg-slate-900 border-amber-500/40 space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            New Duty / Schedule Event
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event / Task Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Afternoon Prasad Distribution / महाप्रसाद"
                className="input-field text-xs"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Time (वेळ)
              </label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 08:30 PM"
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assigned Volunteer / Organiser
            </label>
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="input-field text-xs"
            >
              <option value="All Organizers (सर्व कार्यकर्ते)">All Organizers (सर्व कार्यकर्ते)</option>
              {organizers.map((org) => (
                <option key={org.id} value={org.name}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-saffron py-1.5 px-4 text-xs font-bold"
            >
              Save Schedule
            </button>
          </div>
        </form>
      )}

      {/* Daily Aarti Info Banner */}
      <div className="glass-card p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Daily Standard Aarti Timings (दैनंदिन आरती वेळ)
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
              <span>🌅 सकाळची आरती: <strong>07:30 AM</strong></span>
              <span>☀️ दुपारचा नैवेद्य / भोग: <strong>12:30 PM</strong></span>
              <span>🌙 संध्याकाळची महाआरती: <strong>08:00 PM</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`glass-card p-4 transition-all cursor-pointer flex items-center justify-between gap-3 ${
              task.completed
                ? 'bg-emerald-950/20 border-emerald-500/20 opacity-75'
                : 'bg-slate-900/70 border-white/10 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-colors flex-shrink-0 ${
                  task.completed
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'border-slate-600 hover:border-amber-400'
                }`}
              >
                {task.completed && <CheckCircle2 className="w-4 h-4 font-bold" />}
              </button>

              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" /> {task.assignedTo}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                {task.time}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove Duty"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
