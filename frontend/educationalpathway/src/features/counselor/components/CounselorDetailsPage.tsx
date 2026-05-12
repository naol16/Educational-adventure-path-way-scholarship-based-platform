"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCounselorById } from "../api/counselor-api";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, Briefcase, GraduationCap, Clock, MessageSquare, ShieldCheck, Languages } from "lucide-react";
import { Button, Badge, Avatar, AvatarImage, AvatarFallback, Tabs, TabsContent, TabsList, TabsTrigger, Card } from "@/components/ui";
import { StudentBookingModal } from "./StudentBookingModal";
import { CounselorReviews } from "./CounselorReviews";
import { ReviewModal } from "./ReviewModal";
import api from "@/lib/api";
import { MessageCircle, Award, Calendar, ExternalLink, ChevronRight, Share2, Heart, Sparkles } from "lucide-react";

export const CounselorDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const counselorId = params?.id as string;

  const [counselor, setCounselor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reviewableBooking, setReviewableBooking] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!counselorId) return;
    const fetchCounselor = async () => {
      try {
        const res = await getCounselorById(counselorId);
        const data = res.data || res;
        setCounselor(data);

        // Check for reviewable bookings
        try {
          const bookingsRes = await api.get('/counselors/student/bookings');
          const bookings = bookingsRes.data?.data || bookingsRes.data || [];
          const unreviewed = bookings.find((b: any) => 
            b.counselorId === data.id && 
            b.status === 'completed' && 
            !b.isReviewed
          );
          if (unreviewed) {
            setReviewableBooking(unreviewed);
          }
        } catch (e) {
          console.log("Could not fetch bookings for review check");
        }
      } catch (err) {
        console.error("Failed to fetch counselor details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselor();
  }, [counselorId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
        <h2 className="text-2xl font-bold mb-2">Counselor Not Found</h2>
        <p className="text-muted-foreground mb-6">The counselor you are looking for doesn't exist or is unavailable.</p>
        <Button onClick={() => router.back()} className="rounded-full">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />

      {/* Premium Hero Section */}
      <div className="relative min-h-[500px] w-full flex flex-col justify-center border-b border-border/40 z-10 overflow-hidden">
        {/* Animated Hero Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full -mr-80 -mt-80 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12 flex flex-col justify-between h-full">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center text-[10px] font-black text-muted-foreground hover:text-primary transition-all group w-fit bg-card/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-border/40 shadow-sm uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Synchronize Directory
          </motion.button>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-10 relative z-20 pb-4 mt-16 md:mt-0">
             <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative"
             >
                <Avatar className="size-48 md:size-56 rounded-2xl border-4 border-background relative z-10 group overflow-hidden">
                  <AvatarImage src={counselor.profileImageUrl} className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <AvatarFallback className="text-6xl font-black bg-primary/10 text-primary">
                    {counselor.name ? counselor.name.charAt(0).toUpperCase() : 'C'}
                  </AvatarFallback>
                </Avatar>
             </motion.div>
 
             <div className="flex-1 text-center md:text-left space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">
                      <ShieldCheck className="h-3.5 w-3.5 mr-2 inline" strokeWidth={3} /> Verified Expert
                    </Badge>
                    {counselor.match_score > 0 && (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">
                        <Sparkles className="h-3.5 w-3.5 mr-2 inline" strokeWidth={3} />
                        {Math.round(counselor.match_score)}% Precision Match
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
                    {counselor.name}
                  </h1>
                  <p className="text-lg md:text-xl text-primary font-black uppercase tracking-tight opacity-80">{counselor.currentPosition || "Expert Academic Counselor"}</p>
                </motion.div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Main Content Area Area */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Tactical Stat Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { 
                  label: "AI Compatibility", 
                  value: counselor.match_score ? `${counselor.match_score}%` : "---", 
                  icon: Sparkles, 
                  color: "text-primary", 
                  bgColor: "bg-primary/10" 
                },
                { label: "Precision Rating", value: Number(counselor.rating || 0).toFixed(1), icon: Star, color: "text-amber-500", bgColor: "bg-amber-500/10" },
                { label: "Tactical Exp", value: `${counselor.yearsOfExperience || 0}+ Yrs`, icon: Clock, color: "text-blue-500", bgColor: "bg-blue-500/10" },
                { label: "Frequency", value: counselor.supportedLanguages?.[0] || "English", icon: Languages, color: "text-purple-500", bgColor: "bg-purple-500/10" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="bg-card/40 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-border/40 hover:border-primary/40 hover:scale-105 transition-all group"
                >
                  <div className={`size-12 rounded-2xl ${stat.bgColor} ${stat.color} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
                    <stat.icon className="size-6" strokeWidth={2.5} />
                  </div>
                  <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Detailed Content Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-transparent border-b border-border/40 w-full justify-start rounded-none h-16 p-0 gap-10 mb-12 overflow-x-auto no-scrollbar">
                {["about", "expertise", "education", "reviews"].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] font-black uppercase tracking-[0.3em] px-0 pb-5 transition-all hover:text-primary data-[state=active]:text-primary"
                  >
                    {tab} Protocol
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="about" className="space-y-16 mt-0 pt-8">
                <div className="space-y-12">
                   <div className="flex items-center gap-4">
                      <div className="h-6 w-1 bg-primary rounded-full" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Strategic Intent</h3>
                   </div>
                   <p className="text-2xl md:text-3xl text-foreground/80 font-serif font-medium leading-relaxed italic max-w-4xl">
                     "{counselor.bio || "Hello! I'm here to help you navigate your academic journey and find the perfect path for your future success."}"
                   </p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                      <div className="flex items-start gap-6 group/card">
                        <div className="size-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover/card:bg-primary group-hover/card:text-white transition-all duration-500">
                          <MapPin className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Geographic Node</p>
                          <p className="font-black text-xl text-foreground uppercase tracking-tight">{counselor.city ? `${counselor.city}, ` : ''}{counselor.countryOfResidence || "Global"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-6 group/card">
                        <div className="size-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover/card:bg-primary group-hover/card:text-white transition-all duration-500">
                          <Calendar className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Duty Cycles</p>
                          <p className="font-black text-xl text-foreground uppercase tracking-tight">Mon - Fri, 09:00 - 18:00</p>
                        </div>
                      </div>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="expertise" className="space-y-10 mt-0">
                <div className="bg-card/40 backdrop-blur-sm border border-border/40 p-10 md:p-12 rounded-2xl">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="h-6 w-1 bg-primary rounded-full" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Expertise Matrix</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {counselor.areasOfExpertise?.split(",").map((exp: string, i: number) => (
                        <div key={i} className="flex items-center gap-6 group p-6 rounded-2xl hover:bg-primary/5 transition-all duration-500 border border-transparent hover:border-primary/20">
                          <div className="size-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                            <Award className="size-7 text-primary group-hover:text-white transition-colors" strokeWidth={2} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-lg uppercase tracking-tight text-foreground leading-none">{exp.trim()}</p>
                            <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/40">Verified Mastery</p>
                          </div>
                        </div>
                      )) || <p className="text-muted-foreground">No specific expertise listed.</p>}
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-10 mt-0">
                <div className="bg-card/40 backdrop-blur-sm border border-border/40 p-10 md:p-12 rounded-2xl">
                   <div className="flex items-center gap-4 mb-12">
                      <div className="h-6 w-1 bg-primary rounded-full" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Academic Pedigree</h3>
                   </div>
                   <div className="relative pl-12 border-l-2 border-primary/20 space-y-16 py-4">
                      <div className="relative">
                        <div className="absolute -left-[63px] top-0 size-8 rounded-full bg-primary border-4 border-background" />
                        <h4 className="text-3xl font-black uppercase tracking-tight text-foreground leading-none mb-4">{counselor.highestEducationLevel || "Doctorate / Masters"}</h4>
                        <p className="text-2xl text-primary font-black uppercase tracking-tighter mb-4 leading-none">{counselor.universityName || "Leading Global Institution"}</p>
                        <p className="text-lg text-muted-foreground font-medium italic border-l-2 border-border/40 pl-6 py-1">{counselor.fieldsOfStudy || "Specialized Academic Field"}</p>
                        <div className="mt-8 inline-flex items-center gap-3 px-6 py-2 bg-muted/40 border border-border/40 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                          <Calendar className="size-3.5" />
                          Conferred {counselor.graduationYear || "Class of 2020"}
                        </div>
                      </div>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-10 mt-0">
                <div className="bg-card/40 backdrop-blur-sm border border-border/40 p-10 md:p-12 rounded-2xl">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                     <div className="space-y-2">
                        <div className="flex items-center gap-4">
                           <div className="h-6 w-1 bg-primary rounded-full" />
                           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Historical Performance</h3>
                        </div>
                        <p className="text-3xl font-black uppercase tracking-tight">Student Testimonials</p>
                     </div>
                     <div className="flex items-center gap-6 px-10 py-6 bg-amber-500/5 rounded-2xl border border-amber-500/10 group">
                       <Star className="size-10 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" strokeWidth={0} />
                       <div className="space-y-1">
                          <span className="font-black text-5xl text-foreground tracking-tighter leading-none">{Number(counselor.rating || 0).toFixed(1)}</span>
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/60">Verified Accuracy</p>
                       </div>
                     </div>
                   </div>
 
                   <CounselorReviews counselorId={counselor.id} />
 
                    {reviewableBooking && (
                     <div className="mt-16 p-12 rounded-2xl primary-gradient shadow-primary/20 flex flex-col md:flex-row items-center justify-between gap-10 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 size-48 bg-white/5 blur-3xl -mr-24 -mt-24" />
                        <div className="relative z-10 space-y-4 text-center md:text-left">
                          <h4 className="font-black text-3xl text-white tracking-tight uppercase leading-none">Session Finalized</h4>
                          <p className="text-lg text-white/80 font-medium max-w-md leading-relaxed">
                            Contribute your strategic insights regarding {counselor.name} to the collective intelligence.
                          </p>
                        </div>
                        <Button 
                          onClick={() => setShowReviewModal(true)}
                          className="relative z-10 h-16 px-12 rounded-xl bg-white text-primary hover:bg-white/90 shadow-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95"
                        >
                          Protocol Review
                        </Button>
                     </div>
                   )}
 
                   <div className="mt-16 p-8 rounded-2xl bg-muted/20 border border-border/40 flex items-start gap-6">
                      <div className="size-12 rounded-2xl bg-card flex items-center justify-center text-primary border border-border/20 shrink-0">
                         <ShieldCheck className="size-6" strokeWidth={2.5} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">Trust Protocol</h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                          Integrity is paramount. Only students who have successfully finalized an authorized session are permitted to contribute ratings. 
                          The review portal will activate automatically upon session verification.
                        </p>
                      </div>
                   </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Tactical Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/40 overflow-hidden"
            >
              {/* Booking & Pricing Section */}
              <div className="p-10 border-b border-border/10 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Protocol Authorization</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground tracking-tighter">$45</span>
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">/ Session</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full h-18 rounded-xl primary-gradient text-white text-[11px] font-black uppercase tracking-[0.2em] group transition-all hover:scale-[1.02] active:scale-95 border-none"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Initiate Booking
                    <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="w-full h-18 rounded-xl border-2 border-border/60 hover:bg-muted text-foreground text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95"
                    onClick={() => router.push(`/dashboard/student/chat?userId=${counselor.userId}`)}
                  >
                    <MessageCircle className="h-5 w-5 text-primary" strokeWidth={2.5} />
                    Secure Channel
                  </Button>
                </div>
              </div>

              {/* Trust & Insights Section */}
              <div className="p-10 space-y-10 bg-muted/5">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <ShieldCheck size={16} className="text-emerald-500" strokeWidth={3} />
                    Escrow Secure Payment
                  </div>
                  <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Clock size={16} className="text-primary" strokeWidth={3} />
                    Satisfaction Guaranteed
                  </div>
                </div>

                <div className="pt-10 border-t border-border/10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="size-1.5 rounded-full bg-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expertise Insights</h4>
                  </div>
                  <ul className="space-y-5">
                    {[
                      "Deep local market intelligence",
                      "Advanced scholarship synchronization",
                      "Direct institutional conduits",
                      "Strategic visa protocol assistance"
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-4 text-[11px] text-foreground/70 font-bold leading-relaxed group">
                        <ChevronRight size={14} className="text-primary mt-0.5 shrink-0" strokeWidth={3} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {showBookingModal && (
        <StudentBookingModal 
          counselor={counselor}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showReviewModal && reviewableBooking && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          bookingId={reviewableBooking.id}
          counselorName={counselor.name}
          onSuccess={() => {
            setShowReviewModal(false);
            setReviewableBooking(null);
          }}
        />
      )}
    </div>
  );
};

