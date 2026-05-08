"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  Globe,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Twitter,
  Linkedin,
  Facebook
} from "lucide-react";
import Link from "next/link";
import { Button, Card, CardBody, Input } from "@/components/ui";
import api, { getErrorMessage } from "@/lib/api";

export const ContactPage = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Scholarship Inquiry",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setError(null);

    try {
      await api.post("/marketing/contact", formData);
      setFormState('success');
    } catch (err) {
      console.error("Submission failed:", err);
      setError(getErrorMessage(err, "Failed to send message. Please try again later."));
      setFormState('idle');
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email Us",
      value: "josefdagne5@gmail.com",
      description: "Our team typically responds within 2 hours.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: Phone,
      label: "Call Us",
      value: "0925857810",
      description: "Mon-Fri from 8am to 6pm EAT.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: MapPin,
      label: "Office",
      value: "Addis Ababa, Ethiopia",
      description: "Bole Road, Mega Building, 4th Floor.",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* ─── DYNAMIC BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-600/10 blur-[150px]" />
      </div>

      <main className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* ─── HERO SECTION ─── */}
          <div className="text-center max-w-3xl mx-auto mb-20">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
             >
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 mb-6 inline-block">
                  Support Center
                </span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-8 font-serif leading-[0.9]">
                  Let's Build Your <span className="text-emerald-500">Future</span> Together
                </h1>
                <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto font-medium">
                  Have questions about scholarships, counseling, or your learning path? Our experts are here to guide you every step of the way.
                </p>
             </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* ─── LEFT COLUMN: CONTACT INFO ─── */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 space-y-10"
            >
              <div className="space-y-6">
                 <h2 className="text-3xl font-black font-serif tracking-tight">Contact Information</h2>
                 <p className="text-muted-foreground font-medium">
                    Choose the way that works best for you. We're available across multiple channels.
                 </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <div key={i} className="group flex items-start gap-6 p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-emerald-500/30 transition-all duration-500">
                    <div className={`h-14 w-14 rounded-xl ${info.bgColor} ${info.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                      <info.icon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">{info.label}</h3>
                      <p className="text-foreground font-black text-lg">{info.value}</p>
                      <p className="text-muted-foreground text-sm font-medium">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Social Connect</p>
                <div className="flex gap-4">
                  {[Instagram, Twitter, Linkedin, Facebook].map((Social, i) => (
                    <button key={i} className="h-12 w-12 rounded-lg bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300">
                      <Social size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <ShieldCheck size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Privacy Assured</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Your information is encrypted and never shared with third parties. We use your data strictly to provide the best educational guidance.
                 </p>
              </div>
            </motion.div>

            {/* ─── RIGHT COLUMN: CONTACT FORM ─── */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-7"
            >
              <Card className="rounded-2xl border-border bg-card/80 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                
                <CardBody className="p-10 md:p-14">
                  {formState === 'success' ? (
                    <div className="text-center py-12 space-y-8 animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-4xl font-black font-serif">Message Received</h2>
                        <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto">
                          Thank you for reaching out! One of our educational counselors will contact you shortly.
                        </p>
                      </div>
                      <Button 
                        variant="primary" 
                        className="rounded-lg h-14 px-10 font-black uppercase tracking-widest text-xs"
                        onClick={() => {
                          setFormState('idle');
                          setFormData({ name: "", email: "", phone: "", subject: "Scholarship Inquiry", message: "" });
                        }}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                      {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-3">
                           <Clock size={18} />
                           {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
                          <Input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe" 
                            className="h-14 rounded-lg bg-muted/30 border-border focus:bg-background transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</label>
                          <Input 
                            name="email"
                            type="email" 
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com" 
                            className="h-14 rounded-lg bg-muted/30 border-border focus:bg-background transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Phone (Optional)</label>
                          <Input 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+251 ..." 
                            className="h-14 rounded-lg bg-muted/30 border-border focus:bg-background transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Subject</label>
                          <select 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full h-14 rounded-lg bg-muted/30 border border-border px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-background transition-all"
                          >
                            <option value="Scholarship Inquiry">Scholarship Inquiry</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Counseling Session">Counseling Session</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Your Message</label>
                        <textarea 
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          placeholder="Tell us about your educational goals..."
                          className="w-full rounded-lg bg-muted/30 border border-border p-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-background transition-all resize-none"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full h-18 rounded-lg font-black uppercase tracking-widest text-sm primary-gradient shadow-2xl shadow-emerald-500/20 group overflow-hidden"
                        disabled={formState === 'submitting'}
                      >
                        {formState === 'submitting' ? (
                          <div className="flex items-center gap-3">
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span>Send Message</span>
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ─── QUICK FAQ REDIRECT ─── */}
      <section className="py-24 relative z-10 border-t border-border bg-muted/20">
         <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
               <div className="space-y-4">
                  <h3 className="text-3xl font-black font-serif tracking-tight">Need instant answers?</h3>
                  <p className="text-muted-foreground font-medium text-lg">
                    Check our Knowledge Base for quick solutions to common problems.
                  </p>
               </div>
               <Link href="/#faq">
                 <button className="h-16 px-10 rounded-2xl border-2 border-foreground text-foreground font-black tracking-widest text-xs hover:bg-foreground hover:text-background transition-all uppercase flex items-center gap-3">
                    View FAQ
                    <ArrowRight size={18} />
                 </button>
               </Link>
            </div>
         </div>
      </section>

      {/* ─── MAP SECTION ─── */}
      <section className="h-96 w-full relative z-10 grayscale-[0.8] hover:grayscale-0 transition-all duration-1000 overflow-hidden border-y border-border">
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            src="https://maps.google.com/maps?q=Mega%20Building%20Bole%20Addis%20Ababa&t=&z=15&ie=UTF8&iwloc=&output=embed"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-background via-transparent to-background" />
      </section>

    </div>
  );
};
