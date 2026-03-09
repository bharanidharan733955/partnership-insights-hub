import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, ArrowLeft, Building2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/api.client';
import { getCustomerFeedback, submitCustomerFeedback } from '@/lib/api';
import { toast } from 'sonner';

type CustomerFeedbackEntry = {
  _id: string;
  date: string;
  dayFeedback: string;
  branchId?: { _id?: string; id?: string; name?: string; location?: string } | string;
  submittedBy?: { _id?: string; id?: string; name?: string; email?: string } | string;
  createdAt?: string;
};

type BranchOption = { id: string; name: string; location: string };

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function getErrorMessage(err: unknown): string {
  const r = asRecord(err);
  const msg = r?.message;
  return typeof msg === 'string' ? msg : 'Unexpected error';
}

export default function DailyFeedbackPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAnalyst = user?.role === 'analyst';
  const isPartner = user?.role === 'partner';

  const [items, setItems] = useState<CustomerFeedbackEntry[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayFeedback, setDayFeedback] = useState<string>('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (branchId?: string) => {
    try {
      setLoading(true);

      const [feedbackList, partnerData] = await Promise.all([
        getCustomerFeedback(isAnalyst && branchId && branchId !== 'all' ? { branchId } : undefined).catch(() => []),
        isAnalyst ? apiClient.get('/partners').then((r) => r.data).catch(() => []) : Promise.resolve([]),
      ]);

      const normalized = Array.isArray(feedbackList) ? feedbackList : [];
      setItems(normalized as CustomerFeedbackEntry[]);

      if (isAnalyst) {
        const allBranches: BranchOption[] = [];
        (Array.isArray(partnerData) ? partnerData : []).forEach((pUnknown) => {
          const p = asRecord(pUnknown);
          const branchesUnknown = p?.branches;
          if (!Array.isArray(branchesUnknown)) return;
          branchesUnknown.forEach((bUnknown) => {
            const b = asRecord(bUnknown);
            const id = (b?._id ?? b?.id);
            const name = b?.name;
            const location = b?.location;
            if (typeof id === 'string' && typeof name === 'string' && typeof location === 'string') {
              allBranches.push({ id, name, location });
            }
          });
        });
        setBranches(allBranches);
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) || 'Failed to load daily feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayFeedback.trim()) {
      toast.error('Please write today’s feedback');
      return;
    }
    setSubmitting(true);
    try {
      await submitCustomerFeedback({
        date: formDate,
        dayFeedback: dayFeedback.trim(),
      });
      toast.success('Daily feedback submitted');
      setDayFeedback('');
      await load(isAnalyst ? branchFilter : undefined);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Failed to submit daily feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      return bd - ad;
    });
  }, [items]);

  if (!user) return null;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Daily Feedback</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-2xl">
              {isPartner
                ? 'Capture a quick summary of how the day went. Only you and your analysts can see these notes.'
                : 'Review daily partner feedback by branch. Each note is visible only to that partner and the analyst team.'}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 border-2 ${
              isAnalyst
                ? 'border-blue-500/40 bg-blue-500/5 text-blue-600'
                : 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600'
            }`}
          >
            Viewing as {isAnalyst ? 'Analyst' : isPartner ? 'Partner' : 'User'}
          </Badge>
        </div>
      </div>

      {isAnalyst && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4 text-primary" /> <span className="font-medium">Filter</span>
              </div>
              <Select
                value={branchFilter}
                onValueChange={(v) => {
                  setBranchFilter(v);
                  load(v);
                }}
              >
                <SelectTrigger className="w-[260px] h-9">
                  <SelectValue placeholder={branches.length ? 'All branches' : 'No branches'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-auto">
                Showing {sorted.length} entries
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isPartner && (
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="h-5 w-5 text-primary" />
              Today&apos;s Feedback
            </CardTitle>
            <CardDescription>
              Share what went well, what didn&apos;t, and anything your analyst should know. Only you and the analyst team can
              view this note.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="df-date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="df-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="df-text" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Day Feedback *
                </Label>
                <Textarea
                  id="df-text"
                  value={dayFeedback}
                  onChange={(e) => setDayFeedback(e.target.value)}
                  placeholder="Example: Morning footfall was low due to rain, but evening sales picked up. Customers asked for more offers on accessories."
                  rows={5}
                  className="resize-none"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting} className="min-w-[160px]">
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading daily feedback…</div>
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No daily feedback yet</CardTitle>
            <CardDescription>
              {isPartner
                ? 'Submit a daily feedback note from your dashboard.'
                : 'Partners have not submitted daily feedback yet.'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((it) => {
            const branchName =
              typeof it.branchId === 'object'
                ? it.branchId?.name
                : undefined;
            const branchLoc =
              typeof it.branchId === 'object'
                ? it.branchId?.location
                : undefined;

            const submittedByName =
              typeof it.submittedBy === 'object'
                ? it.submittedBy?.name
                : undefined;

            return (
              <Card key={it._id} className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(it.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    {branchName && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {branchName}
                        {branchLoc ? <span className="text-muted-foreground">• {branchLoc}</span> : null}
                      </span>
                    )}
                    {submittedByName && <span className="text-muted-foreground">• {submittedByName}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{it.dayFeedback}</p>
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

