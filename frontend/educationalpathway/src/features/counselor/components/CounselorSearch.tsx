'use client';

import { Users, Search, Award, Calendar, Loader2, Star, ShieldCheck, MapPin, Sparkles, Filter, ChevronDown, X } from 'lucide-react';
import { Input, Button, Card, CardBody, Badge, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { useEffect, useState } from 'react';
import { getRecommendedCounselors, getCounselors } from '../api/counselor-api';
import { StudentBookingModal } from './StudentBookingModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CounselorCard = ({ counselor, onBook }: { counselor: any; onBook: (c: any) => void }) => {
  console.log('Counselor data:', { id: counselor.id, score: counselor.recommendationScore, match: counselor.match_score });
  return (
    <Card className="rounded-2xl shadow-sm border border-border/40 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:shadow-xl transition-all duration-500 overflow-hidden group relative">
      <CardBody className="p-8">
        {/* Match Score Badge */}
        {(counselor.recommendationScore > 0 || counselor.match_score > 0) && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles size={10} className="fill-primary" />
              {Math.round(counselor.recommendationScore || counselor.match_score)}% Match
            </Badge>
          </div>
        )}
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href={`/dashboard/counselors/${counselor.id}`} className="relative shrink-0">
            <Avatar className="size-24 rounded-2xl border-2 border-background shadow-lg group-hover:border-primary/30 transition-all">
              {counselor.profileImageUrl && (
                <AvatarImage src={counselor.profileImageUrl} className="object-cover" />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                {counselor?.name?.trim() ? counselor.name.trim().charAt(0).toUpperCase() : 'C'}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="space-y-2">
            <Link href={`/dashboard/counselors/${counselor.id}`}>
              <h3 className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
                {counselor?.name || 'Anonymous Expert'}
              </h3>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Link href={`/dashboard/counselors/${counselor.id}`}>
              <Button
                variant="outline"
                className="w-full rounded-xl h-12 px-4 font-black uppercase tracking-widest text-[9px] border-border/60 hover:bg-muted text-foreground transition-all bg-card/50"
              >
                Details
              </Button>
            </Link>
            <Button
              onClick={() => onBook(counselor)}
              className="w-full rounded-xl h-12 px-4 font-black uppercase tracking-widest text-[9px] primary-gradient text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Booking
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export const CounselorSearch = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ country: '', expertise: '' });

  const fetchCounselors = async (search = '') => {
    setLoading(true);
    try {
      let recommended: any[] = [];
      if (!search && !filters.country && !filters.expertise) {
        try {
          recommended = await getRecommendedCounselors();
        } catch (e) {
          console.error('Failed to fetch recommendations', e);
        }
      }

      const data = await getCounselors({ 
        search: search || undefined,
        country: filters.country || undefined,
        expertise: filters.expertise || undefined
      });
      const all = data.rows || [];

      let merged = [...recommended];
      const recommendedIds = new Set(recommended.map(c => c.id));
      
      all.forEach((c: any) => {
        if (!recommendedIds.has(c.id)) {
          merged.push(c);
        }
      });

      setCounselors(merged);
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
      toast.error('Failed to load counselors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCounselors(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16 relative z-10">

        {/* Premium Header */}
        <section 
          className="relative py-10 md:py-16 group"
        >
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl space-y-8">
               <div className="flex items-center gap-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                   <Sparkles size={12} className="fill-primary" />
                   Elite Advisory Network
                 </div>
                 <div className="h-4 w-px bg-border/40" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Verified Consultants Only</span>
               </div>
               
               <div className="space-y-4">
                 <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-none">
                   Strategic <span className="text-muted-foreground/20 dark:text-zinc-800 ml-4">Advisors</span>
                 </h1>
                 <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                   Synchronize with international academic experts authorized to optimize your scholarship strategy and institutional alignment.
                 </p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="size-20 rounded-[32px] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Users size={32} />
               </div>
            </div>
          </div>
        </section>

        {/* Standardized Toolbar */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-4 border-b border-border/10">
            <div className="flex gap-10">
              <button className="pb-6 text-xs font-black uppercase tracking-[0.2em] relative transition-all text-primary">
                All Experts
                <motion.div
                  layoutId="counselor-tab-dot"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.4)]"
                />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 lg:max-w-2xl">
              <div className="relative group flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query expertise, institution, or region..." 
                  className="w-full h-14 pl-14 pr-6 bg-card border border-border/40 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all shadow-xs"
                />
              </div>

              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-14 px-8 rounded-2xl flex items-center gap-3 font-black text-[10px] tracking-widest uppercase transition-all duration-500 shadow-lg ${showFilters ? 'bg-primary text-white' : 'bg-card border border-border/60 text-foreground hover:bg-muted'}`}
              >
                <Filter size={14} />
                Filters
                <ChevronDown size={14} className={`transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Filters Expansion */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="overflow-hidden bg-card/30 backdrop-blur-sm border border-border/40 rounded-[32px] px-10 py-10 shadow-inner"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Regional Expertise</span>
                    </div>
                    <select 
                      value={filters.country}
                      onChange={(e) => setFilters({...filters, country: e.target.value})}
                      className="w-full h-14 px-6 bg-card border border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="">Global Network</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Specialization</span>
                    </div>
                    <select 
                      value={filters.expertise}
                      onChange={(e) => setFilters({...filters, expertise: e.target.value})}
                      className="w-full h-14 px-6 bg-card border border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="">All Disciplines</option>
                      <option value="Visa Support">Visa & Immigration</option>
                      <option value="Scholarship Strategy">Scholarship Strategy</option>
                      <option value="Academic Writing">Academic Writing</option>
                      <option value="Career Guidance">Career Guidance</option>
                    </select>
                  </div>
                </div>

                {(filters.country || filters.expertise) && (
                  <div className="mt-10 flex justify-end border-t border-border/10 pt-6">
                    <button 
                      onClick={() => setFilters({ country: '', expertise: '' })}
                      className="text-[10px] font-black text-muted-foreground hover:text-destructive flex items-center gap-3 transition-colors tracking-widest uppercase"
                    >
                      <X size={14} />
                      Purge Filter Parameters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Counselors Grid */}
        <div className="pb-20">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-card/40 rounded-2xl animate-pulse border border-border/20" />
               ))}
            </div>
          ) : counselors?.length > 0 ? (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {counselors.map((counselor, i) => (
                  <motion.div
                    key={counselor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <CounselorCard 
                      counselor={counselor} 
                      onBook={setSelectedCounselor} 
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <Card className="rounded-2xl border border-dashed border-border/40 bg-card/20 p-24 text-center shadow-inner backdrop-blur-sm space-y-6">
              <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                <Users className="size-10 text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Signal Lost</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                  We couldn't synchronize with an expert matching your current parameters. Purge your search query and try again.
                </p>
              </div>
              <Button onClick={() => setSearchQuery('')} variant="outline" className="h-12 px-8 rounded-full font-black uppercase tracking-widest text-[10px] border-border/60">
                Reset Calibration
              </Button>
            </Card>
          )}
        </div>

        {/* Booking Modal */}
        {selectedCounselor && (
          <StudentBookingModal 
            counselor={selectedCounselor}
            onClose={() => setSelectedCounselor(null)}
          />
        )}
      </div>
    </div>
  );
};

