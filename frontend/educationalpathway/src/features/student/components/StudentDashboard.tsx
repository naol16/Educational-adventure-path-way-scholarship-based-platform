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
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ScholarshipCard } from "@/features/scholarships/components/ScholarshipCard";
import { Scholarship } from "@/features/scholarships/types";

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

  const { data: matchesResponse, isLoading: loadingMatches } = useSWR<any>(user?.isOnboarded ? "/scholarships/match" : null, {
    revalidateOnMount: true
  });

  const matches: Scholarship[] = Array.isArray(matchesResponse) ? matchesResponse : (matchesResponse?.data || []);

  const { data: recommendedCounselors = [], isLoading: loadingCounselors } = useSWR<any[]>(user?.isOnboarded ? "/counselors/recommended" : null, {
    fallbackData: [],
    revalidateOnMount: true
  });

  const { data: statsData = { savedCount: 0, appliedCount: 0, deadlineCount: 0 }, isLoading: loadingStats } = useSWR<{savedCount: number, appliedCount: number, deadlineCount: number}>(user?.isOnboarded ? "/scholarships/dashboard/stats" : null, {
    fallbackData: { savedCount: 0, appliedCount: 0, deadlineCount: 0 },
    revalidateOnMount: true
  });


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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8"
      >
        
        {/* Header Section - Clean & Professional */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {user?.name ? `Hi, ${user.name}!` : 'Student Dashboard'}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mt-2">
              {matches.length > 0 
                ? `You have ${matches.length} recommended scholarships waiting for you. Check your opportunities and get started on your applications.`
                : 'Complete your profile to discover personalized scholarship opportunities.'}
            </p>
          </div>

          {/* Quick Stats Badge */}
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold">Profile {completionRate}% Complete</span>
            </div>
          </div>
        </header>

        {/* Stats Cards - Clean Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Saved", value: statsData.savedCount || 0, icon: Star, color: "bg-blue-50 dark:bg-blue-950", textColor: "text-blue-600 dark:text-blue-400" },
            { label: "Applied", value: statsData.appliedCount || 0, icon: FileText, color: "bg-green-50 dark:bg-green-950", textColor: "text-green-600 dark:text-green-400" },
            { label: "Deadlines", value: statsData.deadlineCount || 0, icon: Clock, color: "bg-orange-50 dark:bg-orange-950", textColor: "text-orange-600 dark:text-orange-400" },
            { label: "Profile", value: `${completionRate}%`, icon: Target, color: "bg-purple-50 dark:bg-purple-950", textColor: "text-purple-600 dark:text-purple-400" },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-md hover:border-border/60 transition-all p-6">
              <div className={`size-10 rounded-lg ${stat.color} ${stat.textColor} flex items-center justify-center mb-4`}>
                <stat.icon size={20} />
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
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
                  <h2 className="text-2xl font-bold text-foreground">Top Recommended Scholarships</h2>
                  <p className="text-sm text-muted-foreground mt-1">Best matches curated for your profile</p>
                </div>
                <Link href="/dashboard/scholarships">
                  <Button variant="outline" size="sm" className="gap-2">
                    View All <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              {loadingMatches ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-28 bg-card/40 rounded-lg animate-pulse border border-border/20" />
                  ))}
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.slice(0, 5).map(match => (
                    <Card key={match.id} className="rounded-lg border border-border/40 bg-card hover:bg-card/80 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all overflow-hidden cursor-pointer">
                      <div className="p-6 space-y-4" onClick={() => router.push(`/dashboard/student/scholarships/${match.id}`)}>
                        {/* Scholarship Name - Top */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-2">
                            {match.title}
                          </h3>
                          {match.country && (
                            <p className="text-sm text-muted-foreground">{match.country}</p>
                          )}
                        </div>

                        {/* Description */}
                        {match.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {match.description}
                          </p>
                        )}

                        {/* Key Details */}
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/40">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Amount</p>
                            <p className="font-bold text-primary truncate">
                              {match.amount || 'Varies'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Deadline</p>
                            <p className="font-semibold text-foreground text-sm">
                              {match.deadline 
                                ? new Date(match.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Match</p>
                            <div className="flex items-center gap-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <p className="font-bold text-foreground text-sm">{match.matchScore !== undefined ? `${Math.round(match.matchScore)}%` : '85%'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {(match.requirements || (match.degreeLevels && match.degreeLevels.length > 0)) && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {match.degreeLevels && match.degreeLevels.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {match.degreeLevels[0]}
                              </Badge>
                            )}
                            {match.requirements && (
                              <Badge variant="outline" className="text-xs truncate max-w-[200px]">
                                {match.requirements}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer - Buttons Divided */}
                      <div className="flex items-center border-t border-border/40">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 gap-2 rounded-none border-r border-border/40 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/student/scholarships/${match.id}`);
                          }}
                        >
                          View Details <ArrowRight size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 gap-2 rounded-none bg-primary hover:bg-primary/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add apply functionality here
                          }}
                        >
                          Apply <ArrowRight size={14} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-card/20 rounded-lg border border-dashed border-border/40 text-center">
                  <Search className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                  <p className="text-sm font-medium text-foreground mb-2">No matches yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Complete your profile to see personalized opportunities</p>
                  <Link href="/dashboard/student/profile">
                    <Button size="sm" className="gap-2">
                      Complete Profile <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* Recommended Counselors Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Recommended Counselors</h2>
                  <p className="text-sm text-muted-foreground mt-1">Expert guidance for your journey</p>
                </div>
                <Link href="/dashboard/counselors">
                  <Button variant="outline" size="sm" className="gap-2">
                    All Counselors <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingCounselors ? (
                  [1, 2].map(i => <div key={i} className="h-64 bg-card/40 rounded-lg animate-pulse border border-border/20" />)
                ) : recommendedCounselors.length > 0 ? (
                  recommendedCounselors.slice(0, 2).map(counselor => (
                    <Card key={counselor.id} className="rounded-lg border border-border/40 bg-card shadow-sm hover:shadow-lg hover:border-primary/40 transition-all p-6 group">
                      <div className="flex gap-4 mb-4">
                        <Avatar className="size-16 border-2 border-border group-hover:border-primary transition-all">
                          <AvatarImage src={counselor.profileImageUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{counselor.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{counselor.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-foreground">{counselor.rating || 4.9}</span>
                            <span className="text-xs text-muted-foreground">({counselor.reviewCount || 120} reviews)</span>
                          </div>
                        </div>
                      </div>
                      {counselor.areasOfExpertise && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {counselor.areasOfExpertise.split(',').slice(0, 2).map((area: string) => (
                            <Badge key={area} variant="secondary" className="text-xs">{area.trim()}</Badge>
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
                ) : null}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="space-y-6">
            
            {/* Profile Completion Card */}
            <Card className="rounded-lg border border-border/40 bg-linear-to-br from-primary/10 to-primary/5 p-6">
              <h3 className="font-bold text-foreground mb-4">Profile Completion</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                    <span className="text-lg font-bold text-primary">{completionRate}%</span>
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
                    <p className="text-xs text-foreground font-medium mb-3">Next steps:</p>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      {completionRate < 50 && <li>• Add your academic achievements</li>}
                      {completionRate < 75 && <li>• Upload your documents</li>}
                      {completionRate < 100 && <li>• Review and verify information</li>}
                    </ul>
                  </div>
                )}

                <Link href="/dashboard/student/profile" className="block w-full">
                  <Button className="w-full gap-2" variant={completionRate === 100 ? "outline" : "primary"}>
                    {completionRate === 100 ? "View Profile" : "Complete Profile"}
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
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Search size={16} />
                    Browse Scholarships
                  </Button>
                </Link>
                <Link href="/dashboard/counselors" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users size={16} />
                    Find Counselors
                  </Button>
                </Link>
                <Link href="/dashboard/student/profile" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText size={16} />
                    My Documents
                  </Button>
                </Link>
                <Link href="/dashboard/student/bookings" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar size={16} />
                    My Bookings
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card className="rounded-lg border border-border/40 bg-card p-6">
              <h3 className="font-bold text-foreground mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Applications</span>
                  <span className="font-bold text-lg">{statsData.appliedCount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Saved</span>
                  <span className="font-bold text-lg">{statsData.savedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Deadlines</span>
                  <span className="font-bold text-lg text-orange-600">{statsData.deadlineCount}</span>
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

