import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Group {
    id: number;
    name: string;
    country: string;
    description: string;
    isGroup: boolean;
}

export const GroupChatManager: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'groups' | 'moderation' | 'reports'>('groups');
    
    // Moderation states
    const [targetUserId, setTargetUserId] = useState('');
    const [warningReason, setWarningReason] = useState('');
    const [suspendUserId, setSuspendUserId] = useState('');
    const [reports, setReports] = useState<any[]>([]);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            setGroups(response.data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        }
    };

    const fetchReports = async () => {
        try {
            const response = await api.get('/moderation/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
        if (activeTab === 'reports') fetchReports();
    }, [activeTab]);

    const createGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !country) {
            toast.error('Name and Country are required');
            return;
        }

        try {
            setLoading(true);
            await api.post('/groups', { name, country, description });
            toast.success('Group created successfully!');
            setName('');
            setCountry('');
            setDescription('');
            fetchGroups();
        } catch (error) {
            console.error('Failed to create group:', error);
            toast.error('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const warnUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUserId || !warningReason) {
            toast.error('User ID and Reason are required');
            return;
        }
        try {
            await api.post('/moderation/warn', { userId: targetUserId, reason: warningReason });
            toast.success('User warned successfully');
            setTargetUserId('');
            setWarningReason('');
        } catch (error) {
            toast.error('Failed to warn user');
        }
    };

    const suspendUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!suspendUserId) return;
        if (!confirm('Are you sure you want to suspend this user? They will be logged out immediately.')) return;
        
        try {
            await api.post(`/moderation/suspend/${suspendUserId}`);
            toast.success('User suspended successfully');
            setSuspendUserId('');
        } catch (error) {
            toast.error('Failed to suspend user');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Community & Moderation</h1>

            <div className="flex gap-4 mb-8 border-b">
                <button 
                    className={`pb-2 px-4 ${activeTab === 'groups' ? 'border-b-2 border-primary font-bold' : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    Chat Groups
                </button>
                <button 
                    className={`pb-2 px-4 ${activeTab === 'moderation' ? 'border-b-2 border-primary font-bold' : ''}`}
                    onClick={() => setActiveTab('moderation')}
                >
                    Moderation
                </button>
                <button 
                    className={`pb-2 px-4 ${activeTab === 'reports' ? 'border-b-2 border-primary font-bold' : ''}`}
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
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Create New Community Group</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={createGroup} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                                        <Input 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="e.g. Canada Scholarship Aspirants"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <Input 
                                            value={country} 
                                            onChange={(e) => setCountry(e.target.value)} 
                                            placeholder="e.g. Canada"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        className="w-full border rounded-md p-2 bg-background"
                                        rows={3}
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        placeholder="Describe the purpose of this group..."
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Group'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <h2 className="text-2xl font-semibold mb-4">Existing Groups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <Card key={group.id}>
                                <CardHeader>
                                    <CardTitle>{group.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-blue-600 font-medium mb-2">{group.country}</p>
                                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Edit</Button>
                                        <Button variant="destructive" size="sm">Delete</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            ) : activeTab === 'moderation' ? (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Warn User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={warnUser} className="space-y-4">
                                <Input 
                                    value={targetUserId} 
                                    onChange={(e) => setTargetUserId(e.target.value)} 
                                    placeholder="User ID"
                                />
                                <textarea 
                                    className="w-full border rounded-md p-2 bg-background"
                                    rows={2}
                                    value={warningReason} 
                                    onChange={(e) => setWarningReason(e.target.value)} 
                                    placeholder="Reason for warning..."
                                />
                                <Button type="submit" variant="secondary">Issue Warning</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Suspend User Account</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={suspendUser} className="space-y-4">
                                <Input 
                                    value={suspendUserId} 
                                    onChange={(e) => setSuspendUserId(e.target.value)} 
                                    placeholder="User ID"
                                />
                                <p className="text-sm text-amber-600 italic">
                                    Warning: This will immediately deactivate the user's account.
                                </p>
                                <Button type="submit" variant="destructive">Suspend Account</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold mb-4">Pending Message Reports</h2>
                    {reports.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground italic">
                                No pending reports. The community is clean!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {reports.map((report) => (
                                <Card key={report.id} className="border-l-4 border-l-red-500">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-bold">Reported Message</p>
                                                <p className="text-xs text-muted-foreground">From: {report.message?.sender?.name} | Reported by: {report.reporter?.name}</p>
                                            </div>
                                            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                {report.reason}
                                            </span>
                                        </div>
                                        <div className="bg-muted p-3 rounded text-sm mb-4 italic">
                                            "{report.message?.content}"
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                onClick={() => {
                                                    const reason = prompt('Moderation reason:');
                                                    if (reason) {
                                                        api.post(`/moderation/message/${report.messageId}`, { reason })
                                                            .then(() => {
                                                                toast.success('Message removed');
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
                                                onClick={() => {
                                                    api.post('/moderation/warn', { userId: report.message.senderId, reason: report.reason })
                                                        .then(() => toast.success('Sender warned'));
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
                                                Dismiss
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
