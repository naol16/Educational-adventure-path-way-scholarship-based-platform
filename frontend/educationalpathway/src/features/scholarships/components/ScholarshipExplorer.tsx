'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Filter, Sparkles, RefreshCcw, Search, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScholarshipList } from './ScholarshipList';
import { motion, AnimatePresence } from 'framer-motion';
import { ScholarshipFilters } from '../types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export const ScholarshipExplorer = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  const { data: countriesResponse } = useSWR<any>('/scholarships/countries');
  
  const getFullCountryName = (code: string) => {
    const mapping: Record<string, string> = {
      "ET": "Ethiopia",
      "UK": "United Kingdom",
      "GB": "United Kingdom",
      "US": "United States",
      "USA": "United States",
      "CA": "Canada",
      "AU": "Australia",
      "DE": "Germany",
      "FR": "France",
      "JP": "Japan",
      "CN": "China",
      "IN": "India"
    };
    return mapping[code.toUpperCase()] || code;
  };

  const countries = useMemo(() => {
    // Handle cases where api.ts interceptor might have unwrapped the data or not
    const raw = Array.isArray(countriesResponse) ? countriesResponse : (countriesResponse?.data || []);
    return raw.map((c: string) => ({
      code: c,
      name: getFullCountryName(c)
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [countriesResponse]);

  const [filters, setFilters] = useState<ScholarshipFilters>({
    query: '',
    country: '',
    degree_level: '',
    fund_type: '',
    page: 1,
    pageSize: 12
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setFilters({ ...filters, page: 1 });
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const updateFilter = (key: keyof ScholarshipFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 if any filter other than page changes
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      country: '',
      degree_level: '',
      fund_type: '',
      page: 1,
      pageSize: 12
    });
  };

  const hasActiveFilters = useMemo(() => {
    return filters.query || filters.country || filters.degree_level || filters.fund_type;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12 relative z-10"
      >
        {/* Refined Header Section */}
        <motion.section
          variants={item}
          className="relative py-10 md:py-16 group"
        >

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                  <Sparkles size={12} className="fill-primary" />
                  Curated Intelligence
                </div>
                <div className="h-4 w-px bg-border/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">International Protocol</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-none">
                  Scholarship <span className="text-muted-foreground/20 dark:text-zinc-800 ml-4">Explorer</span>
                </h1>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl">
                  Discover global academic opportunities synchronized with your specific proficiency profile and financial trajectory.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="h-16 w-16 rounded-2xl hover:bg-muted text-muted-foreground border border-border/60 bg-card transition-all active:scale-95 shadow-sm"
              >
                <RefreshCcw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button className="h-16 px-10 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">
                Global Search Strategy
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Standardized Toolbar */}
        <motion.div variants={item} className="flex flex-col gap-10">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-4 border-b border-border/10">
            {/* Tabs */}
            <div className="flex gap-10">
              {['explore', 'matched', 'saved', 'applied'].map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`group pb-6 text-xs font-black uppercase tracking-[0.2em] relative transition-all
                    ${activeTab === id ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}
                  `}
                >
                  {id}
                  {activeTab === id && (
                    <motion.div
                      layoutId="explorer-tab-dot"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.4)]"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 lg:max-w-4xl">
              {/* Search Integrated Bar */}
              <div className="relative group flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <input 
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
                  placeholder="Query title, institution, or region..." 
                  className="w-full h-14 pl-14 pr-6 bg-card border border-border/40 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-14 px-8 rounded-2xl flex items-center gap-3 font-black text-[10px] tracking-widest uppercase transition-all duration-500 shadow-lg ${showFilters ? 'bg-primary text-white' : 'bg-card border border-border/60 text-foreground hover:bg-muted'}`}
                >
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={14} className={`transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                <Button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-14 px-10 rounded-2xl primary-gradient text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isRefreshing ? <RefreshCcw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Start Discovery
                </Button>
              </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Target Country</span>
                    </div>
                    <select
                      value={filters.country}
                      onChange={(e) => updateFilter('country', e.target.value)}
                      className="w-full h-14 px-6 bg-card border border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="">Global Coverage</option>
                      {countries.map((c: any) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Academic Status</span>
                    </div>
                    <select
                      value={filters.degree_level}
                      onChange={(e) => updateFilter('degree_level', e.target.value)}
                      className="w-full h-14 px-6 bg-card border border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="">Any Degree level</option>
                      <option value="Bachelor">Bachelor's Certification</option>
                      <option value="Master">Master's Protocol</option>
                      <option value="PhD">PhD / Doctorate Level</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Funding Matrix</span>
                    </div>
                    <select
                      value={filters.fund_type}
                      onChange={(e) => updateFilter('fund_type', e.target.value)}
                      className="w-full h-14 px-6 bg-card border border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="">All Funding Types</option>
                      <option value="Full">Full Synthesis (100%)</option>
                      <option value="Partial">Partial / Tuition Only</option>
                      <option value="Entrance">Entrance Merits</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-10 flex justify-end border-t border-border/10 pt-6">
                    <button
                      onClick={clearFilters}
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
        </motion.div>

        {/* Integrated Results */}
        <motion.div variants={item} className="pb-20">
          <ScholarshipList
            filters={filters}
            activeTab={activeTab}
            onPageChange={(page) => updateFilter('page', page)}
          />
        </motion.div>

      </motion.div>
    </div>
  );
};

