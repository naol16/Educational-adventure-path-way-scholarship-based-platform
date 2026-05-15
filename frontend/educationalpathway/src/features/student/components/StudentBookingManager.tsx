'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, Loader2, CheckCircle2, CreditCard, DollarSign, Receipt } from 'lucide-react';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { ReviewModal } from '@/features/counselor/components/ReviewModal';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const difference = new Date(targetDate).getTime() - Date.now();
            if (difference <= 0) {
                setTimeLeft(null);
                clearInterval(interval);
            } else {
                setTimeLeft({
                    d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    m: Math.floor((difference / 1000 / 60) % 60),
                    s: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (!timeLeft) return <span className="text-emerald-500 font-black animate-pulse">Starting Soon!</span>;
    
    return (
        <div className="flex gap-2 text-center text-xs font-mono">
            <div className="bg-primary/10 text-primary px-2 py-1 rounded">{timeLeft.d}d</div>
            <div className="bg-primary/10 text-primary px-2 py-1 rounded">{timeLeft.h}h</div>
            <div className="bg-primary/10 text-primary px-2 py-1 rounded">{timeLeft.m}m</div>
            <div className="bg-primary/10 text-primary px-2 py-1 rounded">{timeLeft.s}s</div>
        </div>
    );
};

export const StudentBookingManager = () => {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewBooking, setReviewBooking] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'past' | 'history'>('upcoming');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/counselors/student/bookings');
            // The api interceptor already unwraps response.data.data to res.data
            const bookingData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setBookings(bookingData);
        } catch (error) {
            console.error("Failed to fetch student bookings", error);
            toast.error("Could not load your sessions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Loading your sessions...</p>
            </div>
        );
    }

    const ongoing = bookings.filter(b => {
        if (!['confirmed', 'started'].includes(b.status)) return false;
        if (!b.slot) return b.status === 'started';
        const start = new Date(b.slot.startTime).getTime();
        const now = Date.now();
        // buffer of 5 mins before start, up to 2 hours after start
        return now >= (start - 300000) && now <= (start + 7200000);
    });

    const upcoming = bookings.filter(b => {
        if (!['confirmed'].includes(b.status)) return false;
        if (!b.slot?.startTime) return true;
        const start = new Date(b.slot.startTime).getTime();
        const now = Date.now();
        // If it's more than 5 mins in the future, it's upcoming
        return start > (now + 300000);
    }).sort((a, b) => {
        const aStart = new Date(a?.slot?.startTime || 0).getTime();
        const bStart = new Date(b?.slot?.startTime || 0).getTime();
        return aStart - bStart;
    });

    const awaitingConfirmation = bookings.filter(b => b.status === 'awaiting_confirmation');
    const completed = bookings.filter(b => b.status === 'completed');

    const overdue = bookings.filter(b => {
        if (!['confirmed', 'started'].includes(b.status)) return false;
        if (!b.slot?.startTime) return false;
        const start = new Date(b.slot.startTime).getTime();
        const now = Date.now();
        // If it's more than 2 hours past start time, it's overdue
        return now > (start + 7200000);
    });

    // Combine awaiting, completed, and overdue for the "Past" view
    const allPast = [...awaitingConfirmation, ...completed, ...overdue].sort((a, b) => {
        const aStart = new Date(a?.slot?.startTime || 0).getTime();
        const bStart = new Date(b?.slot?.startTime || 0).getTime();
        return bStart - aStart; // Newest first for past
    });

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">My Counseling Sessions</h1>
                    <p className="text-muted-foreground">Manage your expert consultations, meeting links, and session reviews.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-muted rounded-xl w-fit border border-border">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'upcoming' 
                            ? 'bg-background text-primary shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Upcoming
                        {upcoming.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                                {upcoming.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'past' 
                            ? 'bg-background text-primary shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Past Sessions
                        {awaitingConfirmation.length > 0 && (activeTab !== 'past') && (
                            <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full animate-pulse">
                                !
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('ongoing')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all relative ${
                            activeTab === 'ongoing' 
                            ? 'bg-background text-primary shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Ongoing
                        {ongoing.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full animate-pulse">
                                {ongoing.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'history' 
                            ? 'bg-background text-primary shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Payment History
                    </button>
                </div>
            </div>

            {activeTab === 'ongoing' ? (
                <div className="space-y-6">
                    {ongoing.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {ongoing.map((booking) => (
                                <Card key={booking.id} className="overflow-hidden border-2 border-red-500/20 bg-red-500/5 group">
                                    <CardBody className="p-6">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <div className="h-20 w-20 rounded-2xl bg-muted overflow-hidden">
                                                        {booking.counselor?.user?.profileImageUrl ? (
                                                            <img src={booking.counselor.user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                                                                <Video size={32} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md animate-pulse">
                                                        LIVE
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {booking.counselor?.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-4 mt-2">
                                                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
                                                            <Clock size={14} className="text-primary" />
                                                            {booking.slot ? `${new Date(booking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Started'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-sm font-bold text-red-500">
                                                            Ongoing Session
                                                        </span>
                                                        {booking.meetingLink && (
                                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                                                                <Video size={12} />
                                                                {booking.meetingLink}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <Button 
                                                    className="w-full md:w-auto rounded-full px-8 bg-red-500 hover:bg-red-600 text-white font-black"
                                                    onClick={() => booking.meetingLink ? router.push(`/dashboard/meeting/${booking.meetingLink}`) : toast.error("Meeting link not ready yet")}
                                                >
                                                    <Video size={18} className="mr-2" />
                                                    JOIN SESSION NOW
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl bg-muted/5">
                            <Video className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-bold text-foreground">No sessions in progress</h3>
                            <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                                When a session starts, it will appear here for immediate access.
                            </p>
                        </div>
                    )}
                </div>
            ) : activeTab === 'upcoming' ? (
                <div className="space-y-6">
                    {upcoming.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {upcoming.map((booking) => (
                                <Card key={booking.id} className="overflow-hidden border-none glass-card group">
                                    <CardBody className="p-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="font-bold text-foreground">Session with {booking.counselor?.name || booking.counselor?.user?.name || 'Academic Counselor'}</h3>
                                                    <p className="text-xs text-muted-foreground">Counselor: {booking.counselor?.name || booking.counselor?.user?.name || 'Academic Counselor'}</p>
                                                    <p className="text-xs text-muted-foreground">{booking.counselor?.areasOfExpertise || 'Academic Expert'}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold uppercase text-[10px]">
                                                {booking.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Calendar size={16} className="text-primary" />
                                                <span>
                                                    {booking.slot?.startTime 
                                                        ? new Date(booking.slot.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                                                        : 'Date to be announced'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Clock size={16} className="text-primary" />
                                                <span>
                                                    {booking.slot?.startTime && booking.slot?.endTime ? (
                                                        <>
                                                            {new Date(booking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                                            {new Date(booking.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </>
                                                    ) : 'Time not set'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mb-6 space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pre-Session Checklist</h4>
                                            {booking.slot?.startTime && (
                                                <div className="flex justify-between items-center bg-card p-3 rounded-lg shadow-sm">
                                                    <span className="text-xs font-bold text-foreground">Time Remaining:</span>
                                                    <CountdownTimer targetDate={booking.slot.startTime} />
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center bg-card p-3 rounded-lg shadow-sm cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/dashboard/student/profile')}>
                                                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                    <Upload size={14} className="text-primary" />
                                                    Upload documents (CV, SOP)
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">Optional</Badge>
                                            </div>
                                            {booking.meetingLink && (
                                                <div 
                                                    className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 cursor-pointer hover:bg-emerald-500/10 transition-colors"
                                                    onClick={() => router.push(`/dashboard/meeting/${booking.meetingLink}`)}
                                                >
                                                    <Video size={12} />
                                                    <span className="truncate">Agora: {booking.meetingLink}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <Button 
                                                className="flex-1 primary-gradient font-bold h-11"
                                                onClick={() => {
                                                    if (booking.meetingLink) router.push(`/dashboard/meeting/${booking.meetingLink}`);
                                                    else toast.error("Meeting link not yet available");
                                                }}
                                            >
                                                <Video className="mr-2 h-4 w-4" />
                                                Join Meeting
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-card/30 border border-dashed border-border rounded-3xl">
                            <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">No upcoming sessions</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                Upcoming counseling sessions will appear here.
                            </p>
                            <Link href="/dashboard/counselors">
                                <Button className="mt-8 rounded-full px-8 primary-gradient font-bold h-11">
                                    Browse Experts
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            ) : activeTab === 'history' ? (
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Date & Time</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expert / Session</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Transaction Reference</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Amount Paid</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {bookings.filter(b => b.payment).map((booking) => (
                                        <tr key={booking.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-foreground">
                                                        {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                                        {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                        <Video size={16} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{booking.counselor?.name || 'Expert Consultation'}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Session ID: #{booking.id.toString().slice(-6)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard size={14} className="text-muted-foreground/40" />
                                                    <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                                                        {booking.payment?.tx_ref?.slice(-16) || '---'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5">
                                                    <DollarSign size={14} className="text-emerald-500" />
                                                    <span className="text-sm font-black text-foreground">
                                                        {booking.payment?.amount} <span className="text-[10px] text-muted-foreground ml-1 uppercase">{booking.payment?.currency}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Badge className={`uppercase text-[9px] font-black px-3 py-1 rounded-full ${
                                                    booking.payment?.status === 'success' 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                                                }`}>
                                                    {booking.payment?.status === 'success' ? 'Completed' : booking.payment?.status || 'Pending'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {bookings.filter(b => b.payment).length === 0 && (
                            <div className="py-32 text-center bg-muted/5">
                                <Receipt className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" />
                                <h4 className="text-lg font-black text-foreground uppercase tracking-widest">No Transactions</h4>
                                <p className="text-sm text-muted-foreground mt-2 font-medium">Your payment history will appear here once you book a session.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Awaiting Confirmation Sub-header */}
                    {awaitingConfirmation.length > 0 && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 className="text-amber-500" size={20} />
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-500">You have {awaitingConfirmation.length} sessions ready for review and milestone confirmation.</p>
                        </div>
                    )}

                    {allPast.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {allPast.map((booking) => {
                                const needsReview = awaitingConfirmation.some(b => b.id === booking.id);
                                const isOverdue = overdue.some(b => b.id === booking.id);
                                return (
                                    <Card key={booking.id} className={`overflow-hidden border-2 transition-all ${
                                        needsReview 
                                        ? 'border-amber-500/30 bg-amber-500/5 ring-1 ring-amber-500/10 shadow-lg shadow-amber-500/5' 
                                        : isOverdue ? 'border-destructive/30 bg-destructive/5' : 'border-border/40 bg-card'
                                    }`}>
                                        <CardBody className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-foreground">
                                                        {booking.counselor?.name || booking.counselor?.user?.name || 'Academic Counselor'}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                        {new Date(booking.slot?.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <Badge className={`uppercase text-[10px] font-black ${
                                                    needsReview 
                                                    ? 'bg-amber-500 text-white animate-pulse' 
                                                    : isOverdue ? 'bg-destructive/80 text-white' : 'bg-emerald-500 text-white'
                                                }`}>
                                                    {needsReview ? 'Ready to Confirm' : isOverdue ? 'Expired / Overdue' : 'Completed'}
                                                </Badge>
                                            </div>

                                            {/* Show meeting link for reference */}
                                            <div className={`mb-6 p-3 rounded-xl border flex justify-between items-center ${
                                                needsReview ? 'bg-card/50 border-amber-500/10' : isOverdue ? 'bg-muted/30 border-destructive/20' : 'bg-muted/30 border-border/50'
                                            }`}>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Session Link Reference</p>
                                                    <p className="text-xs font-mono truncate opacity-60 max-w-[150px]">
                                                        {booking.meetingLink || 'No link recorded'}
                                                    </p>
                                                </div>
                                                {booking.payment && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Fee Reference</p>
                                                        <p className="text-sm font-bold text-foreground">
                                                            {booking.payment.amount} {booking.payment.currency}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {needsReview ? (
                                                <Button 
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black h-11 shadow-lg shadow-amber-500/20"
                                                    onClick={() => setReviewBooking(booking)}
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Confirm Milestone & Rate
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-xs font-bold">Milestone confirmed & Funds released</span>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-card/30 border border-dashed border-border rounded-3xl">
                            <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">No past sessions</h3>
                            <p className="text-muted-foreground mt-2">Your consultation history will appear here.</p>
                        </div>
                    )}
                </div>
            )}

            {reviewBooking && (
                <ReviewModal 
                    isOpen={!!reviewBooking}
                    onClose={() => setReviewBooking(null)}
                    bookingId={reviewBooking.id}
                    counselorName={reviewBooking.counselor?.name || 'Counselor'}
                    onSuccess={fetchBookings}
                />
            )}
        </div>
    );
};

