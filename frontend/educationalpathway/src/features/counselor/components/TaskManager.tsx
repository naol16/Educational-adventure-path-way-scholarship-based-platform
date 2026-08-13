'use client';

import { useState } from 'react';
import { 
  Trash2, 
  CheckCircle, 
  Circle, 
  Loader2,
  ClipboardList,
  Flame,
  Target,
  Zap,
  TrendingUp,
  ChevronRight,
  X
} from 'lucide-react';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskManager = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), text: newTask, completed: false }, ...tasks]);
    setNewTask('');
    setIsAdding(false);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4">
      {/* Header & Progress Header */}
      <div className="relative overflow-hidden py-12 border-b border-border">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent z-0" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full w-fit border border-primary/10"
            >
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Productivity Dashboard</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Counselor Goals
            </h1>
            <p className="text-muted-foreground max-w-lg font-medium leading-relaxed">
              Track your progress and personal academic milestones for your students with a premium tactical overview.
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[240px]">
             <div className="flex justify-between items-end mb-4">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall Progress</p>
                 <p className="text-3xl font-black text-foreground">{completionRate}%</p>
               </div>
               <TrendingUp size={32} className="text-emerald-400 opacity-50" />
             </div>
             <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${completionRate}%` }}
                 className="h-full primary-gradient"
               />
             </div>
             <p className="text-xs text-muted-foreground mt-3 font-bold">
               {tasks.filter(t => t.completed).length} of {tasks.length} goals achieved
             </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Input Area */}
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <AnimatePresence mode="wait">
            {!isAdding ? (
              <motion.div
                key="add-button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Button 
                  onClick={() => setIsAdding(true)} 
                  className="h-14 px-12 primary-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                  Add Goal
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="input-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-4 w-full"
              >
                <Input 
                  autoFocus
                  placeholder="Describe your goal..." 
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  className="h-14 flex-1 bg-muted/30 rounded-2xl text-lg px-6 focus:ring-primary/20 transition-all outline-none"
                />
                <Button 
                  onClick={addTask} 
                  className="h-14 px-8 primary-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Add
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => { setIsAdding(false); setNewTask(''); }} 
                  className="h-14 w-14 p-0 rounded-2xl border border-border hover:bg-muted"
                >
                  <X size={20} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Task List Area */}
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-32 text-center border-dashed border-2 border-border rounded-2xl bg-muted/5"
              >
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <ClipboardList className="h-20 w-20 text-muted-foreground/20" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Active Goals</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">Start adding professional milestones to track your progress.</p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className={`group border-b border-border/40 last:border-0 transition-all duration-300 ${
                      task.completed ? 'opacity-50 grayscale' : 'hover:bg-muted/20'
                    }`}
                  >
                    <div className="p-5 flex items-center gap-5">
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={`shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                            task.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-border hover:border-primary text-muted-foreground/30'
                          }`}
                        >
                          {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>

                        <p className={`flex-1 text-base font-bold leading-snug transition-all duration-500 ${
                          task.completed ? 'text-muted-foreground line-through italic' : 'text-foreground'
                        }`}>
                          {task.text}
                        </p>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeTask(task.id)}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl h-10 w-10 transition-all"
                          >
                            <Trash2 size={18} />
                          </Button>
                          <ChevronRight size={18} className="text-muted-foreground/20" />
                        </div>
                      </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

