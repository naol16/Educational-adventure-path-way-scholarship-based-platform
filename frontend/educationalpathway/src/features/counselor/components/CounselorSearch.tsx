'use client';

import { Users, Search, Award, Calendar, Loader2, Star } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { useEffect, useState } from 'react';
import { getRecommendedCounselors, getCounselors } from '../api/counselor-api';
import { StudentBookingModal } from './StudentBookingModal';
import { CounselorReviews } from './CounselorReviews';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CounselorCard = ({ counselor, onBook }: { counselor: any; onBook: (c: any) => void }) => {

  return (
    <div className="divide-y divide-border/50">
      <div
        className="flex flex-col md:flex-row md:items-center justify-between p-8 hover:bg-muted/30 transition gap-8"
      >
        {/* Left */}
          <Link href={`/dashboard/counselors/${counselor.id}`} className="flex items-center gap-6 group cursor-pointer">
            <div className="h-16 w-16 rounded-2xl primary-gradient flex items-center justify-center font-black text-white shadow-lg shrink-0 text-xl group-hover:shadow-primary/30 transition-all">
              {counselor?.name ? counselor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'}
            </div>

            <div>
              <h3 className="font-black text-2xl text-foreground group-hover:text-primary transition-colors">
                {counselor?.name || 'Anonymous Expert'}
              </h3>
            </div>
          </Link>

        {/* Right */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link href={`/dashboard/counselors/${counselor.id}`}>
            <Button
              variant="ghost"
              className="w-full sm:w-auto h-12 px-6 font-black uppercase tracking-widest text-[10px] border border-border hover:bg-muted"
            >
              View Details
            </Button>
          </Link>
          <Button
            onClick={() => onBook(counselor)}
            className="h-12 px-8 font-black uppercase tracking-widest text-[10px] primary-gradient text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            Book Session
          </Button>
        </div>
      </div>
    </div>
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

  const handleSearch = () => {
    fetchCounselors(searchQuery);
  };

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="h2 flex items-center gap-3">
            Find an Expert
          </h1>

          <p className="text-body text-muted-foreground max-w-2xl">
            Connect with people who can help you reach your goals with good advice and mentorship.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Input
            icon={<Search size={16} className="text-muted-foreground" />}
            placeholder="Search by name, expertise, or university..."
            className="h-11 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Counselor List */}
      <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">
            Searching for expert matches...
          </div>
        ) : counselors?.length > 0 ? (
          counselors.map((counselor) => (
            <CounselorCard 
              key={counselor.id} 
              counselor={counselor} 
              onBook={setSelectedCounselor} 
            />
          ))
        ) : (
          <div className="p-24 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">No Counselor Matches Found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              We couldn't find counselors matching your precise profile yet. Try broadening your research areas or interests.
            </p>
          </div>
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
