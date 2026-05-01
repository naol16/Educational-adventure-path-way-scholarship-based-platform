'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { ReviewModal } from '@/features/counselor/components/ReviewModal';
import { useRouter } from 'next/navigation';

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
        const end = new Date(b.slot.endTime).getTime();
        const now = Date.now();
        // buffer of 5 mins before start
        return (now >= (start - 300000) && now <= end) || b.status === 'started';
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

    const awaitingConfirmation = bookings.filter(b => {
        return b.status === 'awaiting_confirmation';
    });

    const completed = bookings.filter(b => b.status === 'completed');

    // Combine awaiting and completed for the "Past" view
    const allPast = [...awaitingConfirmation, ...completed].sort((a, b) => {
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

                                        <div className="space-y-3 mb-8">
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
            ) : (
                <div className="space-y-10">
                    {/* Awaiting Confirmation Sub-header */}
                    {awaitingConfirmation.length > 0 && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 className="text-amber-500" size={20} />
                            <p className="text-sm font-bold text-amber-700">You have {awaitingConfirmation.length} sessions ready for review and milestone confirmation.</p>
                        </div>
                    )}

                    {allPast.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {allPast.map((booking) => {
                                const needsReview = awaitingConfirmation.some(b => b.id === booking.id);
                                return (
                                    <Card key={booking.id} className={`overflow-hidden border-2 transition-all ${
                                        needsReview 
                                        ? 'border-amber-500/30 bg-amber-500/5 ring-1 ring-amber-500/10 shadow-lg shadow-amber-500/5' 
                                        : 'border-border/40 bg-card'
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
                                                    : 'bg-emerald-500 text-white'
                                                }`}>
                                                    {needsReview ? 'Ready to Confirm' : 'Completed'}
                                                </Badge>
                                            </div>

                                            {/* Show meeting link for reference */}
                                            <div className={`mb-6 p-3 rounded-xl border flex justify-between items-center ${
                                                needsReview ? 'bg-white/50 border-amber-500/10' : 'bg-muted/30 border-border/50'
                                            }`}>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Session Link Reference</p>
                                                    <p className="text-xs font-mono truncate opacity-60 max-w-[150px]">
                                                        {booking.meetingLink || 'No link recorded'}
                                                    </p>
                                                </div>
                                                {booking.payment && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Amount Paid</p>
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
