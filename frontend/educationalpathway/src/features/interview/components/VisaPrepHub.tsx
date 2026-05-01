"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Loader2,
  Info,
  Building2,
  ChevronRight,
  Quote,
  Clock,
  Mic,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getVisaGuidelines } from "../api/visa-api";
import Select, { SingleValue } from "react-select";
import { useGeoData } from "../../student/hooks/useGeoData";

interface VisaPrepHubProps {
  onStartInterview: (country: string, university: string, interviewType?: string) => void;
}

// React Select Custom Styles (Premium Dark)
const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    height: "64px",
    backgroundColor: "transparent",
    borderRadius: "1rem",
    borderWidth: "2px",
    borderColor: state.isFocused ? "rgba(16, 185, 129, 0.5)" : "rgba(255, 255, 255, 0.1)",
    boxShadow: "none",
    "&:hover": {
      borderColor: "rgba(16, 185, 129, 0.3)",
    },
    paddingLeft: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: "0 8px",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "rgba(255, 255, 255, 0.3)",
    fontWeight: "600",
    fontSize: "0.875rem",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "white",
    fontWeight: "700",
    fontSize: "0.875rem",
  }),
  input: (base: any) => ({
    ...base,
    color: "white",
    fontWeight: "700",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#0a0a0a",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "1rem",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    overflow: "hidden",
    zIndex: 100,
  }),
  menuList: (base: any) => ({
    ...base,
    padding: "8px",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(16, 185, 129, 0.5)",
      borderRadius: "10px",
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(16, 185, 129, 0.1)" : "transparent",
    color: state.isFocused ? "#10b981" : "white",
    padding: "12px 16px",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.875rem",
    "&:active": {
      backgroundColor: "rgba(16, 185, 129, 0.2)",
    },
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: "rgba(255, 255, 255, 0.3)",
    "&:hover": {
      color: "#10b981",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

const formatCountryOption = (option: any) => (
  <div className="flex items-center gap-3">
    {option.flag && (
      option.flag.endsWith(".svg") || option.flag.endsWith(".png") ? (
        <img src={option.flag} alt={`${option.label} flag`} className="w-5 h-3.5 object-cover rounded-[2px] border border-white/10" />
      ) : (
        <span className="text-xl">{option.flag}</span>
      )
    )}
    <span className="font-bold">{option.label}</span>
  </div>
);

export function VisaPrepHub({ onStartInterview }: VisaPrepHubProps) {
  const { countries, loadingCountries, getUniversitiesForCountry } = useGeoData();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [interviewType, setInterviewType] = useState("visa");
  const [guidelines, setGuidelines] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [university, setUniversity] = useState("");
  const [universityList, setUniversityList] = useState<string[]>([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);

  // Set default country once countries are loaded
  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      const defaultCountry = countries.find(c => c.name === "United States") || countries[0];
      setSelectedCountry({
        value: defaultCountry.name,
        label: defaultCountry.name,
        flag: defaultCountry.flag,
        code: defaultCountry.code
      });
    }
  }, [countries]);

  // Fetch Guidelines when country changes
  useEffect(() => {
    async function loadGuidelines() {
      if (!selectedCountry) return;
      try {
        setLoading(true);
        const res = await getVisaGuidelines(selectedCountry.code);
        const data = res?.status === "success" ? res.data : res;
        setGuidelines(data);
      } catch (err) {
        console.error("Failed to load guidelines", err);
        setGuidelines(null);
      } finally {
        setLoading(false);
      }
    }
    loadGuidelines();
  }, [selectedCountry]);

  // Fetch Universities when country changes
  useEffect(() => {
    if (!selectedCountry) return;

    async function fetchUniversities() {
      setIsLoadingUniversities(true);
      try {
        const data = await getUniversitiesForCountry(selectedCountry.value);
        const uniqueUniversities = data.map(u => u.name);
        setUniversityList(uniqueUniversities);
        if (uniqueUniversities.length > 0) {
          setUniversity(uniqueUniversities[0]);
        } else {
          setUniversity("");
        }
      } catch (err) {
        console.error("Failed to fetch universities", err);
        setUniversityList([]);
        setUniversity("");
      } finally {
        setIsLoadingUniversities(false);
      }
    }

    fetchUniversities();
  }, [selectedCountry]);

  const countryOptions = countries.map(c => ({
    value: c.name,
    label: c.name,
    flag: c.flag,
    code: c.code
  }));

  const uniOptions = universityList.map(u => ({
    value: u,
    label: u
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* ─── ENHANCED HERO SECTION ─── */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border/50 shadow-2xl p-12 lg:p-16">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center justify-between">
          <div className="space-y-6 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500"
            >
              <Zap size={14} className="fill-emerald-500" /> AI Interview Practice
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight font-serif">
              Visa <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">Success</span> Studio
            </h1>
            
            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
              Practice your visa interview with smart AI. Our tool helps you prepare for the real thing.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span className="text-xs font-bold">Verified Embassy Rubrics</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
                <Zap size={18} className="text-amber-500" />
                <span className="text-xs font-bold">Real-time Feedback</span>
              </div>
            </div>
          </div>

          {/* Quick Stats/Badge */}
          <div className="relative shrink-0 group">
             <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/30 transition-all duration-700" />
             <div className="relative size-48 md:size-56 rounded-full border-4 border-emerald-500/20 bg-card flex flex-col items-center justify-center text-center p-8 shadow-2xl">
                <span className="text-4xl md:text-5xl font-black text-emerald-500">94%</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Pass Rate</span>
                <Globe2 className="mt-4 text-emerald-500/20" size={32} />
             </div>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* ─── SELECTION COLUMN (LEFT) ─── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
              <span className="w-8 h-px bg-muted-foreground/30" /> 
              01. DESTINATION
            </h3>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                  <Search size={20} />
                </div>
                <Select
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(val: SingleValue<any>) => setSelectedCountry(val)}
                  styles={{
                    ...customStyles,
                    control: (base: any, state: any) => ({
                      ...customStyles.control(base, state),
                      paddingLeft: "36px",
                    }),
                  }}
                  placeholder="Search destination country..."
                  isLoading={loadingCountries}
                  formatOptionLabel={formatCountryOption}
                  isSearchable
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
              <span className="w-8 h-px bg-muted-foreground/30" /> 
              02. INSTITUTION
            </h3>
            
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
               <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                    <Search size={20} />
                  </div>
                  <Select
                    options={uniOptions}
                    value={university ? { value: university, label: university } : null}
                    onChange={(val: SingleValue<any>) => setUniversity(val?.value || "")}
                    styles={{
                      ...customStyles,
                      control: (base: any, state: any) => ({
                        ...customStyles.control(base, state),
                        paddingLeft: "36px",
                      }),
                    }}
                    placeholder={isLoadingUniversities ? "Fetching campus data..." : "Search target university..."}
                    isLoading={isLoadingUniversities}
                    isDisabled={!selectedCountry || isLoadingUniversities}
                    isSearchable
                  />
              </div>
            </div>
            <div className="px-2 flex items-center gap-2 text-emerald-500/60">
              <Info size={12} />
              <p className="text-[10px] font-black uppercase tracking-widest italic">
                AI will help you prepare for this campus
              </p>
            </div>
          </div>

          <Card className="border-none bg-linear-to-br from-amber-500/5 to-orange-500/5 shadow-xl">
            <CardBody className="p-8 space-y-4">
               <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-amber-500/10 p-3 shrink-0">
                    <ShieldCheck className="text-amber-500" size={24} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-xs uppercase tracking-widest text-amber-600/80 italic">Standard Protocol</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      Visa interviews are important. Make sure you are in a quiet room with good internet before you start.
                    </p>
                  </div>
               </div>
            </CardBody>
          </Card>
        </div>

        {/* ─── GUIDELINES COLUMN (RIGHT) ─── */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedCountry ? (
              <motion.div
                key={selectedCountry.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Globe2 size={200} />
                  </div>

                  <div className="p-10 lg:p-14 space-y-12">
                    {/* Country Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="text-6xl md:text-8xl drop-shadow-2xl">
                          {selectedCountry.flag && (selectedCountry.flag.endsWith(".svg") || selectedCountry.flag.endsWith(".png")) ? (
                            <img src={selectedCountry.flag} alt="flag" className="w-24 h-16 object-cover rounded-lg shadow-2xl border-4 border-white/10" />
                          ) : (
                            selectedCountry.flag
                          )}
                        </div>
                        <div>
                          <h2 className="text-4xl md:text-5xl font-black tracking-tight font-serif">{selectedCountry.label}</h2>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Live Prep Active</span>
                          </div>
                        </div>
                      </div>
                      <div className="hidden lg:block text-8xl opacity-10 font-black italic tracking-tighter">{selectedCountry.code}</div>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500/20 blur-xl animate-pulse rounded-full" />
                          <Loader2 className="animate-spin text-emerald-500 size-12 relative z-10" />
                        </div>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs italic">Syncing with Embassy database...</p>
                      </div>
                    ) : (
                      <div className="grid gap-12 md:grid-cols-2">
                         {/* Documentation */}
                         <div className="space-y-8">
                           <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                              <BookOpen size={18} className="text-emerald-500" /> 
                              <span>Checklist</span>
                              <div className="flex-1 h-px bg-border/40" />
                           </div>
                           <div className="grid gap-4">
                             {(guidelines?.requiredDocuments || ["I-20 Form", "Passport", "DS-160 Confirmation", "SEVIS Fee Receipt"]).map((doc: string, i: number) => (
                               <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-muted/30 border border-border/50 group hover:border-emerald-500/30 transition-all">
                                 <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                   <CheckCircle2 size={14} className="text-emerald-500" />
                                 </div>
                                 <span className="text-sm font-bold">{doc}</span>
                               </div>
                             ))}
                           </div>
                         </div>

                         {/* Common Questions */}
                         <div className="space-y-8">
                           <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                              <Info size={18} className="text-teal-500" /> 
                              <span>Key Focus Areas</span>
                              <div className="flex-1 h-px bg-border/40" />
                           </div>
                           <div className="grid gap-4">
                             {(guidelines?.commonQuestions || [
                               "Why did you choose this university?",
                               "Who is funding your education?",
                               "What are your plans after graduation?"
                             ]).map((q: string, i: number) => (
                               <div key={i} className="p-5 rounded-2xl bg-teal-500/5 border border-teal-500/10 relative overflow-hidden group hover:border-teal-500/30 transition-all">
                                  <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <Quote size={40} />
                                  </div>
                                  <p className="text-xs font-bold leading-relaxed italic text-muted-foreground/80 group-hover:text-foreground transition-colors relative z-10">
                                    "{q}"
                                  </p>
                               </div>
                             ))}
                           </div>
                         </div>
                      </div>
                    )}

                    {/* Footer Action */}
                    <div className="pt-12 border-t border-border flex flex-col items-center gap-8">
                      <Button 
                        onClick={() => {
                          if (!university) {
                            alert("Please select a university first!");
                            return;
                          }
                          onStartInterview(selectedCountry.code, university, interviewType);
                        }}
                        size="xl" 
                        className="w-full sm:w-auto h-20 px-16 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-black tracking-widest text-lg gap-4 shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_30px_70px_rgba(16,185,129,0.5)] hover:scale-[1.02] transition-all duration-300 group"
                      >
                        START INTERVIEW <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
                      </Button>
                      
                      <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 italic">
                         <span className="flex items-center gap-2"><Clock size={14} /> Est. 5-10 MINS</span>
                         <span className="flex items-center gap-2"><Mic size={14} /> MIC REQUIRED</span>
                         <span className="flex items-center gap-2"><Zap size={14} /> AI EVALUATION</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Intel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-6 group hover:border-indigo-500/30 transition-all">
                    <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="text-indigo-500" size={24} />
                    </div>
                    <div className="space-y-2">
                       <h5 className="font-black text-xs uppercase tracking-widest text-indigo-400">Security Check</h5>
                       <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                         AI will check if you plan to return home—a key part of getting your visa.
                       </p>
                    </div>
                  </div>
                  <div className="p-8 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex gap-6 group hover:border-rose-500/30 transition-all">
                    <div className="size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                      <Zap className="text-rose-500" size={24} />
                    </div>
                    <div className="space-y-2">
                       <h5 className="font-black text-xs uppercase tracking-widest text-rose-400">Financial Proof</h5>
                       <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                         Be ready to explain clearly where your money is coming from.
                       </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-8 bg-muted/10 rounded-2xl border-4 border-dashed border-border/40">
                 <div className="size-32 rounded-full bg-muted flex items-center justify-center">
                    <Globe2 className="text-muted-foreground opacity-20" size={64} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground/40">Awaiting Destination Selection</h2>
                    <p className="text-sm font-bold text-muted-foreground/30 uppercase tracking-widest">Select a country to see details</p>
                 </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
