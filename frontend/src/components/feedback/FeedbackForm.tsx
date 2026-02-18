import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateFeedbackRequest } from '@/types/feedback.types';

interface FeedbackFormProps {
    branches: Array<{ _id: string; name: string; location: string }>;
    onSubmit: (data: CreateFeedbackRequest) => Promise<void>;
    onCancel?: () => void;
}

export function FeedbackForm({ branches, onSubmit, onCancel }: FeedbackFormProps) {
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState<CreateFeedbackRequest>({
        branch_id: '',
        date: new Date().toISOString().split('T')[0],
        rating: 0,
        category: 'sales',
        comment: '',
        issues: [],
        suggestions: [],
    });

    const [issueInput, setIssueInput] = useState('');
    const [suggestionInput, setSuggestionInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({ ...formData, rating });
            // Reset form
            setFormData({
                branch_id: '',
                date: new Date().toISOString().split('T')[0],
                rating: 0,
                category: 'sales',
                comment: '',
                issues: [],
                suggestions: [],
            });
            setRating(0);
            setIssueInput('');
            setSuggestionInput('');
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addIssue = () => {
        if (issueInput.trim()) {
            setFormData({
                ...formData,
                issues: [...(formData.issues || []), issueInput.trim()],
            });
            setIssueInput('');
        }
    };

    const removeIssue = (index: number) => {
        setFormData({
            ...formData,
            issues: formData.issues?.filter((_, i) => i !== index) || [],
        });
    };

    const addSuggestion = () => {
        if (suggestionInput.trim()) {
            setFormData({
                ...formData,
                suggestions: [...(formData.suggestions || []), suggestionInput.trim()],
            });
            setSuggestionInput('');
        }
    };

    const removeSuggestion = (index: number) => {
        setFormData({
            ...formData,
            suggestions: formData.suggestions?.filter((_, i) => i !== index) || [],
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Provide Branch Feedback</CardTitle>
                <CardDescription>
                    Share your assessment and recommendations for branch performance
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Branch Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch *</Label>
                        <Select
                            value={formData.branch_id}
                            onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Array.isArray(branches) ? branches : []).map((branch) => (
                                    <SelectItem key={branch._id} value={branch._id}>
                                        {branch.name} - {branch.location}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <Label>Rating *</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground self-center">
                                {rating > 0 ? `${rating}/5` : 'Select rating'}
                            </span>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sales">Sales Performance</SelectItem>
                                <SelectItem value="performance">Overall Performance</SelectItem>
                                <SelectItem value="communication">Communication</SelectItem>
                                <SelectItem value="compliance">Compliance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment *</Label>
                        <Textarea
                            id="comment"
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="Provide detailed feedback..."
                            rows={4}
                            required
                        />
                    </div>

                    {/* Issues */}
                    <div className="space-y-2">
                        <Label>Issues (Optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                value={issueInput}
                                onChange={(e) => setIssueInput(e.target.value)}
                                placeholder="Add an issue..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIssue())}
                            />
                            <Button type="button" onClick={addIssue} variant="outline">
                                Add
                            </Button>
                        </div>
                        {formData.issues && formData.issues.length > 0 && (
                            <div className="space-y-1 mt-2">
                                {formData.issues.map((issue, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-muted p-2 rounded"
                                    >
                                        <span className="text-sm">{issue}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeIssue(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                        <Label>Suggestions (Optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                value={suggestionInput}
                                onChange={(e) => setSuggestionInput(e.target.value)}
                                placeholder="Add a suggestion..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSuggestion())}
                            />
                            <Button type="button" onClick={addSuggestion} variant="outline">
                                Add
                            </Button>
                        </div>
                        {formData.suggestions && formData.suggestions.length > 0 && (
                            <div className="space-y-1 mt-2">
                                {formData.suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-muted p-2 rounded"
                                    >
                                        <span className="text-sm">{suggestion}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSuggestion(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
