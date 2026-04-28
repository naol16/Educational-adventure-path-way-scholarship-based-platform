import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { useAuth } from '@/providers/auth-context';
import { toast } from 'react-hot-toast';

interface Group {
    id: number;
    name: string;
    country: string;
    description: string;
    isGroup: boolean;
    isJoined?: boolean;
}

export const CommunityGroups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/groups');
            setGroups(response.data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            toast.error('Failed to load community groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const joinGroup = async (groupId: number) => {
        try {
            await api.post(`/groups/${groupId}/join`);
            toast.success('Joined group successfully!');
            // Redirect to chat page
            window.location.href = '/dashboard/student/chat';
        } catch (error) {
            console.error('Failed to join group:', error);
            toast.error('Failed to join group');
        }
    };

    if (loading) return <div>Loading groups...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Community Groups</h1>
            <p className="text-gray-600 mb-8">
                Connect with other students interested in the same study destinations. 
                Share ideas, ask questions, and build your network.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <Card key={group.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{group.name}</CardTitle>
                                <Badge variant="secondary">{group.country}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {group.description || 'No description available for this group.'}
                            </p>
                            <Button 
                                onClick={() => !group.isJoined && joinGroup(group.id)} 
                                className={`w-full ${group.isJoined ? 'bg-green-600 hover:bg-green-700 cursor-default' : ''}`}
                                disabled={group.isJoined}
                            >
                                {group.isJoined ? 'Already Joined' : 'Join Community'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {groups.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 italic">No community groups found. Check back later!</p>
                </div>
            )}
        </div>
    );
};
