import { StudentList } from '@/features/counselor/components/StudentList';
import { Users, Zap, TrendingUp } from 'lucide-react';
import * as motion from 'framer-motion/m';

export default function AssignedStudentsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4">
      {/* Premium Header */}
      <div className="relative overflow-hidden py-12 border-b border-border">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent z-0" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-card/10 backdrop-blur-md rounded-full w-fit border border-white/10">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mentorship Roster</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              My Students
            </h1>
            <p className="text-muted-foreground max-w-lg font-medium leading-relaxed">
              Manage and track the progress of students under your direct mentorship and guidance.
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[240px]">
             <div className="flex justify-between items-end mb-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Mentorships</p>
                  <p className="text-3xl font-black text-foreground flex items-baseline gap-2">
                    Live <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 </p>
               </div>
                <Users size={32} className="text-primary opacity-20" />
             </div>
              <p className="text-xs text-muted-foreground font-bold leading-relaxed">
               Providing professional academic advice to help students find their path.
             </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Student Roster
            <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">TACTICAL VIEW</span>
          </h2>
        </div>
        <StudentList />
      </div>
    </div>
  );
}

