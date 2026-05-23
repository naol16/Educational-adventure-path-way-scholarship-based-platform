"use client";

import { useState, useEffect } from "react";
import {
  getPendingCounselors,
  updateCounselorVerification,
  deleteCounselor,
} from "../api/admin-api";
import { Button, ConfirmModal } from "@/components/ui";
import {
  Loader2,
  Check,
  FileText,
  User as UserIcon,
  ExternalLink,
  ShieldCheck,
  Award,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";

type PendingCounselor = {
  id: number;
  name: string;
  email: string;
  createdAt: string | Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const CounselorApprovals = () => {
  const [pendingCounselors, setPendingCounselors] = useState<
    PendingCounselor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [selectedCounselor, setSelectedCounselor] =
    useState<PendingCounselor | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingCounselors();
      setPendingCounselors(data);
    } catch {
      toast.error("Failed to load pending applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAccept = async (id: number) => {
    setTargetId(id);
    setIsApproveModalOpen(true);
  };

  const confirmAccept = async () => {
    if (!targetId) return;
    try {
      await updateCounselorVerification(targetId, "approved");
      toast.success("Counselor approved and activated");
      setPendingCounselors((prev: PendingCounselor[]) =>
        prev.filter((c) => c.id !== targetId),
      );
      setSelectedCounselor(null);
    } catch {
      toast.error("Failed to approve counselor");
    } finally {
      setTargetId(null);
      setIsApproveModalOpen(false);
    }
  };

  const handleReject = async (id: number) => {
    setTargetId(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!targetId) return;
    try {
      await updateCounselorVerification(targetId, "rejected");
      toast.success("Counselor application rejected");
      setPendingCounselors((prev: PendingCounselor[]) =>
        prev.filter((c) => c.id !== targetId),
      );
      setSelectedCounselor(null);
    } catch {
      toast.error("Failed to reject counselor");
    } finally {
      setTargetId(null);
      setIsRejectModalOpen(false);
    }
  };

  const handleDelete = (id: number) => {
    setTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetId) return;
    try {
      await deleteCounselor(targetId);
      toast.success("Application deleted");
      setPendingCounselors((prev: PendingCounselor[]) =>
        prev.filter((c) => c.id !== targetId),
      );
      setSelectedCounselor(null);
    } catch {
      toast.error("Failed to delete application");
    } finally {
      setTargetId(null);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Scanning Applications
        </p>
      </div>
    );
  }

  return (
    <>
      {selectedCounselor ? (
        <div className="space-y-12 pb-24 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between border-b border-border pb-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedCounselor(null)}
              className="h-10 px-0 hover:bg-transparent text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 group"
            >
              <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                ←
              </div>
              Back to Queue
            </Button>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg flex items-center gap-2"
                onClick={() => handleDelete(selectedCounselor.id)}
              >
                <Trash2 size={14} /> Delete Application
              </Button>
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg"
                onClick={() => handleReject(selectedCounselor.id)}
              >
                Reject
              </Button>
              <Button
                className="primary-gradient text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg shadow-xl shadow-primary/20"
                onClick={() => handleAccept(selectedCounselor.id)}
              >
                Approve & Activate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-12">
              {/* ── Candidate Overview ── */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Candidate Overview
                </h3>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-2xl bg-muted overflow-hidden border-2 border-border shrink-0">
                    {selectedCounselor.profileImageUrl ||
                    selectedCounselor.avatarUrl ? (
                      <Image
                        src={
                          selectedCounselor.profileImageUrl ||
                          selectedCounselor.avatarUrl
                        }
                        alt={`${selectedCounselor.name} profile image`}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl font-black">
                        {selectedCounselor.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                      {selectedCounselor.name}
                    </h2>
                    <p className="text-muted-foreground font-medium mt-1">
                      {selectedCounselor.email}
                    </p>
                    {selectedCounselor.phoneNumber && (
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {selectedCounselor.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Quick Stats ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                    Experience
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {selectedCounselor.yearsOfExperience ?? 0} yrs
                  </p>
                </div>
                <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                    Hourly Rate
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    ${selectedCounselor.hourlyRate ?? 0}
                    <span className="text-sm font-normal">/hr</span>
                  </p>
                </div>
                <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                    Session
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {selectedCounselor.sessionDuration ?? 60}
                    <span className="text-sm font-normal"> min</span>
                  </p>
                </div>
              </div>

              {/* ── Professional Profile ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Professional Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Organization",
                      value: selectedCounselor.organization || "Independent",
                    },
                    {
                      label: "Current Position",
                      value: selectedCounselor.currentPosition || "N/A",
                    },
                    {
                      label: "Highest Degree",
                      value: selectedCounselor.highestEducationLevel || "N/A",
                    },
                    {
                      label: "Areas of Expertise",
                      value: selectedCounselor.areasOfExpertise || "N/A",
                    },
                    { label: "City", value: selectedCounselor.city || "N/A" },
                    {
                      label: "Country of Residence",
                      value: selectedCounselor.countryOfResidence || "N/A",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-4 bg-card border border-border rounded-xl"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-bold text-foreground wrap-break-word">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Academic Background ── */}
              {(selectedCounselor.universityName ||
                selectedCounselor.studyCountry ||
                selectedCounselor.fieldsOfStudy) && (
                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Academic Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCounselor.universityName && (
                      <div className="p-4 bg-card border border-border rounded-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          University / Institution
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedCounselor.universityName}
                        </p>
                      </div>
                    )}
                    {selectedCounselor.studyCountry && (
                      <div className="p-4 bg-card border border-border rounded-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Country of Study
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedCounselor.studyCountry}
                        </p>
                      </div>
                    )}
                    {selectedCounselor.fieldsOfStudy && (
                      <div className="p-4 bg-card border border-border rounded-xl md:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Fields of Study
                        </p>
                        <p className="text-sm font-bold text-foreground wrap-break-word">
                          {selectedCounselor.fieldsOfStudy}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ── Consultation Preferences ── */}
              {(selectedCounselor.consultationModes ||
                selectedCounselor.specializedCountries) && (
                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Consultation Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCounselor.consultationModes && (
                      <div className="p-4 bg-card border border-border rounded-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          Consultation Modes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(typeof selectedCounselor.consultationModes ===
                          "string"
                            ? selectedCounselor.consultationModes
                                .replace(/[\[\]"]/g, "")
                                .split(",")
                            : selectedCounselor.consultationModes
                          ).map((mode: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest"
                            >
                              {mode.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCounselor.specializedCountries && (
                      <div className="p-4 bg-card border border-border rounded-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          Specialized Countries
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(typeof selectedCounselor.specializedCountries ===
                          "string"
                            ? selectedCounselor.specializedCountries
                                .replace(/[\[\]"]/g, "")
                                .split(",")
                            : selectedCounselor.specializedCountries
                          ).map((country: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-muted text-foreground text-[10px] font-black uppercase tracking-widest"
                            >
                              {country.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ── Languages ── */}
              {selectedCounselor.languages && (
                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Languages
                  </h3>
                  <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap gap-2">
                    {(typeof selectedCounselor.languages === "string"
                      ? selectedCounselor.languages
                          .replace(/[\[\]"]/g, "")
                          .split(",")
                      : selectedCounselor.languages
                    ).map((lang: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-muted text-foreground text-[10px] font-black uppercase tracking-widest"
                      >
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Biography ── */}
              {selectedCounselor.bio && (
                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Biography
                  </h3>
                  <div className="p-6 bg-card border border-border rounded-xl">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedCounselor.bio}
                    </p>
                  </div>
                </section>
              )}

              {/* ── Weekly Schedule ── */}
              {selectedCounselor.weeklySchedule && (
                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Weekly Availability
                  </h3>
                  <div className="p-4 bg-card border border-border rounded-xl">
                    <pre className="text-xs text-foreground/80 font-mono whitespace-pre-wrap break-all">
                      {typeof selectedCounselor.weeklySchedule === "string"
                        ? (() => {
                            try {
                              return JSON.stringify(
                                JSON.parse(selectedCounselor.weeklySchedule),
                                null,
                                2,
                              );
                            } catch {
                              return selectedCounselor.weeklySchedule;
                            }
                          })()
                        : JSON.stringify(
                            selectedCounselor.weeklySchedule,
                            null,
                            2,
                          )}
                    </pre>
                  </div>
                </section>
              )}

              {/* ── Identity Documents ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Submitted Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "CV / Resume",
                      url: selectedCounselor.cvUrl,
                      icon: FileText,
                    },
                    {
                      label: "Certificates",
                      url: selectedCounselor.certificateUrls,
                      icon: Award,
                    },
                    {
                      label: "ID Card / Passport",
                      url: selectedCounselor.idCardUrl,
                      icon: ShieldCheck,
                    },
                    {
                      label: "Live Selfie",
                      url: selectedCounselor.selfieUrl,
                      icon: UserIcon,
                    },
                  ].map(
                    (doc, i) =>
                      doc.url && (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-6 bg-card border border-border rounded-xl hover:border-primary transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <doc.icon size={20} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest">
                              {doc.label}
                            </span>
                          </div>
                          <ExternalLink
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </a>
                      ),
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4 border-b border-border pb-10">
            <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter">
              Pending Approvals
            </h2>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60">
              Review and verify {pendingCounselors.length} new counselor
              applications
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingCounselors.length > 0 ? (
              pendingCounselors.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedCounselor(c)}
                  className="group bg-card border border-border p-6 rounded-2xl hover:border-primary cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-black overflow-hidden">
                      {c.avatarUrl ? (
                        <Image
                          src={c.avatarUrl}
                          alt={`${c.name} avatar`}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        c.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight group-hover:text-primary transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        {c.organization || "Independent"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block text-right">
                      <p className="text-[9px] font-black uppercase text-muted-foreground">
                        Applied On
                      </p>
                      <p className="text-xs font-bold">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ExternalLink size={16} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 opacity-40">
                  <Check size={32} />
                </div>
                <h3 className="text-xl font-black uppercase">All Caught Up</h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  No pending applications in the queue.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="Reject Application"
        description="Are you sure you want to permanently reject this counselor?"
        confirmText="Confirm Rejection"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Application Permanently"
        description="Are you absolutely sure? This will permanently remove this application and the user account from the system."
        confirmText="Yes, Delete Permanently"
      />

      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={confirmAccept}
        title="Approve Counselor"
        description="Are you sure you want to approve this counselor and grant them full platform access?"
        confirmText="Yes, Approve Counselor"
      />
    </>
  );
};
