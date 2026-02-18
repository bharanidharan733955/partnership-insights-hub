import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, Plus, Star, ArrowLeft,
    Building2, Calendar, Tag, CheckCircle2, Clock,
    XCircle, Trash2, Filter, BarChart3, TrendingUp,
    AlertTriangle, Send, Reply, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { feedbackService } from '@/services';
import apiClient from '@/services/api.client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Feedback, CreateFeedbackRequest } from '@/types/feedback.types';

interface Branch {
    _id: string;
    id: string;
    name: string;
    location: string;
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    acknowledged: { label: 'Acknowledged', icon: CheckCircle2, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    resolved: { label: 'Resolved', icon: CheckCircle2, className: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

const CATEGORY_LABELS: Record<string, string> = {
    sales: 'Sales Performance',
    performance: 'Overall Performance',
    communication: 'Communication',
    compliance: 'Compliance',
};

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
    const sz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`${sz} ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20 fill-muted-foreground/10'}`} />
            ))}
        </div>
    );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110">
                    <Star className={`h-7 w-7 transition-colors ${s <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 fill-transparent'}`} />
                </button>
            ))}
            {value > 0 && <span className="ml-2 text-sm text-muted-foreground">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}</span>}
        </div>
    );
}

const defaultForm: CreateFeedbackRequest = {
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    rating: 0,
    category: 'sales',
    comment: '',
    issues: [],
    suggestions: [],
};

