"use client";

import { useAuth } from "@/providers/auth-context";
import {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  FileText,
  Zap,
  Star,
  Target,
  Sparkles,
  Search,
  Calendar,
  Compass,
  ArrowUpRight,
  Plus,
  Users,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { 
  Card, 
  CardBody, 
  Button, 
  Badge, 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getScholarships, getDashboardStats } from "@/features/scholarships/api/get-scholarships";
import { Scholarship } from "@/features/scholarships/types";
import { ScholarshipCard } from "@/features/scholarships/components/ScholarshipCard";
import { getRecommendedCounselors } from "@/features/counselor/api/counselor-api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Scholarship[]>([]);
  const [recommendedCounselors, setRecommendedCounselors] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({ savedCount: 0, appliedCount: 0, deadlineCount: 0 });
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && !user.isOnboarded) {
      router.push("/dashboard/student/profile");
    }
  }, [user, user?.isOnboarded, router]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getScholarships();
        setMatches(data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoadingMatches(false);
      }
    };

    const fetchCounselors = async () => {
      try {
        const data = await getRecommendedCounselors();
        setRecommendedCounselors(data);
      } catch (error) {
        console.error("Failed to fetch recommended counselors:", error);
      } finally {
        setLoadingCounselors(false);
      }
    };

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStatsData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.isOnboarded) {
      fetchMatches();
      fetchCounselors();
      fetchStats();
    } else {
      setLoadingMatches(false);
      setLoadingCounselors(false);
      setLoadingStats(false);
    }
  }, [user?.isOnboarded]);

  const calculateCompletion = () => {
    if (!user) return 0;
    // Logic from previous version... (simplified for now to 89 to match image if needed, or dynamic)
    return user.profileCompletion || 89;
  };

  const completionRate = calculateCompletion();

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#f8fafc] text-slate-900 space-y-10 pb-20 px-4 md:px-10 lg:px-16 max-w-7xl mx-auto"
    >
      
      {/* Header Section */}
      <header className="pt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative">
        <div className="space-y-4 max-w-2xl">
          <p className="text-primary font-bold text-sm tracking-tight flex items-center gap-2">
            Good morning, {user?.name || 'User'} 👋
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground font-serif leading-[1.1]">
            Master Your <br/> Academic Journey
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Unlock <span className="text-foreground font-bold">{matches.length || 5} curated scholarships</span> specifically analyzed for your profile.
          </p>
          <div className="flex gap-4 pt-4">
             <Link href="/dashboard/scholarships">
                <Button size="lg" className="rounded-lg px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-14 shadow-lg shadow-primary/20 transition-all">
                  Explore Matches
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard/student/profile">
                <Button variant="outline" size="lg" className="rounded-lg px-8 border-border text-foreground hover:bg-muted font-bold text-sm h-14 transition-all bg-card">
                  Profile Tactical
                </Button>
              </Link>
          </div>
        </div>

        {/* Profile Strength Circle */}
        <Card className="rounded-xl border-none shadow-sm p-8 bg-card w-full md:w-80">
          <div className="flex flex-col items-center">
             <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Profile Strength</p>
             <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted/50"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * completionRate) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="text-emerald-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-foreground">{completionRate}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Strong</span>
                </div>
             </div>
             <div className="mt-8 flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <TrendingUp size={14} />
                <span>12% vs last week</span>
             </div>
          </div>
        </Card>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Saved", value: statsData.savedCount || 0, icon: Star, color: "text-amber-500", bgColor: "bg-amber-500/10", desc: "Bookmark opportunities" },
          { label: "Applications", value: statsData.appliedCount || 0, icon: FileText, color: "text-emerald-500", bgColor: "bg-emerald-500/10", desc: "Scholarships applied" },
          { label: "Deadlines", value: statsData.deadlineCount || 0, icon: Clock, color: "text-rose-500", bgColor: "bg-rose-500/10", desc: "Approaching in 30 days" },
          { label: "Profile Strength", value: `${completionRate}%`, icon: TrendingUp, color: "text-sky-500", bgColor: "bg-sky-500/10", desc: "Profile completion" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-500 p-8 group">
            <div className={`h-10 w-10 rounded-xl ${stat.bgColor} ${stat.color} flex items-center justify-center mb-6 shadow-sm`}>
              <stat.icon size={20} />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              <p className="text-4xl font-black text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium pt-2">{stat.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Top Recommendations */}
          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3 font-serif">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Zap size={18} />
                  </div>
                  Top Recommendations
                </h2>
                <p className="text-muted-foreground text-sm font-medium mt-2">Hand-picked opportunities based on your skills and goals.</p>
              </div>
              <Link href="/dashboard/scholarships" className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                View all <Plus size={16} />
              </Link>
            </div>

            {loadingMatches ? (
              <div className="space-y-4">
                <div className="h-64 bg-card rounded-xl animate-pulse border border-border/50" />
                <div className="h-24 bg-card rounded-xl animate-pulse border border-border/50" />
                <div className="h-24 bg-card rounded-xl animate-pulse border border-border/50" />
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-4">
                {/* Featured Card */}
                <ScholarshipCard scholarship={matches[0]} variant="featured" />
                
                {/* List Cards */}
                {matches.slice(1, 5).map(match => (
                  <ScholarshipCard key={match.id} scholarship={match} variant="list" />
                ))}

                <div className="pt-6 text-center">
                   <Link 
                      href="/dashboard/scholarships"
                      className="inline-flex items-center justify-center rounded-lg border border-border text-foreground bg-card hover:bg-muted font-bold px-10 h-12 text-xs shadow-sm transition-all"
                    >
                      View all matches
                   </Link>
                </div>
              </div>
            ) : (
              <div className="py-20 bg-card rounded-xl border border-dashed border-border text-center">
                 <p className="text-muted-foreground font-bold uppercase tracking-widest">No matches found yet.</p>
              </div>
            )}
          </section>

          {/* Elite Advisors */}
          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3 font-serif">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Users size={18} />
                  </div>
                  Elite Advisors
                </h2>
                <p className="text-muted-foreground text-sm font-medium mt-2">Top-rated global consultants analyzed for your academic field.</p>
              </div>
              <Link href="/dashboard/counselors" className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                Directory <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loadingCounselors ? (
                [1,2,3].map(i => <div key={i} className="h-64 bg-card rounded-xl animate-pulse border border-border/50" />)
              ) : recommendedCounselors.length > 0 ? (
                recommendedCounselors.slice(0, 3).map(counselor => (
                  <Card key={counselor.id} className="rounded-xl shadow-sm border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all p-6 text-center group">
                    <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-background group-hover:border-primary/20 transition-colors shadow-sm">
                       <AvatarImage src={counselor.profileImageUrl} />
                       <AvatarFallback className="bg-primary/10 text-primary font-bold">{counselor.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{counselor.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">{counselor.areasOfExpertise || 'Counselor'}</p>
                    <div className="flex items-center justify-center gap-1.5 text-amber-500 mt-4">
                       <Star size={12} fill="currentColor" />
                       <span className="text-[11px] font-bold text-foreground">{counselor.rating || 4.9} <span className="text-muted-foreground/60 font-medium">({counselor.reviewCount || 120})</span></span>
                    </div>
                    <div className="h-px bg-border/40 my-6" />
                    <Link href={`/dashboard/counselors/${counselor.id}`} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">
                       View Profile
                    </Link>
                  </Card>
                ))
              ) : null}
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-primary/10">
               <div className="flex items-center gap-4 text-primary">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm border border-border/50">
                    <FileText size={20} />
                  </div>
                  <p className="text-sm font-bold text-foreground">Complete your research preferences to see elite advisor matches.</p>
               </div>
               <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 font-bold text-xs h-10 transition-all shadow-sm">
                  Complete Preferences
               </Button>
            </div>
          </section>
        </div>

        {/* Right Column (1/3) */}
        <aside className="space-y-10">
          
          {/* Profile Tactical */}
          <Card className="rounded-xl border border-border bg-card shadow-sm p-8">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-foreground">Profile Tactical</h3>
                <span className="text-primary font-bold text-sm">{completionRate}%</span>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Optimization status</p>
                   <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${completionRate}%` }} />
                   </div>
                </div>

                <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/20 flex gap-4">
                   <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                      <Star size={18} className="fill-amber-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Recommendation</p>
                      <p className="text-xs font-bold text-foreground leading-snug">Add academic awards to reach 100% Strength.</p>
                   </div>
                </div>

                <Button className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-lg h-14 font-bold text-sm">
                   Optimize Profile
                </Button>
             </div>
          </Card>

          {/* Activity Feed */}
          <Card className="rounded-xl border border-border bg-card shadow-sm p-8">
             <h3 className="text-lg font-bold text-foreground mb-8">Activity Feed</h3>
             <div className="space-y-10 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-border/50">
                <div className="flex gap-6 relative z-10">
                   <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
                      <Award size={20} />
                   </div>
                   <div className="pt-1">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">New Matches</p>
                      <p className="text-xs font-medium text-muted-foreground leading-snug">
                        Found scholarships matching your research in "Business Administration", "Human Resource Management".
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 mt-2">Just now</p>
                   </div>
                </div>

                <div className="flex gap-6 relative z-10">
                   <div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm shrink-0">
                      <TrendingUp size={20} />
                   </div>
                   <div className="pt-1">
                      <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-1">System Status</p>
                      <p className="text-xs font-medium text-muted-foreground leading-snug">AI analysis engine is operating at full capacity.</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 mt-2">Active</p>
                   </div>
                </div>
             </div>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-xl border border-border bg-card shadow-sm p-8">
             <h3 className="text-lg font-bold text-foreground mb-8">Quick Actions</h3>
             <div className="space-y-4">
                {[
                  { label: "Browse Scholarships", icon: Search, href: "/dashboard/scholarships" },
                  { label: "Take Assessment", icon: ClipboardList, href: "/dashboard/learning-path/diagnostic/assessment" },
                  { label: "Book a Session", icon: Calendar, href: "/dashboard/counselors" },
                  { label: "Explore Learning Path", icon: Compass, href: "/dashboard/learning-path" },
                ].map((action, i) => (
                  <Link key={i} href={action.href} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-all border border-transparent hover:border-border group">
                    <div className="flex items-center gap-4">
                       <action.icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                       <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/50 group-hover:text-foreground transition-all" />
                  </Link>
                ))}
             </div>
          </Card>

        </aside>

      </div>

    </motion.div>
  );
};

export default StudentDashboard;
