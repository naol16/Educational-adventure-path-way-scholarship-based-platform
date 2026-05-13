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
  ClipboardList,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ScholarshipCard } from "@/features/scholarships/components/ScholarshipCard";
import { Scholarship } from "@/features/scholarships/types";
import { EnvironmentSwitcher } from "@/features/english-learning/components/LearningPath/EnvironmentSwitcher";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  const { data: matchesResponse, isLoading: loadingMatches } = useSWR<any>(
    user?.isOnboarded ? "/scholarships/match" : null,
    {
      revalidateOnMount: true,
    },
  );

  const rawMatches: any[] = Array.isArray(matchesResponse)
    ? matchesResponse
    : matchesResponse?.data || [];

  const matches: Scholarship[] = rawMatches.map((match) => ({
    ...match,
    // Backend returns snake_case; normalize for dashboard display consistency.
    matchScore:
      typeof match?.matchScore === "number"
        ? match.matchScore
        : typeof match?.match_score === "number"
          ? match.match_score
          : undefined,
  }));

  const { data: recommendedCounselors = [], isLoading: loadingCounselors } =
    useSWR<any[]>(user?.isOnboarded ? "/counselors/recommended" : null, {
      fallbackData: [],
      revalidateOnMount: true,
    });

  const {
    data: statsData = { savedCount: 0, appliedCount: 0, deadlineCount: 0 },
    isLoading: loadingStats,
  } = useSWR<{
    savedCount: number;
    appliedCount: number;
    deadlineCount: number;
  }>(user?.isOnboarded ? "/scholarships/dashboard/stats" : null, {
    fallbackData: { savedCount: 0, appliedCount: 0, deadlineCount: 0 },
    revalidateOnMount: true,
  });

  const { data: pathData, isLoading: loadingPath } = useSWR<any>(
    user?.isOnboarded ? "/learning-path" : null,
    {
      revalidateOnMount: true,
    },
  );

  const learningPathProgress = pathData?.current_progress_percentage ?? 0;
  const [envMode, setEnvMode] = useState<"IELTS" | "TOEFL">((pathData?.examType || "IELTS") as "IELTS" | "TOEFL");

  const theme = {
    primary: envMode === "IELTS" ? "emerald" : "blue",
    text: envMode === "IELTS" ? "text-emerald-500" : "text-blue-500",
    bg: envMode === "IELTS" ? "bg-emerald-500/10" : "bg-blue-600/10",
    border: envMode === "IELTS" ? "border-emerald-500/20" : "border-blue-600/20",
    glow: envMode === "IELTS" ? "bg-emerald-500/5" : "bg-blue-600/5",
    gradient: envMode === "IELTS" ? "from-emerald-500 to-teal-500" : "from-blue-600 to-indigo-600",
    button: envMode === "IELTS" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500",
  };

  useEffect(() => {
    if (user && !user.isOnboarded) {
      router.push("/dashboard/student/profile");
    }
  }, [user, user?.isOnboarded, router]);

  const calculateCompletion = () => {
    if (!user) return 0;
    return user.profileCompletion || 89;
  };

  const completionRate = calculateCompletion();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-x-hidden">
       {/* Dynamic Background Ambiance */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={envMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className={`absolute top-[-5%] left-[-5%] w-[40%] h-[40%] ${theme.glow} blur-[100px] rounded-full dark:opacity-100 opacity-30`} />
            <div className={`absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] ${theme.glow} blur-[120px] rounded-full dark:opacity-100 opacity-30`} />
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10"
      >
        {/* Header Section - Clean & Professional */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-2">
              <EnvironmentSwitcher mode={envMode} onChange={setEnvMode} />
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <Sparkles size={12} className={`${theme.text} animate-pulse`} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Unified Learning
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Welcome back
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {user?.name ? `Hi, ${user.name}!` : "Student Dashboard"}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mt-2">
              {matches.length > 0
                ? `You have ${matches.length} recommended scholarships waiting for you. Check your opportunities and get started on your applications.`
                : "Complete your profile to discover personalized scholarship opportunities."}
            </p>
          </div>

          {/* Quick Stats Badge */}
          <div className="flex flex-col gap-3 lg:items-end">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${theme.bg} ${theme.text} border ${theme.border}`}>
              <div className={`size-2 rounded-full ${envMode === 'IELTS' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <span className="text-sm font-semibold">
                Profile {completionRate}% Complete
              </span>
            </div>
          </div>
        </header>

        {/* Stats Cards - Clean Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Saved",
              value: statsData.savedCount || 0,
              icon: Star,
              color: "bg-blue-50 dark:bg-blue-950",
              textColor: "text-blue-600 dark:text-blue-400",
            },
            {
              label: "Applied",
              value: statsData.appliedCount || 0,
              icon: FileText,
              color: "bg-green-50 dark:bg-green-950",
              textColor: "text-green-600 dark:text-green-400",
            },
            {
              label: "Deadlines",
              value: statsData.deadlineCount || 0,
              icon: Clock,
              color: "bg-orange-50 dark:bg-orange-950",
              textColor: "text-orange-600 dark:text-orange-400",
            },
            {
              label: "Profile",
              value: `${completionRate}%`,
              icon: Target,
              color: "bg-purple-50 dark:bg-purple-950",
              textColor: "text-purple-600 dark:text-purple-400",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-md hover:border-border/60 transition-all p-6"
            >
              <div
                className={`size-10 rounded-lg ${stat.color} ${stat.textColor} flex items-center justify-center mb-4`}
              >
                <stat.icon size={20} />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scholarship Matches Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Top Recommended Scholarships
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Best matches curated for your profile
                  </p>
                </div>
                <Link href="/dashboard/scholarships">
                  <Button variant="outline" size="sm" className="gap-2">
                    View All <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              {loadingMatches ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-28 bg-card/40 rounded-lg animate-pulse border border-border/20"
                    />
                  ))}
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.slice(0, 5).map((match) => {
                    return (
                      <Card
                        key={match.id}
                        className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-xl"
                      >
                        <div className="p-6 lg:p-7 space-y-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1 space-y-2">
                              <Badge className="rounded-full bg-primary/10 text-primary border-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                                Recommended
                              </Badge>
                              <h3 className="text-xl lg:text-[1.35rem] font-black text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                {match.title}
                              </h3>
                            </div>

                            <div className="flex min-w-24 flex-col items-end rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-right">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Match
                              </span>
                              <div className="mt-1 flex items-center gap-1.5 text-xl font-black text-foreground">
                                <Star
                                  size={16}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                                {match.matchScore !== undefined
                                  ? `${Math.round(match.matchScore)}%`
                                  : "85%"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border-t border-border/60 bg-muted/10 p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-12 gap-2 rounded-lg border-border/60 bg-muted/20 px-4 text-foreground shadow-none hover:bg-muted/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/dashboard/student/scholarships/${match.id}`,
                              );
                            }}
                          >
                            Details <ArrowRight size={14} />
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-12 gap-2 rounded-lg bg-emerald-600 px-4 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetUrl =
                                match.applicationUrl || match.originalUrl;
                              if (targetUrl) {
                                window.open(
                                  targetUrl,
                                  "_blank",
                                  "noopener,noreferrer",
                                );
                              }
                            }}
                          >
                            Apply <ArrowRight size={14} />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 bg-card/20 rounded-lg border border-dashed border-border/40 text-center">
                  <Search className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                  <p className="text-sm font-medium text-foreground mb-2">
                    No matches yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Complete your profile to see personalized opportunities
                  </p>
                  <Link href="/dashboard/student/profile">
                    <Button size="sm" className="gap-2">
                      Complete Profile <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* Learning Path Progress - NEW SECTION */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Compass className={theme.text} size={24} /> Learning Path
                    Status
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your journey towards {envMode} mastery
                  </p>
                </div>
                <Link href="/dashboard/learning-path">
                  <Button variant="outline" size="sm" className="gap-2">
                    Open Path <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              <Card className={`rounded-xl border ${theme.border} bg-card p-8 shadow-sm relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap size={100} className={theme.text} />
                </div>
                <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                  <div className="size-32 rounded-full border-8 border-muted flex items-center justify-center relative">
                    <svg className="size-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={351.8}
                        strokeDashoffset={
                          351.8 * (1 - (learningPathProgress || 0) / 100)
                        }
                        strokeLinecap="round"
                        className={`${theme.text} transition-all duration-1000`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-black ${theme.text}`}>
                        {learningPathProgress || 0}%
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                        Mastery
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">Next Milestone</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {learningPathProgress && learningPathProgress >= 100
                          ? `Congratulations! You've mastered the ${envMode} curriculum. You are now eligible for the Final Mock Exam.`
                          : `Complete your daily missions in ${envMode} Reading and Listening to unlock the next proficiency level.`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Link href="/dashboard/learning-path">
                        <Button
                          size="sm"
                          className={`${theme.button} text-white font-bold uppercase tracking-widest text-[9px] h-10 px-6 rounded-lg transition-all`}
                        >
                          Resume {envMode} Training
                        </Button>
                      </Link>
                      {learningPathProgress >= 100 && (
                        <Link href="/dashboard/learning-path/final/assessment">
                          <Button
                            size="sm"
                            variant="outline"
                            className={`${theme.border} ${theme.text} hover:${theme.bg} font-bold uppercase tracking-widest text-[9px] h-10 px-6 rounded-lg transition-all`}
                          >
                            Take Mock Exam
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Recommended Counselors Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Recommended Counselors
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Expert guidance for your journey
                  </p>
                </div>
                <Link href="/dashboard/counselors">
                  <Button variant="outline" size="sm" className="gap-2">
                    All Counselors <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingCounselors
                  ? [1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-64 bg-card/40 rounded-lg animate-pulse border border-border/20"
                      />
                    ))
                  : recommendedCounselors.length > 0
                    ? recommendedCounselors.slice(0, 2).map((counselor) => (
                        <Card
                          key={counselor.id}
                          className="rounded-lg border border-border/40 bg-card shadow-sm hover:shadow-lg hover:border-primary/40 transition-all p-6 group"
                        >
                          <div className="flex gap-4 mb-4">
                            <Avatar className="size-16 border-2 border-border group-hover:border-primary transition-all">
                              <AvatarImage src={counselor.profileImageUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {counselor.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                {counselor.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Star
                                  size={14}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                                <span className="text-sm font-semibold text-foreground">
                                  {counselor.rating || 4.9}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({counselor.reviewCount || 120} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                          {counselor.areasOfExpertise && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {counselor.areasOfExpertise
                                .split(",")
                                .slice(0, 2)
                                .map((area: string) => (
                                  <Badge
                                    key={area}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {area.trim()}
                                  </Badge>
                                ))}
                            </div>
                          )}
                          <Link href={`/dashboard/counselors/${counselor.id}`}>
                            <Button size="sm" className="w-full gap-2">
                              View Profile <ArrowRight size={14} />
                            </Button>
                          </Link>
                        </Card>
                      ))
                    : null}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="space-y-6">
            {/* Profile Completion Card */}
            <Card className="rounded-lg border border-border/40 bg-linear-to-br from-primary/10 to-primary/5 p-6">
              <h3 className="font-bold text-foreground mb-4">
                Profile Completion
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-primary to-primary/70 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </div>
                </div>

                {completionRate < 100 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-foreground font-medium mb-3">
                      Next steps:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      {completionRate < 50 && (
                        <li>• Add your academic achievements</li>
                      )}
                      {completionRate < 75 && <li>• Upload your documents</li>}
                      {completionRate < 100 && (
                        <li>• Review and verify information</li>
                      )}
                    </ul>
                  </div>
                )}

                <Link
                  href="/dashboard/student/profile"
                  className="block w-full"
                >
                  <Button
                    className="w-full gap-2"
                    variant={completionRate === 100 ? "outline" : "primary"}
                  >
                    {completionRate === 100
                      ? "View Profile"
                      : "Complete Profile"}
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-lg border border-border/40 bg-card p-6">
              <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/scholarships" className="block">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-lg border border-border/10 bg-muted/20 text-foreground hover:bg-muted/40"
                  >
                    <Search size={16} />
                    Browse Scholarships
                  </Button>
                </Link>
                <Link href="/dashboard/counselors" className="block">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-lg border border-border/10 bg-muted/20 text-foreground hover:bg-muted/40"
                  >
                    <Users size={16} />
                    Find Counselors
                  </Button>
                </Link>
                <Link href="/dashboard/student/profile" className="block">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-lg border border-border/10 bg-muted/20 text-foreground hover:bg-muted/40"
                  >
                    <FileText size={16} />
                    My Documents
                  </Button>
                </Link>
                <Link href="/dashboard/student/bookings" className="block">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-lg border border-border/10 bg-muted/20 text-foreground hover:bg-muted/40"
                  >
                    <Calendar size={16} />
                    My Bookings
                  </Button>
                </Link>
                <Link
                  href="/dashboard/learning-path/final/assessment"
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-2 rounded-lg border border-border/10 bg-muted/20 text-foreground hover:bg-muted/40 whitespace-nowrap ${learningPathProgress === 100 ? "border-primary/30 text-primary" : ""}`}
                  >
                    <ClipboardList size={16} />
                    Final Mock Exam
                    {learningPathProgress === 100 && (
                      <Badge className="ml-auto bg-primary/10 text-primary border-none text-[8px] px-1.5">
                        UNLOCKED
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card className="rounded-lg border border-border/40 bg-card p-6">
              <h3 className="font-bold text-foreground mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">
                    Applications
                  </span>
                  <span className="font-bold text-lg">
                    {statsData.appliedCount}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Saved</span>
                  <span className="font-bold text-lg">
                    {statsData.savedCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Active Deadlines
                  </span>
                  <span className="font-bold text-lg text-orange-600">
                    {statsData.deadlineCount}
                  </span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
