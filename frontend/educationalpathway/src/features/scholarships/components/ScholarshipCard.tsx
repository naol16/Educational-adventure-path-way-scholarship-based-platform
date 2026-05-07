import { Scholarship } from "../types";
import { Card, CardBody, Badge, Button } from "@/components/ui";
import { MapPin, ExternalLink, Info, Sparkles, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  variant?: 'featured' | 'list' | 'grid';
}

export const ScholarshipCard = ({ scholarship, variant = 'list' }: ScholarshipCardProps) => {
  const deadline = scholarship.deadline
    ? new Date(scholarship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : "No deadline";

  const matchScore = scholarship.matchScore;

  if (variant === 'featured') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative"
      >
        <Card className="rounded-xl shadow-sm border-border bg-card hover:shadow-md transition-all duration-300 overflow-hidden">
          <CardBody className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-3">
                {matchScore !== undefined && (
                  <Badge className="bg-primary/10 text-primary border-none px-3 py-1 rounded-full text-[10px] font-bold">
                    ✨ {Math.round(matchScore)}% MATCH
                  </Badge>
                )}
                <Badge variant="outline" className="border-border text-muted-foreground bg-muted/50 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {scholarship.fundType || "FULLY FUNDED"}
                </Badge>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4 font-serif">
              {scholarship.title}
            </h3>

            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-8">
              <MapPin size={14} className="text-muted-foreground/70" />
              <span>{scholarship.country || "South Korea"}</span>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Amount</p>
                <p className="text-base font-bold text-foreground">{scholarship.amount || "Unknown"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Deadline</p>
                <p className="text-base font-bold text-foreground">{deadline}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link 
                href={`/dashboard/student/scholarships/${scholarship.id}`}
                className="h-12 rounded-lg border border-border text-foreground hover:bg-muted font-bold text-sm flex items-center justify-center transition-all"
              >
                Details
              </Link>
              <a 
                href={scholarship.applicationUrl || "#"} 
                target="_blank" 
                className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-all"
              >
                Apply <ExternalLink size={16} />
              </a>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative h-full"
      >
        <Card className="rounded-xl shadow-sm border-border bg-card hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
          <CardBody className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <Badge className="bg-muted/50 text-muted-foreground border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {scholarship.fundType || "OTHER"}
              </Badge>
              {matchScore !== undefined && (
                <Badge className="bg-primary/10 text-primary border-none px-2 py-0.5 rounded-full text-[10px] font-bold">
                  ✨ {Math.round(matchScore)}%
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3 font-serif line-clamp-2 group-hover:text-primary transition-colors">
              {scholarship.title}
            </h3>

            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-6">
              <MapPin size={14} />
              <span className="truncate">{scholarship.country || "Global"}</span>
            </div>

            <div className="mt-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Amount</p>
                  <p className="text-sm font-bold text-foreground truncate">{scholarship.amount || "Variable"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-sm font-bold text-foreground">{deadline}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href={`/dashboard/student/scholarships/${scholarship.id}`}
                  className="h-10 rounded-lg border border-border text-foreground bg-muted/30 hover:bg-muted font-bold text-xs flex items-center justify-center transition-all"
                >
                  Details
                </Link>
                <a 
                  href={scholarship.applicationUrl || "#"} 
                  target="_blank" 
                  className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-sm"
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="rounded-xl shadow-sm border-border bg-card hover:shadow-md transition-all duration-300">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {scholarship.title}
                </h3>
                <Badge className="lg:hidden text-[10px] bg-muted/50 text-muted-foreground border-none font-bold uppercase tracking-widest">
                  {scholarship.fundType || "OTHER"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                  <MapPin size={14} />
                  <span>{scholarship.country || "EU"}</span>
                </div>
                {matchScore !== undefined && (
                  <Badge className="bg-primary/10 text-primary border-none px-2 py-0.5 rounded-full text-[9px] font-bold">
                    {Math.round(matchScore)}% MATCH
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 lg:w-1/3">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Amount</p>
                <p className="text-xs font-bold text-foreground">{scholarship.amount || "Unknown"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Deadline</p>
                <p className="text-xs font-bold text-foreground">{deadline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:shrink-0">
               <Badge className="hidden lg:flex text-[9px] bg-muted/50 text-muted-foreground border-none font-bold uppercase tracking-widest px-3 py-1">
                  {scholarship.fundType || "OTHER"}
                </Badge>
              <Link 
                href={`/dashboard/student/scholarships/${scholarship.id}`}
                className="h-10 px-6 rounded-lg border border-border text-foreground bg-muted/30 hover:bg-muted font-bold text-xs flex items-center justify-center transition-all"
              >
                Details
              </Link>
              <a 
                href={scholarship.applicationUrl || "#"} 
                target="_blank" 
                className="h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-sm"
              >
                Apply <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
