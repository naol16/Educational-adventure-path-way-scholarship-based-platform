'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-context';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight, 
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Award,
  AlertCircle,
  Loader2,
  Wallet,
  Landmark,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { StudentList } from './StudentList';
import { WalletLedger } from './WalletLedger';
import { CounselorReviews } from './CounselorReviews';
import { motion } from 'framer-motion';
import { 
  getCounselorDashboardOverview, 
  CounselorDashboardOverview,
  getCounselorProfile 
} from '@/features/counselor/api/counselor-api';
import { useRouter } from 'next/navigation';
import { WithdrawalModal } from './WithdrawalModal';

export const CounselorDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [statsData, setStatsData] = useState<CounselorDashboardOverview | null>(null);
  const [counselorProfile, setCounselorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch profile first
      const profile = await getCounselorProfile();
      setCounselorProfile(profile);

      // Only fetch stats if they are fully onboarded and approved
      if (profile.isOnboarded && profile.verificationStatus === 'approved') {
        const stats = await getCounselorDashboardOverview();
        setStatsData(stats);
      }
    } catch (error: any) {
      console.error('Failed to fetch counselor data:', error);
      // If profile fetch fails with 403, they might not have a counselor profile at all
      if (error.response?.status === 403 && !counselorProfile) {
        router.push("/role-selection");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (counselorProfile && !counselorProfile.isOnboarded) {
      router.push("/dashboard/counselor/profile");
    }
  }, [counselorProfile, counselorProfile?.isOnboarded, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  // Prevent flashing pending screen if not onboarded
  if (counselorProfile && !counselorProfile.isOnboarded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Redirecting to profile setup...</p>
      </div>
    );
  }

  // Handle Onboarding / Verification States
  if (counselorProfile?.verificationStatus === 'pending') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/95 backdrop-blur-md">
        <Card className="max-w-xl w-full border-border bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 primary-gradient animate-pulse" />
          <CardBody className="p-12 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto border-4 border-warning/20">
              <Clock className="h-10 w-10 text-warning" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight">Checking Your Account</h1>
              <p className="text-muted-foreground leading-relaxed">
                Our team is checking your account now. This usually takes <span className="font-bold text-foreground">24-48 hours</span>.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs font-semibold text-muted-foreground">
                We'll notify you via email as soon as your profile is approved.
              </p>
            </div>
            <Button variant="outline" className="w-full h-12 border-border" onClick={() => window.location.reload()}>
              Check Status
            </Button>
            <div className="pt-2 text-center">
              <button 
                onClick={() => {
                   localStorage.removeItem('accessToken');
                   window.location.href = '/login';
                }}
                className="text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Logout
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (counselorProfile?.verificationStatus === 'rejected') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-xl w-full border-border bg-card">
          <CardBody className="p-12 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">Application Rejected</h1>
              <p className="text-muted-foreground">Your account was not approved at this time.</p>
            </div>
            <p className="text-sm text-muted-foreground pb-4">
              Common reasons are missing papers or not fitting our needs. Please talk to support for more help.
            </p>
            <Button variant="outline" className="w-full h-12 border-border">
              Contact Support
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground space-y-16 pb-20 max-w-[1400px] mx-auto px-6 pt-12">
      {/* Top Banner Area - Identity */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-border pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-black tracking-tight">Expert Dashboard</h1>
            {counselorProfile?.verificationStatus === 'approved' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-500">
                <ShieldCheck size={12} /> Verified
              </div>
            )}
          </div>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Welcome back, <span className="text-foreground font-bold">{user?.name}</span>. Manage your professional mentorship roster and student consultations.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button 
            className="primary-gradient text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex-1 lg:flex-none"
            onClick={() => router.push('/dashboard/counselor/bookings')}
          >
            <CalendarCheck className="mr-2 h-4 w-4" /> Schedule
          </Button>
          <Button 
            variant="outline" 
            className="border-border bg-muted/20 hover:bg-muted text-foreground h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex-1 lg:flex-none"
            onClick={() => router.push('/dashboard/counselor/chat')}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Messages
          </Button>
        </div>
      </div>

      {/* Stats Bar - Flat Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-4">
        <div className="space-y-2 group">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
             <TrendingUp size={14} className="text-primary" /> Success Rate
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black">{Math.round(Number(counselorProfile?.ratingPercentage || 0))}%</h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded">+2.4%</span>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
             <div className="h-full bg-primary w-[85%]" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
             <Users size={14} className="text-emerald-500" /> Active Mentees
          </p>
          <h3 className="text-4xl font-black">{statsData?.assignedStudents || 0}</h3>
          <p className="text-[10px] font-bold text-muted-foreground">Students under guidance</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
             <CheckCircle2 size={14} className="text-primary" /> Completed
          </p>
          <h3 className="text-4xl font-black">{statsData?.completedSessions || 0}</h3>
          <p className="text-[10px] font-bold text-muted-foreground">Total sessions delivered</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
             <Star size={14} className="text-amber-500" /> Professional Rating
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-4xl font-black">{Number(counselorProfile?.rating || 0).toFixed(1)}</h3>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= Math.round(counselorProfile?.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Strip - Integrated Look */}
      <div className="py-10 px-10 bg-muted/20 border border-border/50 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
            <Wallet size={36} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Earnings</p>
            <h3 className="text-4xl font-black tracking-tight">{Number(counselorProfile?.pendingBalance || 0).toLocaleString()} <span className="text-lg opacity-40">ETB</span></h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="text-center sm:text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Lifetime Income</p>
             <p className="text-xl font-bold">{Number(counselorProfile?.totalEarned || 0).toLocaleString()} <span className="text-xs opacity-50">ETB</span></p>
          </div>
          <Button 
             onClick={() => setIsWithdrawalOpen(true)}
             className="h-16 px-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20"
          >
            Request Payout <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {isWithdrawalOpen && (
        <WithdrawalModal 
           isOpen={isWithdrawalOpen}
           onClose={() => setIsWithdrawalOpen(false)}
           availableBalance={Number(counselorProfile?.pendingBalance || 0)}
           onSuccess={fetchData}
        />
      )}

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-12">
          {/* Mentorship Roster */}
          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black">Student Roster</h2>
                <p className="text-sm text-muted-foreground font-medium">Manage and track the progress of students under your direct mentorship.</p>
              </div>
              <Link href="/dashboard/counselor/students" className="text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5 mb-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-border/50">
              <StudentList />
            </div>
          </div>

          {/* Feedback & History */}
          <div className="space-y-10 pt-4">
             <div className="flex items-center justify-between border-b border-border pb-6">
                <h2 className="text-2xl font-black">Community Feedback</h2>
                <div className="px-3 py-1 bg-amber-500/5 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/10">
                   Recent Reviews
                </div>
             </div>
             {counselorProfile?.id && (
                <CounselorReviews counselorId={counselorProfile.id} />
             )}
          </div>
          
          <div className="space-y-8">
             <h2 className="text-2xl font-black border-b border-border pb-6">Financial History</h2>
             <WalletLedger />
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-12">
           <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-4">Tactical Overview</h3>
              <div className="grid grid-cols-1 gap-6">
                 <div className="p-8 rounded-3xl bg-muted/20 border border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending Requests</p>
                       <Clock size={16} className="text-amber-500" />
                    </div>
                    <h4 className="text-4xl font-black">{statsData?.pendingBookings || 0}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground/60">Awaiting your approval</p>
                 </div>

                 <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary">Success Milestones</p>
                       <Award size={18} className="text-primary" />
                    </div>
                    <h4 className="text-4xl font-black">{statsData?.completedSessions || 0}</h4>
                    <p className="text-[10px] font-bold text-primary/60">Sessions successfully guided</p>
                 </div>
              </div>
           </div>

           {/* Quick Actions / Tips */}
           <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border pb-4">Professional Insights</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                       <TrendingUp size={18} />
                    </div>
                    <div>
                       <p className="text-sm font-bold leading-tight">Response Time Matters</p>
                       <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">Replying to student requests within 4 hours increases booking conversion by 40%.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                       <Star size={18} />
                    </div>
                    <div>
                       <p className="text-sm font-bold leading-tight">Optimize Your Bio</p>
                       <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">Profiles with specific academic niches get 2.5x more international applicants.</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Promotion / App Info */}
           <div className="p-8 rounded-[32px] bg-foreground text-background space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
              <div className="space-y-2 relative z-10">
                 <h4 className="text-xl font-black leading-tight">Ready for your next session?</h4>
                 <p className="text-xs opacity-60 font-medium">Keep your availability slots updated to maintain a steady flow of consultations.</p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/counselor/bookings')}
                className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest text-[10px] relative z-10"
              >
                Update Schedule
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