// ─── Analyst Reply Panel ────────────────────────────────────────────────────
function ReplyPanel({ item, onReplied }: { item: Feedback; onReplied: (updated: Feedback) => void }) {
    const [open, setOpen] = useState(false);
    const [replyText, setReplyText] = useState((item as any).reply || '');
    const [saving, setSaving] = useState(false);

    const hasReply = !!(item as any).reply;

    const handleSave = async () => {
        if (!replyText.trim()) { toast.error('Reply cannot be empty'); return; }
        setSaving(true);
        try {
            const updated = await feedbackService.replyToFeedback(item._id, replyText.trim());
            onReplied(updated);
            toast.success('Reply submitted');
            setOpen(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to submit reply');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-3 border-t pt-3">
            {hasReply && !open ? (
                <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3">
                    <Reply className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-primary mb-1">Analyst Reply</p>
                        <p className="text-sm text-foreground">{(item as any).reply}</p>
                        {(item as any).repliedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date((item as any).repliedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                    <button onClick={() => { setOpen(true); setReplyText((item as any).reply); }} className="text-xs text-muted-foreground hover:text-primary transition-colors">Edit</button>
                </div>
            ) : open ? (
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Reply className="h-3 w-3" /> Your Reply
                    </Label>
                    <Textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Write your review and response to this feedback..."
                        rows={3}
                        className="resize-none text-sm"
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                            <Send className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Submit Reply'}
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                    <Reply className="h-3.5 w-3.5" /> Write a reply
                </button>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FeedbackPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAnalyst = user?.role === 'analyst';
    const isPartner = user?.role === 'partner';

    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterBranch, setFilterBranch] = useState<string>('all');

    // Form state (partner only)
    const [form, setForm] = useState<CreateFeedbackRequest>(defaultForm);
    const [rating, setRating] = useState(0);
    const [issueInput, setIssueInput] = useState('');
    const [suggestionInput, setSuggestionInput] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [feedbackData, partnersData] = await Promise.all([
                feedbackService.getAllFeedback().catch(() => []),
                apiClient.get('/partners').then(r => r.data).catch(() => []),
            ]);
            setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
            const allBranches: Branch[] = [];
            (Array.isArray(partnersData) ? partnersData : []).forEach((p: any) => {
                (p.branches || []).forEach((b: any) => {
                    allBranches.push({ _id: b._id || b.id, id: b.id || b._id, name: b.name, location: b.location });
                });
            });
            setBranches(allBranches);
        } catch {
            toast.error('Failed to load feedback data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Please select a rating'); return; }
        setSubmitting(true);
        try {
            const newFeedback = await feedbackService.createFeedback({ ...form, rating });
            setFeedback([newFeedback, ...feedback]);
            setShowForm(false);
            setForm(defaultForm);
            setRating(0);
            setIssueInput('');
            setSuggestionInput('');
            toast.success('Feedback submitted successfully');
        } catch (e: any) {
            toast.error(e.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'pending' | 'acknowledged' | 'resolved') => {
        try {
            const updated = await feedbackService.updateFeedbackStatus(id, status);
            setFeedback(feedback.map(f => (f._id === id ? updated : f)));
            toast.success(`Marked as ${status}`);
        } catch { toast.error('Failed to update status'); }
    };

    const handleDelete = async (id: string) => {
        try {
            await feedbackService.deleteFeedback(id);
            setFeedback(feedback.filter(f => f._id !== id));
            toast.success('Feedback deleted');
        } catch { toast.error('Failed to delete feedback'); }
    };

    const handleReplied = (updated: Feedback) => {
        setFeedback(feedback.map(f => (f._id === updated._id ? updated : f)));
    };

    const addTag = (field: 'issues' | 'suggestions', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        setForm(f => ({ ...f, [field]: [...(f[field] || []), value.trim()] }));
        setter('');
    };
    const removeTag = (field: 'issues' | 'suggestions', index: number) => {
        setForm(f => ({ ...f, [field]: (f[field] || []).filter((_, i) => i !== index) }));
    };

    const filtered = feedback.filter(f => {
        if (filterStatus !== 'all' && f.status !== filterStatus) return false;
        if (filterBranch !== 'all') {
            const bid = (f as any).branch_id || (f as any).branch?._id;
            if (bid !== filterBranch) return false;
        }
        return true;
    });

    const totalFeedback = feedback.length;
    const avgRating = totalFeedback > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / totalFeedback).toFixed(1) : '—';
    const pendingCount = feedback.filter(f => f.status === 'pending').length;
    const resolvedCount = feedback.filter(f => f.status === 'resolved').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with back button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="rounded-full hover:bg-muted"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Branch Feedback</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            {isPartner ? 'Submit and track your branch feedback' : 'Review and respond to branch feedback'}
                        </p>
                    </div>
                </div>

                {/* Only partners can submit new feedback */}
                {isPartner && (
                    <Button
                        size="lg"
                        onClick={() => setShowForm(v => !v)}
                        className="shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        {showForm ? <XCircle className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                        {showForm ? 'Cancel' : 'New Feedback'}
                    </Button>
                )}
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2">
                <Badge variant="outline" className={isAnalyst ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' : 'border-primary/30 text-primary bg-primary/5'}>
                    {isAnalyst ? '🔍 Analyst View — Review & Reply' : '📝 Manager View — Submit Feedback'}
                </Badge>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Feedback', value: totalFeedback, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Pending', value: pendingCount, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Resolved', value: resolvedCount, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label} className="border-border/50">
                        <CardContent className="p-5 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${bg}`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                                <p className="text-2xl font-bold">{value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* New Feedback Form — PARTNER ONLY */}
            {isPartner && showForm && (
                <Card className="border-none shadow-xl">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Submit Branch Feedback
                        </CardTitle>
                        <CardDescription>Provide a detailed assessment of branch performance</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Branch */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                        <Building2 className="h-3 w-3" /> Branch *
                                    </Label>
                                    <Select value={form.branch_id} onValueChange={v => setForm(f => ({ ...f, branch_id: v }))} required>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder={branches.length === 0 ? 'No branches available' : 'Select a branch'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.length === 0
                                                ? <SelectItem value="__none__" disabled>No branches found</SelectItem>
                                                : branches.map(b => (
                                                    <SelectItem key={b._id} value={b._id}>{b.name} — {b.location}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Date */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date *
                                    </Label>
                                    <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="h-11" />
                                </div>
                                {/* Category */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                        <Tag className="h-3 w-3" /> Category *
                                    </Label>
                                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as any }))}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sales">Sales Performance</SelectItem>
                                            <SelectItem value="performance">Overall Performance</SelectItem>
                                            <SelectItem value="communication">Communication</SelectItem>
                                            <SelectItem value="compliance">Compliance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Star className="h-3 w-3" /> Rating *
                                </Label>
                                <StarPicker value={rating} onChange={setRating} />
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comment *</Label>
                                <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Provide a detailed assessment..." rows={4} required className="resize-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Issues */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Issues (Optional)</Label>
                                    <div className="flex gap-2">
                                        <Input value={issueInput} onChange={e => setIssueInput(e.target.value)} placeholder="Add an issue..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('issues', issueInput, setIssueInput))} className="h-10" />
                                        <Button type="button" variant="outline" size="sm" onClick={() => addTag('issues', issueInput, setIssueInput)}>Add</Button>
                                    </div>
                                    {(form.issues || []).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {(form.issues || []).map((issue, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 pr-1">{issue}<button type="button" onClick={() => removeTag('issues', i)} className="ml-1 hover:text-destructive">×</button></Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Suggestions */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suggestions (Optional)</Label>
                                    <div className="flex gap-2">
                                        <Input value={suggestionInput} onChange={e => setSuggestionInput(e.target.value)} placeholder="Add a suggestion..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('suggestions', suggestionInput, setSuggestionInput))} className="h-10" />
                                        <Button type="button" variant="outline" size="sm" onClick={() => addTag('suggestions', suggestionInput, setSuggestionInput)}>Add</Button>
                                    </div>
                                    {(form.suggestions || []).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {(form.suggestions || []).map((s, i) => (
                                                <Badge key={i} variant="outline" className="gap-1 pr-1 border-primary/30 text-primary">{s}<button type="button" onClick={() => removeTag('suggestions', i)} className="ml-1 hover:text-destructive">×</button></Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting} className="shadow-lg shadow-primary/20 min-w-[140px]">
                                    {submitting ? '⏳ Submitting…' : <><CheckCircle2 className="mr-2 h-4 w-4" />Submit Feedback</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            {feedback.length > 0 && (
                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Filter className="h-4 w-4" /> Filter:
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterBranch} onValueChange={setFilterBranch}>
                                <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    {branches.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground ml-auto">Showing {filtered.length} of {feedback.length}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Feedback List */}
            {filtered.length === 0 ? (
                <Card className="border-dashed border-2 border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="p-4 rounded-full bg-muted/50">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">No feedback yet</p>
                            <p className="text-muted-foreground text-sm mt-1">
                                {feedback.length > 0 ? 'Try adjusting your filters' : isPartner ? 'Start by submitting feedback for a branch' : 'No feedback has been submitted yet'}
                            </p>
                        </div>
                        {feedback.length === 0 && isPartner && (
                            <Button onClick={() => setShowForm(true)} className="mt-2">
                                <Plus className="mr-2 h-4 w-4" /> Create First Feedback
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map((item) => {
                        const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                        const StatusIcon = statusCfg.icon;
                        const branchName = (item as any).branch?.name || branches.find(b => b._id === (item as any).branch_id)?.name || 'Unknown Branch';
                        const branchLocation = (item as any).branch?.location || branches.find(b => b._id === (item as any).branch_id)?.location || '';

                        return (
                            <Card key={item._id} className="border-border/50 hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        {/* Rating circle */}
                                        <div className="flex-shrink-0 flex flex-col items-center gap-1 w-16">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 ${item.rating >= 4 ? 'border-green-500/30 bg-green-500/10 text-green-500' : item.rating >= 3 ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
                                                {item.rating}
                                            </div>
                                            <StarDisplay rating={item.rating} />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="font-bold text-base flex items-center gap-1.5">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {branchName}
                                                    {branchLocation && <span className="text-muted-foreground font-normal text-sm">• {branchLocation}</span>}
                                                </span>
                                                <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[item.category] || item.category}</Badge>
                                                <Badge className={`text-xs border ${statusCfg.className}`}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />{statusCfg.label}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.comment}</p>

                                            {((item.issues?.length ?? 0) > 0 || (item.suggestions?.length ?? 0) > 0) && (
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {(item.issues || []).map((issue, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">⚠ {issue}</Badge>
                                                    ))}
                                                    {(item.suggestions || []).map((s, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs border-primary/30 text-primary">💡 {s}</Badge>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>

                                            {/* Analyst reply panel */}
                                            {isAnalyst && <ReplyPanel item={item} onReplied={handleReplied} />}

                                            {/* Partner: show reply if exists */}
                                            {isPartner && (item as any).reply && (
                                                <div className="mt-3 border-t pt-3 flex items-start gap-2 bg-primary/5 rounded-lg p-3">
                                                    <Reply className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-primary mb-1">Analyst Reply</p>
                                                        <p className="text-sm">{(item as any).reply}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions — analyst only for status/delete */}
                                        {isAnalyst && (
                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                <Select value={item.status} onValueChange={(v) => handleStatusChange(item._id, v as any)}>
                                                    <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                                        <SelectItem value="resolved">Resolved</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item._id)}>
                                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
