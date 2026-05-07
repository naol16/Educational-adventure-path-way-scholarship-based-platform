"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCounselorById } from "../api/counselor-api";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, Briefcase, GraduationCap, Clock, MessageSquare, ShieldCheck, Languages } from "lucide-react";
import { Button, Badge, Avatar, AvatarImage, AvatarFallback, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { StudentBookingModal } from "./StudentBookingModal";
import { CounselorReviews } from "./CounselorReviews";
import { ReviewModal } from "./ReviewModal";
import api from "@/lib/api";
import { MessageCircle, Award, Calendar, ExternalLink, ChevronRight, Share2, Heart } from "lucide-react";

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
    <div className="min-h-screen bg-background pb-20 selection:bg-primary/20">
      {/* Premium Hero Section */}
      <div className="relative min-h-[400px] md:min-h-[500px] w-full overflow-hidden bg-linear-to-br from-primary/10 via-background to-background flex flex-col justify-center border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 py-12 flex flex-col justify-between h-full">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center text-sm font-black text-foreground/80 hover:text-primary transition-colors group w-fit bg-card/50 backdrop-blur-md px-4 py-2 rounded-lg border border-border shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </motion.button>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-20 pb-4">
             <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
             >
                <Avatar className="h-40 w-40 md:h-48 md:w-48 rounded-2xl border-4 border-background shadow-sm relative overflow-hidden group">
                  <AvatarImage src={counselor.profileImageUrl} className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <AvatarFallback className="text-5xl font-black bg-primary/10 text-primary rounded-2xl">
                    {counselor.name ? counselor.name.substring(0, 2).toUpperCase() : 'CO'}
                  </AvatarFallback>
                  <div className="absolute inset-0 ring-1 ring-inset ring-border/20 rounded-2xl" />
                </Avatar>
             </motion.div>

             <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck className="h-3 w-3 mr-1 inline" /> Verified Expert
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      Top Rated
                    </Badge>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-2 font-serif">
                    {counselor.name}
                  </h1>
                  <p className="text-lg md:text-xl text-primary font-bold opacity-90">{counselor.currentPosition || "Expert Academic Counselor"}</p>
                </motion.div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Stat Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Rating", value: Number(counselor.rating || 0).toFixed(1), icon: Star, color: "text-amber-500" },
                { label: "Experience", value: `${counselor.yearsOfExperience || 0}+ Yrs`, icon: Clock, color: "text-blue-500" },
                { label: "Students", value: "500+", icon: GraduationCap, color: "text-emerald-500" },
                { label: "Language", value: counselor.languages?.split(',')[0] || "English", icon: Languages, color: "text-purple-500" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="bg-card shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-border/50 hover:shadow-md transition-all group"
                >
                  <stat.icon className={`h-6 w-6 mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Detailed Content Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-14 p-0 gap-8 mb-8 overflow-x-auto no-scrollbar">
                {["about", "expertise", "education", "reviews"].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-black uppercase tracking-widest px-0 pb-4 transition-all hover:text-primary"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="about" className="space-y-6 mt-0">
                <div className="bg-card shadow-sm border border-border p-8 rounded-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                      <MessageSquare className="h-32 w-32" />
                   </div>
                   <h3 className="text-2xl font-black mb-6 font-serif text-foreground">Personal Statement</h3>
                   <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line font-serif italic">
                     "{counselor.bio || "Hello! I'm here to help you navigate your academic journey and find the perfect path for your future success."}"
                   </p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                      <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/50 border border-border/50 shadow-sm">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</p>
                          <p className="font-bold text-lg text-foreground">{counselor.city ? `${counselor.city}, ` : ''}{counselor.countryOfResidence || "Global"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/50 border border-border/50 shadow-sm">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Availability</p>
                          <p className="font-bold text-lg text-foreground">Mon - Fri, 9AM - 6PM</p>
                        </div>
                      </div>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="expertise" className="space-y-6 mt-0">
                <div className="bg-card shadow-sm border border-border p-8 rounded-2xl">
                   <h3 className="text-2xl font-black mb-8 font-serif">Specializations</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {counselor.areasOfExpertise?.split(",").map((exp: string, i: number) => (
                        <div key={i} className="flex items-center gap-4 group p-4 rounded-2xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
                          <div className="h-14 w-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                            <Award className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="font-black text-xl leading-tight">{exp.trim()}</p>
                            <p className="text-sm text-muted-foreground">Premium Guidance</p>
                          </div>
                        </div>
                      )) || <p className="text-muted-foreground">No specific expertise listed.</p>}
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-6 mt-0">
                <div className="bg-card shadow-sm border border-border p-8 rounded-2xl">
                   <h3 className="text-2xl font-black mb-8 font-serif text-foreground">Academic Credentials</h3>
                   <div className="relative pl-10 border-l-2 border-primary/20 space-y-12">
                      <div className="relative">
                        <div className="absolute -left-[51px] top-0 h-6 w-6 rounded-full bg-primary border-4 border-background" />
                        <h4 className="text-2xl font-black mb-2 text-foreground">{counselor.highestEducationLevel || "Doctorate / Masters"}</h4>
                        <p className="text-xl text-primary font-black mb-2">{counselor.universityName || "Leading Global Institution"}</p>
                        <p className="text-muted-foreground text-lg italic">{counselor.fieldsOfStudy || "Specialized Academic Field"}</p>
                        <Badge className="mt-4 bg-muted border-none text-muted-foreground font-black text-[10px] uppercase tracking-wider px-4 py-1">
                          Graduated {counselor.graduationYear || "Class of 2020"}
                        </Badge>
                      </div>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 mt-0">
                <div className="bg-card shadow-sm border border-border p-8 rounded-2xl">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                     <div>
                       <h3 className="text-2xl font-black font-serif mb-1">Student Satisfaction</h3>
                       <p className="text-sm text-muted-foreground font-bold">Feedback from verified students</p>
                     </div>
                     <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                       <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                       <span className="font-black text-2xl text-amber-600">{Number(counselor.rating || 0).toFixed(1)}</span>
                     </div>
                   </div>

                   <CounselorReviews counselorId={counselor.id} />

                    {reviewableBooking && (
                     <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                          <h4 className="font-black text-xl text-primary mb-2">You have a completed session!</h4>
                          <p className="text-sm text-muted-foreground font-bold">
                            Share your experience with {counselor.name} to help other students.
                          </p>
                        </div>
                        <Button 
                          onClick={() => setShowReviewModal(true)}
                          className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-8 h-12 font-black uppercase tracking-widest text-xs"
                        >
                          Rate Your Session
                        </Button>
                     </div>
                   )}

                   <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border/50 shadow-sm">
                      <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-2">How it works?</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        To maintain high quality, only students who have completed a paid session can leave a rating. 
                        If you've had a session, a "Rate Now" button will appear above.
                      </p>
                   </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-card shadow-sm p-8 rounded-2xl border border-border/50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="text-center mb-8 relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Service Fee</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-black text-primary">$</span>
                  <span className="text-5xl font-black text-foreground tracking-tighter">45</span>
                  <span className="text-muted-foreground font-bold">/session</span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <Button 
                  size="lg" 
                  className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-sm font-black uppercase tracking-widest h-14 group"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Your Session
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg" 
                  className="w-full rounded-lg border-2 border-border/50 hover:border-primary hover:bg-muted text-foreground shadow-sm text-sm font-black uppercase tracking-widest h-14 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Direct Message
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-border flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm font-bold opacity-80">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Secure Escrow Payments
                </div>
                <div className="flex items-center gap-3 text-sm font-bold opacity-80">
                  <Clock className="h-5 w-5 text-primary" />
                  100% Satisfaction Guarantee
                </div>
              </div>
            </motion.div>

            <div className="bg-card shadow-sm p-6 rounded-2xl border border-border/50">
               <h4 className="font-black text-sm text-foreground uppercase tracking-widest mb-4">Why choose this expert?</h4>
               <ul className="space-y-3">
                  {[
                    "Extensive local market knowledge",
                    "Personalized scholarship matching",
                    "Direct university connections",
                    "Visa application assistance"
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-muted-foreground font-bold">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ChevronRight className="h-3 w-3 text-primary" />
                      </div>
                      {tip}
                    </li>
                  ))}
               </ul>
            </div>
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
            // Optionally refresh counselor data
          }}
        />
      )}
    </div>
  );
};
