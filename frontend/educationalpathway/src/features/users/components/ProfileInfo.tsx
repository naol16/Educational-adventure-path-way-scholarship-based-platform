"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Camera,
  Loader2,
  Lock,
  CheckCircle2,
  ArrowLeft,
  X
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

export const ProfileInfo = () => {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"account" | "security">("account");

  // Account State
  const [name, setName] = useState(user?.name || "");
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUploadingAvatar(true);
    try {
      await api.post("/user/upload-avatar", formData);
      await refreshUser();
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (name === user?.name) return;

    setIsUpdatingAccount(true);
    try {
      await api.put("/user/profile", { name });
      await refreshUser();
      toast.success("Name updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill all password fields");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setIsChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">My Profile</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Update your personal details and security</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-1">
            <button 
              onClick={() => setActiveSection("account")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all ${
                activeSection === "account" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted font-bold"
              }`}
            >
              <User size={18} />
              Basic Info
            </button>
            <button 
              onClick={() => setActiveSection("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all ${
                activeSection === "security" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted font-bold"
              }`}
            >
              <Lock size={18} />
              Security
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSection === "account" ? (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Photo Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-border">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-3xl overflow-hidden bg-primary/5 ring-1 ring-border shadow-sm mx-auto">
                      {user?.avatarUrl || user?.profileImageUrl ? (
                        <>
                          <img 
                            src={user.avatarUrl || user.profileImageUrl} 
                            alt={user.name} 
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={async () => {
                              if (confirm("Are you sure you want to remove your profile picture?")) {
                                try {
                                  await api.delete("/user/avatar");
                                  await refreshUser();
                                  toast.success("Profile picture removed");
                                } catch (error: any) {
                                  toast.error("Failed to remove profile picture");
                                }
                              }
                            }}
                            className="absolute -top-2 -left-2 bg-destructive text-white p-1.5 rounded-xl shadow-lg hover:scale-110 transition-transform active:scale-95 z-20"
                            title="Remove profile picture"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary text-4xl font-black bg-primary/5">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-3xl z-30">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95"
                      disabled={isUploadingAvatar}
                    >
                      <Camera size={18} strokeWidth={2.5} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="text-2xl font-black">{user?.name}</h3>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{user?.role}</p>
                    <p className="text-xs text-muted-foreground/60 max-w-xs font-medium">Click the camera icon to upload a professional profile picture.</p>
                  </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Full Name</label>
                    <div className="flex gap-4">
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="rounded-2xl h-14 font-bold bg-muted/30 border-border"
                      />
                      <Button 
                        onClick={handleUpdateName}
                        disabled={isUpdatingAccount || name === user?.name}
                        isLoading={isUpdatingAccount}
                        className="rounded-2xl h-14 px-10 primary-gradient text-white font-black uppercase tracking-widest text-xs"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1 opacity-50">Email Address</label>
                     <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/20 border border-border/50 text-muted-foreground font-bold">
                        <span className="opacity-80 italic">{user?.email}</span>
                        <div className="ml-auto flex items-center gap-1.5 text-[9px] text-emerald-500 font-black uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                           <CheckCircle2 size={12} />
                           Verified Account
                        </div>
                     </div>
                     <p className="text-[10px] text-muted-foreground/60 ml-1">Email cannot be changed for security reasons. Contact support if needed.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-1 mb-8">
                   <h3 className="text-2xl font-black">Security Settings</h3>
                   <p className="text-sm text-muted-foreground font-medium">Update your password to keep your account safe.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Current Password</label>
                     <Input 
                       type="password"
                       value={oldPassword}
                       onChange={(e) => setOldPassword(e.target.value)}
                       placeholder="••••••••"
                       className="rounded-2xl h-14 font-bold bg-muted/30"
                       icon={<Lock size={18} className="text-muted-foreground/60" />}
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">New Password</label>
                     <Input 
                       type="password"
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       placeholder="Min. 6 characters"
                       className="rounded-2xl h-14 font-bold bg-muted/30"
                       icon={<Lock size={18} className="text-muted-foreground/60" />}
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Confirm New Password</label>
                     <Input 
                       type="password"
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       placeholder="Re-type new password"
                       className="rounded-2xl h-14 font-bold bg-muted/30"
                       icon={<CheckCircle2 size={18} className="text-muted-foreground/60" />}
                     />
                   </div>

                   <Button 
                     type="submit"
                     disabled={isChangingPassword}
                     isLoading={isChangingPassword}
                     className="w-full rounded-2xl h-14 px-10 primary-gradient text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 mt-4"
                   >
                     Update Account Password
                   </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

