import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { feedbackService } from '@/services';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Feedback, FeedbackStats } from '@/types/feedback.types';

export default function PartnerFeedbackView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.branch?.id) {
            loadFeedback();
        }
    }, [user]);

    const loadFeedback = async () => {
        if (!user?.branch?.id) return;

        try {
            setLoading(true);
            const [feedbackData, statsData] = await Promise.all([
                feedbackService.getFeedbackByBranch(user.branch.id),
                feedbackService.getFeedbackStats({ branchId: user.branch.id })
            ]);

            setFeedback(feedbackData);
            setStats(statsData);
        } catch (error) {
            console.error('Load feedback error:', error);
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'pending' | 'acknowledged' | 'resolved') => {
        try {
            const updated = await feedbackService.updateFeedbackStatus(id, status);
            setFeedback(feedback.map(f => f._id === id ? updated : f));
            toast.success(`Feedback marked as ${status}`);

            // Reload stats
            if (user?.branch?.id) {
                const statsData = await feedbackService.getFeedbackStats({ branchId: user.branch.id });
                setStats(statsData);
            }
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading feedback...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Feedback</h1>
                    <p className="text-muted-foreground text-lg">
                        View feedback and recommendations from analysts
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Average Rating</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold">
                                    {stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
                                </div>
                                <div className="text-sm text-muted-foreground">/ 5.0</div>
                                {stats.average_rating >= 4 ? (
                                    <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
                                ) : stats.average_rating < 3 ? (
                                    <TrendingDown className="h-4 w-4 text-red-500 ml-auto" />
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Feedback</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_feedback}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Open Issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                {stats.issues_count - stats.resolved_count}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Resolved Issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.resolved_count}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Feedback List */}
            {feedback.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <CardTitle className="mb-2">No feedback yet</CardTitle>
                        <CardDescription>
                            Feedback from analysts will appear here
                        </CardDescription>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Recent Feedback ({feedback.length})
                    </h2>
                    <div className="grid gap-4">
                        {feedback.map((item) => (
                            <FeedbackCard
                                key={item._id}
                                feedback={item}
                                onStatusChange={handleStatusChange}
                                showBranch={false}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
