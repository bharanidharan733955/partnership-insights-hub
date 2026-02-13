import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { partners } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Search, Plus, Filter, Download, MoreHorizontal, Mail, Building2, Eye } from 'lucide-react';

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const tierStyles = {
  platinum: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  gold: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  silver: 'bg-muted text-muted-foreground border-border',
  bronze: 'bg-chart-5/5 text-chart-5/70 border-chart-5/10',
};

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { user } = useUser();

  // Role-based filtering:
  // Analysts and Admins see all partners.
  // Partners only see themselves.
  const visiblePartners = partners.filter((partner) => {
    if (user.role === 'partner') {
      return partner.id === user.partnerId;
    }
    return true;
  });

  const filteredPartners = visiblePartners.filter((partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
    const matchesTier = tierFilter === 'all' || partner.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Partners</h1>
            <p className="text-muted-foreground">
              {user.role === 'partner'
                ? 'Your partnership information and overview'
                : 'Manage and monitor your partnership network'}
            </p>
          </div>
          {(user.role === 'admin' || user.role === 'analyst') && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Partner
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={user.role === 'partner' ? "Search within your data..." : "Search partners..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {user.role !== 'partner' && (
                  <>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners Table */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {user.role === 'partner' ? 'My Partnership' : `All Partners (${filteredPartners.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Partner</TableHead>
                    <TableHead className="font-semibold">Industry</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Tier</TableHead>
                    <TableHead className="font-semibold text-right">Revenue</TableHead>
                    <TableHead className="font-semibold text-right">Growth</TableHead>
                    <TableHead className="font-semibold text-center">Engagement</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Start Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow
                      key={partner.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/partners/${partner.id}`)}
                    >
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell className="text-muted-foreground">{partner.industry}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${partner.contactEmail}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="w-3 h-3" />
                          {partner.contactEmail}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize text-xs', tierStyles[partner.tier])}>
                          {partner.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${partner.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn('font-medium', partner.growthRate >= 0 ? 'text-success' : 'text-destructive')}>
                          {partner.growthRate >= 0 && '+'}
                          {partner.growthRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                partner.engagementScore >= 80
                                  ? 'bg-success'
                                  : partner.engagementScore >= 60
                                    ? 'bg-chart-1'
                                    : 'bg-warning'
                              )}
                              style={{ width: `${partner.engagementScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{partner.engagementScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[partner.status])}>
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(partner.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPartners.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                        No partners found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}