import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { validateTaskTitle, sanitizeText } from '../utils/validators';

export function OrganiserTasks() {
  const { tasks, toggleTask, addTask, deleteTask } = useMandalData();
  const { organizers } = useAuth();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'todo', 'done'
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState(organizers[0]?.name || 'All Organizers');
  const [taskError, setTaskError] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'todo') return t.status !== 'done';
    if (activeFilter === 'done') return t.status === 'done';
    return true;
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    setTaskError('');

    const titleVal = validateTaskTitle(newTitle);
    if (!titleVal.isValid) {
      setTaskError(titleVal.error);
      return;
    }

    addTask({
      title: titleVal.sanitized,
      time: 'Today',
      assignedTo: sanitizeText(newAssignee) || 'All Organizers',
      category: 'Seva'
    });

    setNewTitle('');
  };

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const pendingCount = tasks.filter((t) => t.status !== 'done').length;

  const todoTasks = filteredTasks.filter((t) => t.status !== 'done');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="flex flex-col w-full px-4 pt-1 pb-20 max-w-xl mx-auto space-y-6 sm:space-y-7 font-['Plus_Jakarta_Sans','Mukta',sans-serif] animate-fade-in">
      {/* Quick Add Card with live counts */}
      <div className="flex flex-col bg-white rounded-2xl p-4 border border-[#F0DFD5] shadow-xs">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#F0DFD5]/60">
          <div className="flex items-center gap-2 text-xs text-[#57423E] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#FD8359] animate-pulse"></span>
            <span>{pendingCount} Pending Tasks • {completedCount} Done</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFEAE0] text-[#6B0E03] text-xs font-bold border border-[#F5DACB]">
            <span>{pendingCount} Pending</span>
          </div>
        </div>

        {/* Quick Add Inline Form */}
        <div className="mt-2.5">
          {taskError && (
            <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{taskError}</span>
            </div>
          )}
          <form className="flex items-center gap-2" onSubmit={handleCreateTask}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <div className="flex-1 flex items-center bg-white border border-[#D9C4B7] rounded-xl px-3.5 py-2.5">
                <span className="material-symbols-outlined text-[#8B716C] text-[18px] mr-2 shrink-0">add_task</span>
                <input
                  aria-label="New task description"
                  className="w-full bg-transparent text-[#241913] placeholder:text-[#8B716C] text-sm focus:outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Add task (उदा. प्रसाद वाटप वाटणी...)"
                  type="text"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-[#D9C4B7] rounded-xl px-2.5 py-2 shrink-0">
                  <span className="material-symbols-outlined text-[#8B716C] text-[18px] mr-1.5 shrink-0">person_add</span>
                  <select
                    aria-label="Assign To / जबाबदारी द्या"
                    className="bg-transparent text-xs font-semibold text-[#241913] focus:outline-none cursor-pointer pr-1"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                  >
                    {organizers.map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                    <option value="All Organizers">सर्व कार्यकर्ते</option>
                  </select>
                </div>
                <button
                  aria-label="Add task"
                  className="rounded-xl px-4 py-2.5 bg-[#8B2616] text-white font-semibold text-xs shadow-sm flex items-center gap-1 shrink-0 hover:bg-[#6B0E03] active:scale-95 transition-all cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div aria-label="Task filters" className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        <button
          onClick={() => setActiveFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#8B2616] text-white shadow-sm'
              : 'border border-[#D9C4B7] bg-white text-[#6B5E57] hover:bg-[#FFF8F6]'
          }`}
          role="tab"
          type="button"
        >
          <span>All</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#fae4da] text-[#241913]'}`}>
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('todo')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeFilter === 'todo'
              ? 'bg-[#8B2616] text-white shadow-sm'
              : 'border border-[#D9C4B7] bg-white text-[#6B5E57] hover:bg-[#FFF8F6]'
          }`}
          role="tab"
          type="button"
        >
          <span>To Do</span>
          <span className="px-1.5 py-0.5 bg-[#FFEAE0] text-[#8B2616] rounded-full text-[10px] leading-none font-bold">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('done')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeFilter === 'done'
              ? 'bg-[#8B2616] text-white shadow-sm'
              : 'border border-[#D9C4B7] bg-white text-[#6B5E57] hover:bg-[#FFF8F6]'
          }`}
          role="tab"
          type="button"
        >
          <span>Done</span>
          <span className="px-1.5 py-0.5 bg-[#E6F4EA] text-[#0E5138] rounded-full text-[10px] leading-none font-bold">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Task Items List */}
      <div className="flex flex-col space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#F0DFD5] text-xs text-[#6B5E57]">
            <span className="material-symbols-outlined text-[36px] text-[#D9C4B7] mb-2">checklist</span>
            <p className="font-bold text-[#241913]">या प्रकारात कोणतेही काम उपलब्ध नाही</p>
          </div>
        ) : (
          <>
            {/* Uncompleted (To Do) Tasks */}
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="task-item group flex items-start gap-3 bg-white border border-[#F0DFD5] rounded-xl p-3.5 shadow-xs transition-all"
              >
                <button
                  aria-label="Toggle task completion"
                  className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg hover:bg-[#FFEAE0] transition-colors mt-0.5 cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                  type="button"
                >
                  <div className="w-5 h-5 rounded-md border-2 border-[#D9C4B7] bg-white flex items-center justify-center text-transparent transition-all">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#241913] leading-snug">{task.title}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-[#FFF2EB] border border-[#F5DACB] text-[11px] font-semibold text-[#8B2616]">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      {task.time || 'Today'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-[#FAF5F2] border border-[#E8D3C7] text-[11px] font-semibold text-[#57423E]">
                      <span className="material-symbols-outlined text-[14px] text-[#8B2616]">account_circle</span>
                      {task.assignedTo || 'Sevekari'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#6B5E57] hover:text-red-600 transition-opacity cursor-pointer"
                  title="Delete task"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}

            {/* Divider if we have done tasks and filter is all */}
            {activeFilter === 'all' && doneTasks.length > 0 && (
              <div className="pt-2 pb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0E5138] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  Completed / पूर्ण झालेली कामे
                </span>
                <span className="flex-1 ml-3 h-[1px] bg-[#E0D0C5]"></span>
              </div>
            )}

            {/* Completed (Done) Tasks */}
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="task-item group flex items-start gap-3 bg-[#FAF5F2] border border-[#F0DFD5] rounded-xl p-3.5 shadow-none opacity-85 transition-all"
              >
                <button
                  aria-label="Toggle task completion"
                  className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg hover:bg-[#FFEAE0] transition-colors mt-0.5 cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                  type="button"
                >
                  <div className="w-5 h-5 rounded-md bg-[#003D28] text-white flex items-center justify-center shadow-xs transition-all">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#57423E] line-through leading-snug">{task.title}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-[#E6F4EA] border border-[#BDE5D0] text-[11px] font-semibold text-[#0E5138]">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      Done
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-[#FFF8F6] border border-[#E8D3C7] text-[11px] font-semibold text-[#57423E]">
                      <span className="material-symbols-outlined text-[14px] text-[#0E5138]">account_circle</span>
                      {task.assignedTo || 'Sevekari'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#6B5E57] hover:text-red-600 transition-opacity cursor-pointer"
                  title="Delete task"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Service info banner */}
      <div className="bg-white border border-[#F0DFD5] rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-full bg-[#FFEAE0] text-[#8B2616] flex items-center justify-center shrink-0 border border-[#F5DACB]">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            groups
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-[#6B0E03] leading-snug">एकत्रित सेवा भाव</h4>
          <p className="text-xs text-[#57423E] leading-tight mt-0.5">
            Tap any task to mark complete. Changes reflect instantly for all pandal sevekaris.
          </p>
        </div>
      </div>
    </div>
  );
}
