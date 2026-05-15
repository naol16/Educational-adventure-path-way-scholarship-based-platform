import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api, { getErrorMessage } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Group {
    id: number;
    name: string;
    country: string;
    description: string;
    category?: string;
    groupType?: string;
    isGroup: boolean;
}

interface Report {
    id: number;
    reason: string;
    messageId: number;
    message?: {
        content: string;
        senderId: number;
        sender?: {
            name: string;
        };
    };
    reporter?: {
        name: string;
    };
}

export const GroupChatManager: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [groupType, setGroupType] = useState('Public');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'groups' | 'moderation' | 'reports'>('groups');
    
    // Edit state
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

    // Suspend state
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [userToSuspend, setUserToSuspend] = useState<string | null>(null);

    // Create/Edit Group Modal state
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    // Moderation states
    const [targetUserId, setTargetUserId] = useState('');
    const [warningReason, setWarningReason] = useState('');
    const [suspendUserId, setSuspendUserId] = useState('');
    const [reports, setReports] = useState<Report[]>([]);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            // Backend returns { status: "success", data: [...] }
            const groupsData = response.data.data || (Array.isArray(response.data) ? response.data : []);
            setGroups(groupsData);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            toast.error(getErrorMessage(error, 'Failed to fetch groups'));
        }
    };

    const fetchReports = async () => {
        try {
            const response = await api.get('/moderation/reports');
            setReports(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
        if (activeTab === 'reports') fetchReports();
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !country) {
            toast.error('Name and Country are required');
            return;
        }

        try {
            setLoading(true);
            if (editingGroupId) {
                await api.put(`/groups/${editingGroupId}`, { name, country, description, category, groupType });
                toast.success('Group updated successfully!');
            } else {
                await api.post('/groups', { name, country, description, category, groupType });
                toast.success('Group created successfully!');
            }
            resetForm();
            setIsGroupModalOpen(false);
            fetchGroups();
        } catch (error) {
            console.error('Failed to save group:', error);
            toast.error(getErrorMessage(error, 'Failed to save group'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setCountry('');
        setDescription('');
        setCategory('General');
        setGroupType('Public');
        setEditingGroupId(null);
    };

    const handleCreateClick = () => {
        resetForm();
        setIsGroupModalOpen(true);
    };

    const handleEditClick = (group: Group) => {
        setName(group.name);
        setCountry(group.country);
        setDescription(group.description);
        setCategory(group.category || 'General');
        setGroupType(group.groupType || 'Public');
        setEditingGroupId(group.id);
        setIsGroupModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setGroupToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!groupToDelete) return;
        try {
            setLoading(true);
            await api.delete(`/groups/${groupToDelete}`);
            toast.success('Group deleted successfully');
            fetchGroups();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete group'));
        } finally {
            setLoading(false);
            setGroupToDelete(null);
        }
    };

    const warnUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUserId || !warningReason) {
            toast.error('User ID and Reason are required');
            return;
        }
        
        try {
            setLoading(true);
            await api.post('/moderation/warn', { userId: parseInt(targetUserId), reason: warningReason });
            toast.success('User warned successfully');
            setTargetUserId('');
            setWarningReason('');
        } catch (error) {
            console.error('Warn error:', error);
            toast.error(getErrorMessage(error, 'Failed to warn user'));
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!suspendUserId) {
            toast.error('User ID is required');
            return;
        }
        setUserToSuspend(suspendUserId);
        setIsSuspendModalOpen(true);
    };

    const confirmSuspend = async () => {
        if (!userToSuspend) return;
        try {
            setLoading(true);
            await api.post(`/moderation/suspend/${userToSuspend}`);
            toast.success('User suspended successfully');
            setSuspendUserId('');
        } catch (error) {
            console.error('Suspend error:', error);
            toast.error(getErrorMessage(error, 'Failed to suspend user'));
        } finally {
            setLoading(false);
            setUserToSuspend(null);
        }
    };

    return (
        <div className="p-6">
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Community Group"
                description="Are you sure you want to delete this group? All messages and members will be removed. This action cannot be undone."
            />

            <ConfirmModal 
                isOpen={isSuspendModalOpen}
                onClose={() => setIsSuspendModalOpen(false)}
                onConfirm={confirmSuspend}
                title="Suspend User Account"
                description={`Are you sure you want to suspend user #${userToSuspend}? They will be immediately deactivated and logged out of all sessions.`}
                confirmText="Suspend User"
            />

            {/* Create/Edit Group Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
                    <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <CardTitle className="text-xl">
                                {editingGroupId ? 'Edit Community Group' : 'Create New Community Group'}
                            </CardTitle>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setIsGroupModalOpen(false);
                                    resetForm();
                                }}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                ✕
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/80 mb-1">Group Name</label>
                                        <Input 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="e.g. Canada Scholarship Aspirants"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/80 mb-1">Country</label>
                                        <Input 
                                            value={country} 
                                            onChange={(e) => setCountry(e.target.value)} 
                                            placeholder="e.g. Canada"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="groupCategory" className="block text-sm font-medium text-foreground/80 mb-1">Category</label>
                                        <select 
                                            id="groupCategory"
                                            title="Category"
                                            aria-label="Category"
                                            className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="Scholarship">Scholarship</option>
                                            <option value="University">University</option>
                                            <option value="Counseling">Counseling</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="groupType" className="block text-sm font-medium text-foreground/80 mb-1">Group Type</label>
                                        <select 
                                            id="groupType"
                                            title="Group Type"
                                            aria-label="Group Type"
                                            className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={groupType}
                                            onChange={(e) => setGroupType(e.target.value)}
                                        >
                                            <option value="Public">Public (Anyone can join)</option>
                                            <option value="Private">Private (Invite only)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground/80 mb-1">Description</label>
                                    <textarea 
                                        className="w-full border rounded-md p-3 bg-background border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                                        rows={3}
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        placeholder="Describe the purpose of this group..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => {
                                            setIsGroupModalOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="px-8 min-w-[120px]">
                                        {loading ? 'Saving...' : (editingGroupId ? 'Save Changes' : 'Create Group')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex gap-4 mb-8 border-b">
                <button 
                    className={`pb-2 px-4 transition-colors ${activeTab === 'groups' ? 'border-b-2 border-primary font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('groups')}
                >
                    Chat Groups
                </button>
                <button 
                    className={`pb-2 px-4 transition-colors ${activeTab === 'moderation' ? 'border-b-2 border-primary font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('moderation')}
                >
                    Moderation
                </button>
                <button 
                    className={`pb-2 px-4 transition-colors ${activeTab === 'reports' ? 'border-b-2 border-primary font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('reports')}
                >
                    User Reports
                    {reports.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {reports.length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'groups' ? (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Community Groups
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{groups.length}</span>
                        </h2>
                        <Button 
                            onClick={handleCreateClick}
                            className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <span className="text-xl font-light">+</span>
                            Create New Group
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <Card key={group.id} className={`group hover:shadow-md transition-all ${editingGroupId === group.id ? 'ring-2 ring-primary border-primary/20' : 'border-border/50'}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{group.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                            {group.country}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                                            {group.category || 'General'}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3 min-h-[4.5rem]">
                                        {group.description || 'No description provided.'}
                                    </p>
                                    <div className="flex gap-2 mt-auto pt-2 border-t border-border/50">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditClick(group)}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteClick(group.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            ) : activeTab === 'moderation' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-amber-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700">
                                <span className="p-1.5 bg-amber-50 rounded-lg">⚠️</span>
                                Warn User
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={warnUser} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">User ID</label>
                                    <Input 
                                        type="number"
                                        value={targetUserId} 
                                        onChange={(e) => setTargetUserId(e.target.value)} 
                                        placeholder="Enter Numeric ID"
                                        className="bg-muted/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Reason for Warning</label>
                                    <textarea 
                                        className="w-full border rounded-md p-3 bg-muted/30 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                                        rows={4}
                                        value={warningReason} 
                                        onChange={(e) => setWarningReason(e.target.value)} 
                                        placeholder="e.g. Spamming, inappropriate language, etc."
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none" disabled={loading}>
                                    {loading ? 'Processing...' : 'Issue Official Warning'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-red-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <span className="p-1.5 bg-red-50 rounded-lg">🚫</span>
                                Suspend User Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSuspendClick} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">User ID</label>
                                    <Input 
                                        type="number"
                                        value={suspendUserId} 
                                        onChange={(e) => setSuspendUserId(e.target.value)} 
                                        placeholder="Enter Numeric ID"
                                        className="bg-muted/30"
                                    />
                                </div>
                                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                    <p className="text-sm text-red-700 font-medium mb-1">Critical Warning</p>
                                    <p className="text-xs text-red-600/80 leading-relaxed">
                                        Suspending an account will immediately deactivate the user, invalidate all active sessions, and prevent them from logging in until manually restored.
                                    </p>
                                </div>
                                <Button type="submit" variant="destructive" className="w-full shadow-lg shadow-red-100" disabled={loading}>
                                    {loading ? 'Processing...' : 'Deactivate Account Now'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Pending Message Reports</h2>
                    {reports.length === 0 ? (
                        <Card className="border-dashed border-2">
                            <CardContent className="py-16 text-center">
                                <div className="text-4xl mb-4">✨</div>
                                <p className="text-muted-foreground font-medium italic">No pending reports. The community is clean!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {reports.map((report) => (
                                <Card key={report.id} className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-foreground">Reported Message</span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">ID: #{report.id}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Author: <span className="font-semibold text-foreground">{report.message?.sender?.name}</span> (ID: {report.message?.senderId}) 
                                                    <span className="mx-2">|</span> 
                                                    Reported by: <span className="font-semibold text-foreground">{report.reporter?.name}</span>
                                                </p>
                                            </div>
                                            <span className="bg-red-100 text-red-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-red-200">
                                                {report.reason}
                                            </span>
                                        </div>
                                        <div className="bg-muted/50 p-4 rounded-lg text-sm mb-6 border border-border/50 relative">
                                            <span className="absolute -top-2 left-3 bg-background px-2 text-[10px] font-bold text-muted-foreground border rounded">MESSAGE CONTENT</span>
                                            <p className="italic text-foreground/80 leading-relaxed">&quot;{report.message?.content}&quot;</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                onClick={() => {
                                                    const reason = prompt('Confirm removal reason:');
                                                    if (reason) {
                                                        api.post(`/moderation/message/${report.messageId}`, { reason })
                                                            .then(() => {
                                                                toast.success('Message removed and logged');
                                                                fetchReports();
                                                            });
                                                    }
                                                }}
                                            >
                                                Remove Message
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                                                onClick={() => {
                                                    api.post('/moderation/warn', { userId: report.message?.senderId, reason: report.reason })
                                                        .then(() => toast.success('Formal warning issued to sender'));
                                                }}
                                            >
                                                Warn Sender
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    // Dismiss logic
                                                    toast.success('Report dismissed');
                                                    setReports(prev => prev.filter(r => r.id !== report.id));
                                                }}
                                            >
                                                Dismiss Report
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

