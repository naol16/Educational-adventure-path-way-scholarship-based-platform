'use client';

import { Users, Search, Award, Calendar, Loader2, Star, ShieldCheck, MapPin } from 'lucide-react';
import { Input, Button, Card, CardBody, Badge, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { useEffect, useState } from 'react';
import { getRecommendedCounselors, getCounselors } from '../api/counselor-api';
import { StudentBookingModal } from './StudentBookingModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CounselorCard = ({ counselor, onBook }: { counselor: any; onBook: (c: any) => void }) => {
  return (
    <Card className="rounded-xl shadow-sm border-border bg-card hover:shadow-md transition-all duration-300 overflow-hidden group">
      <CardBody className="p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex items-start gap-6 flex-1">
             <Link href={`/dashboard/counselors/${counselor.id}`}>
                <Avatar className="h-20 w-20 rounded-xl border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors shrink-0">
                  <AvatarImage src={counselor.profileImageUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {counselor?.name ? counselor.name.substring(0, 2).toUpperCase() : 'CO'}
                  </AvatarFallback>
                </Avatar>
             </Link>

            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                 <Link href={`/dashboard/counselors/${counselor.id}`}>
                    <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors font-serif">
                      {counselor?.name || 'Anonymous Expert'}
                    </h3>
                 </Link>
                 <div className="flex items-center gap-2">
                   <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5 rounded-full text-[10px] font-bold">
                     <ShieldCheck size={12} className="mr-1" /> Verified
                   </Badge>
                   <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                     <Star size={12} className="fill-amber-500" />
                     <span className="text-[10px] font-bold">{Number(counselor.rating || 4.8).toFixed(1)}</span>
                   </div>
                 </div>
              </div>

              <p className="text-sm font-bold text-primary">{counselor.currentPosition || "Expert Academic Counselor"}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Award size={14} /> {counselor.yearsOfExperience || 5}+ Years Exp.</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {counselor.countryOfResidence || "Global"}</span>
              </div>

              {counselor.areasOfExpertise && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {counselor.areasOfExpertise.split(',').slice(0, 3).map((exp: string, i: number) => (
                    <Badge key={i} variant="outline" className="border-border text-muted-foreground text-[9px] font-bold uppercase tracking-widest px-2 rounded-full bg-muted/30">
                      {exp.trim()}
                    </Badge>
                  ))}
                  {counselor.areasOfExpertise.split(',').length > 3 && (
                    <Badge variant="outline" className="border-border text-muted-foreground text-[9px] font-bold uppercase tracking-widest px-2 rounded-full bg-muted/30">
                      +{counselor.areasOfExpertise.split(',').length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 lg:shrink-0 lg:w-48 lg:border-l lg:border-border lg:pl-6">
            <div className="text-center mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Session Rate</p>
              <p className="text-2xl font-black text-foreground">$45</p>
            </div>
            <Link href={`/dashboard/counselors/${counselor.id}`}>
              <Button
                variant="outline"
                className="w-full rounded-lg h-10 font-bold text-xs border-border hover:bg-muted text-foreground transition-all"
              >
                View Profile
              </Button>
            </Link>
            <Button
              onClick={() => onBook(counselor)}
              className="w-full rounded-lg h-10 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
            >
              Book Session
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

  // Booking Modal State
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);

  const fetchCounselors = async (search = '') => {
    setLoading(true);
    try {
      // Fetch recommendations first if student and NO search query
      let recommended: any[] = [];
      if (!search) {
        try {
          recommended = await getRecommendedCounselors();
        } catch (e) {
          console.error('Failed to fetch recommendations', e);
        }
      }

      // Fetch counselors from the directory
      const data = await getCounselors(search ? { search } : {});
      const all = data.rows || [];

      // Merge or prioritize recommended ones
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

  // Real-time debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCounselors(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">

      {/* Premium Header */}
      <div className="bg-card shadow-sm border border-border rounded-xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
           <Users className="h-64 w-64" />
        </div>
        
        <div className="space-y-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif">
            Elite Academic <span className="text-primary">Advisors</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">
            Connect with verified experts globally to optimize your scholarship applications, secure admissions, and plan your academic journey.
          </p>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, expertise, university, or location..."
            className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-foreground placeholder:font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="h-14 px-8 rounded-lg font-bold bg-foreground hover:bg-foreground/90 text-background shrink-0 shadow-sm text-sm">
           Filter Matches
        </Button>
      </div>

      {/* Counselors Grid/List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-card rounded-xl animate-pulse border border-border/50" />
             ))}
          </div>
        ) : counselors?.length > 0 ? (
          <AnimatePresence>
            {counselors.map((counselor, i) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CounselorCard 
                  counselor={counselor} 
                  onBook={setSelectedCounselor} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="rounded-xl border border-dashed border-border bg-card p-24 text-center shadow-sm">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Match Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
              We couldn't find an expert matching your current search. Try adjusting your keywords or clearing the filters.
            </p>
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
  );
};
