import { Scholarship } from "../types";
import { Card, CardBody, Badge, Button } from "@/components/ui";
import {
  MapPin,
  ExternalLink,
  Info,
  Sparkles,
  Calendar,
  DollarSign,
  GraduationCap,
  Globe,
  Clock,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  variant?: "featured" | "list" | "grid";
}

export const ScholarshipCard = ({
  scholarship,
  variant = "list",
}: ScholarshipCardProps) => {
  const deadline = scholarship.deadline
    ? new Date(scholarship.deadline).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No deadline";

  const matchScore = scholarship.matchScore;

  if (variant === "featured") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative"
      >
        <Card className="rounded-2xl shadow-sm border-border bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
          <CardBody className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-wrap gap-2">
                {matchScore !== undefined && (
                  <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    ✨ {Math.round(matchScore)}% Precision Match
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground bg-muted/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full"
                >
                  {scholarship.fundType || "FULLY FUNDED"}
                </Badge>
              </div>
            </div>

            <h3 className="text-3xl font-black text-foreground mb-4 tracking-tighter leading-tight uppercase">
              {scholarship.title}
            </h3>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-xs font-bold uppercase tracking-widest mb-10">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>{scholarship.country || "International"}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-primary" />
                <span>
                  {scholarship.degreeLevels?.join(", ") || "Global Standard"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 p-8 bg-muted/30 rounded-3xl border border-border/50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <DollarSign size={12} /> Funding Amount
                </p>
                <p className="text-xl font-black text-foreground tracking-tight">
                  {scholarship.amount || "Variable Support"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock size={12} /> Submission Window
                </p>
                <p className="text-xl font-black text-foreground tracking-tight">
                  {deadline}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href={`/dashboard/student/scholarships/${scholarship.id}`}
                className="h-16 rounded-lg border border-border text-foreground hover:bg-muted font-black uppercase tracking-widest text-[10px] flex items-center justify-center transition-all"
              >
                In-Depth Details
              </Link>
              <a
                href={scholarship.applicationUrl || "#"}
                target="_blank"
                className="h-16 primary-gradient text-white rounded-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/20 hover:scale-[1.02]"
              >
                Launch Application <ExternalLink size={16} />
              </a>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  if (variant === "grid") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative h-full"
      >
        <Card className="rounded-2xl shadow-sm border-border/60 bg-card hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col">
          <CardBody className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <Badge className="bg-muted/50 text-muted-foreground border-none px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                {scholarship.fundType || "OTHER"}
              </Badge>
              {matchScore !== undefined && (
                <div className="flex items-center gap-1.5 text-primary text-[10px] font-black">
                  <Trophy size={14} />
                  {Math.round(matchScore)}%
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-foreground mb-4 tracking-tighter uppercase leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {scholarship.title}
            </h3>

            <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-8">
              <MapPin size={14} className="opacity-50" />
              <span className="truncate">
                {scholarship.country || "Global"}
              </span>
            </div>

            <div className="mt-auto space-y-8">
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Support
                  </p>
                  <p className="text-xs font-black text-foreground truncate">
                    {scholarship.amount || "Variable"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Closes
                  </p>
                  <p className="text-xs font-black text-foreground">
                    {deadline}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/dashboard/student/scholarships/${scholarship.id}`}
                  className="h-12 rounded-lg border border-border text-foreground bg-muted/20 hover:bg-muted font-black uppercase tracking-widest text-[9px] flex items-center justify-center transition-all"
                >
                  Details
                </Link>
                <a
                  href={scholarship.applicationUrl || "#"}
                  target="_blank"
                  className="h-12 primary-gradient text-white rounded-lg flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] transition-all shadow-lg"
                >
                  Apply <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // LIST VARIANT (Default)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="rounded-2xl shadow-xs border border-border/40 bg-card hover:bg-muted/20 hover:shadow-lg transition-all duration-500 overflow-hidden">
        <CardBody className="p-0">
          <div className="flex flex-col lg:flex-row items-stretch min-h-30">
            {/* Left: Score Indicator */}
            {matchScore !== undefined && (
              <div className="lg:w-20 bg-primary/5 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border/40 group-hover:bg-primary/10 transition-colors">
                <div className="text-center">
                  <p className="text-[8px] font-black text-primary uppercase tracking-tighter mb-1">
                    Match
                  </p>
                  <p className="text-lg font-black text-primary leading-none">
                    {Math.round(matchScore)}%
                  </p>
                </div>
              </div>
            )}

            {/* Middle: Content */}
            <div className="flex-1 p-6 flex flex-col justify-center gap-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-foreground tracking-tighter uppercase leading-tight group-hover:text-primary transition-colors">
                  {scholarship.title}
                </h3>
                <Badge className="text-[8px] bg-muted text-muted-foreground border-none font-black uppercase tracking-widest px-2 py-0.5">
                  {scholarship.fundType || "Standard"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                  <MapPin size={12} className="text-primary/60" />
                  <span>{scholarship.country || "Global Region"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                  <GraduationCap size={12} className="text-primary/60" />
                  <span>{scholarship.degreeLevels?.[0] || "All Levels"}</span>
                </div>
              </div>
            </div>

            {/* Stats: Amount & Deadline */}
            <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-border/40 p-6 flex items-center justify-between lg:justify-center gap-12 bg-muted/10">
              <div className="text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                  Funding
                </p>
                <p className="text-xs font-black text-foreground tracking-tight truncate max-w-25">
                  {scholarship.amount || "Variable"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                  Closes
                </p>
                <p className="text-xs font-black text-foreground tracking-tight">
                  {deadline}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border/40 p-6 flex items-center gap-3 bg-muted/5">
              <Link
                href={`/dashboard/student/scholarships/${scholarship.id}`}
                className="flex-1 h-11 rounded-lg border border-border text-foreground hover:bg-muted font-black uppercase tracking-widest text-[9px] flex items-center justify-center transition-all"
              >
                Explore
              </Link>
              <a
                href={scholarship.applicationUrl || "#"}
                target="_blank"
                className="flex-1 h-11 primary-gradient text-white rounded-lg flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] transition-all shadow-md shadow-primary/10"
              >
                Apply Now <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
