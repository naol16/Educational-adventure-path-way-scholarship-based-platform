"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCounselorById } from "../api/counselor-api";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, Briefcase, GraduationCap, Clock, MessageSquare, ShieldCheck, Languages } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { StudentBookingModal } from "./StudentBookingModal";
import { CounselorReviews } from "./CounselorReviews";

export const CounselorDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const counselorId = params?.id as string;

  const [counselor, setCounselor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!counselorId) return;
    const fetchCounselor = async () => {
      try {
        const res = await getCounselorById(counselorId);
        setCounselor(res.data || res);
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header Back Button */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Search
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="glass-card p-6 md:p-8 rounded-3xl border-none relative overflow-hidden text-center">
            <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-primary/10 to-transparent" />
            
            <Avatar className="h-32 w-32 mx-auto rounded-3xl border-4 border-background shadow-xl mb-6 relative z-10">
              <AvatarImage src={counselor.profileImageUrl} className="object-cover" />
              <AvatarFallback className="text-4xl font-black primary-gradient text-white">
                {counselor.name ? counselor.name.substring(0, 2).toUpperCase() : 'CO'}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-2xl font-black mb-1 text-foreground">{counselor.name}</h1>
            <p className="text-sm text-primary font-bold mb-4">{counselor.currentPosition || "Expert Counselor"}</p>

            <div className="flex items-center justify-center gap-2 mb-6 text-sm font-medium">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{Number(counselor.rating || 0).toFixed(1)}</span>
              <span className="text-muted-foreground">({counselor.totalReviews || 0} reviews)</span>
            </div>

            <Button 
              size="lg" 
              className="w-full rounded-2xl primary-gradient text-white shadow-lg shadow-primary/20 text-sm font-bold uppercase tracking-wide h-12"
              onClick={() => setShowBookingModal(true)}
            >
              Book Session
            </Button>
          </div>

          <div className="glass-card p-6 rounded-3xl border-none space-y-4">
            <h3 className="font-bold text-lg mb-4">Quick Facts</h3>
            
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <span>{counselor.city ? `${counselor.city}, ` : ''}{counselor.countryOfResidence || "Global"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <span>{counselor.yearsOfExperience || 0}+ Years Experience</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Languages className="h-5 w-5 text-muted-foreground shrink-0" />
              <span>
                {counselor.languages || (counselor.supportedLanguages?.length ? counselor.supportedLanguages.join(", ") : "English")}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="text-emerald-500 font-medium">Identity Verified</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Details & Reviews */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* About */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border-none">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              About Me
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
              {counselor.bio || "This counselor hasn't added a bio yet."}
            </div>
          </div>

          {/* Expertise */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border-none">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {counselor.areasOfExpertise ? 
                counselor.areasOfExpertise.split(",").map((exp: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1.5 text-xs font-bold">
                    {exp.trim()}
                  </Badge>
                )) : 
                <span className="text-sm text-muted-foreground">No specific expertise listed.</span>
              }
            </div>
          </div>

          {/* Education */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border-none">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Education Background
            </h2>
            {counselor.highestEducationLevel ? (
              <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                <p className="font-bold">{counselor.highestEducationLevel}</p>
                {counselor.fieldsOfStudy && <p className="text-sm text-muted-foreground mt-1">{counselor.fieldsOfStudy}</p>}
                {counselor.universityName && <p className="text-sm text-muted-foreground mt-1">{counselor.universityName} {counselor.studyCountry ? `(${counselor.studyCountry})` : ''}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Education details not provided.</p>
            )}
          </div>

          {/* Reviews */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border-none">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Student Reviews
            </h2>
            <CounselorReviews counselorId={counselor.id} />
          </div>

        </motion.div>
      </div>

      {showBookingModal && (
        <StudentBookingModal 
          counselor={counselor}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};
