import { Star, Calendar, User, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Feedback } from '@/types/feedback.types';

interface FeedbackCardProps {
    feedback: Feedback;
    onStatusChange?: (id: string, status: 'pending' | 'acknowledged' | 'resolved') => void;
    showBranch?: boolean;
}

export function FeedbackCard({ feedback, onStatusChange, showBranch = false }: FeedbackCardProps) {
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'sales':
                return 'bg-blue-500/10 text-blue-500';
            case 'performance':
                return 'bg-green-500/10 text-green-500';
            case 'communication':
                return 'bg-purple-500/10 text-purple-500';
            case 'compliance':
                return 'bg-orange-500/10 text-orange-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500';
            case 'acknowledged':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-500';
            case 'resolved':
                return 'bg-green-500/10 text-green-600 dark:text-green-500';
            default:
                return 'bg-gray-500/10 text-gray-600';
        }
    };

    return (
        <Card className="hover-lift">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        {showBranch && feedback.branch && (
                            <CardTitle className="text-lg">
                                {feedback.branch.name} - {feedback.branch.location}
                            </CardTitle>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(feedback.date).toLocaleDateString()}</span>
                            {feedback.analyst && (
                                <>
                                    <span>•</span>
                                    <User className="h-4 w-4" />
                                    <span>{feedback.analyst.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= feedback.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <Badge variant="outline" className={getCategoryColor(feedback.category)}>
                            {feedback.category}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Comment */}
                <div>
                    <p className="text-sm text-foreground">{feedback.comment}</p>
                </div>

                {/* Issues */}
                {feedback.issues && feedback.issues.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span>Issues ({feedback.issues.length})</span>
                        </div>
                        <ul className="space-y-1 ml-6">
                            {feedback.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-muted-foreground list-disc">
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Suggestions */}
                {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <Lightbulb className="h-4 w-4" />
                            <span>Suggestions ({feedback.suggestions.length})</span>
                        </div>
                        <ul className="space-y-1 ml-6">
                            {feedback.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-muted-foreground list-disc">
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status === 'resolved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                    </Badge>

                    {onStatusChange && feedback.status !== 'resolved' && (
                        <div className="flex gap-2">
                            {feedback.status === 'pending' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onStatusChange(feedback._id, 'acknowledged')}
                                >
                                    Acknowledge
                                </Button>
                            )}
                            {feedback.status === 'acknowledged' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onStatusChange(feedback._id, 'resolved')}
                                >
                                    Mark Resolved
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
