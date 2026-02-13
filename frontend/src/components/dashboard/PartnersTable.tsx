import { useNavigate } from 'react-router-dom';
import { partners } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ExternalLink, Eye } from 'lucide-react';

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

export function PartnersTable() {
  const navigate = useNavigate();
  const { user } = useUser();

  // Role-based filtering for the dashboard summary table
  const visiblePartners = partners.filter((partner) => {
    if (user.role === 'partner') {
      return partner.id === user.partnerId;
    }
    return true;
  });

  return (
    <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          {user.role === 'partner' ? 'My Performance' : 'Partners Overview'}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate('/partners')}
        >
          <ExternalLink className="w-4 h-4" />
          {user.role === 'partner' ? 'View Details' : 'View All'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Partner</TableHead>
                <TableHead className="font-semibold">Industry</TableHead>
                <TableHead className="font-semibold">Tier</TableHead>
                <TableHead className="font-semibold text-right">Revenue</TableHead>
                <TableHead className="font-semibold text-right">Growth</TableHead>
                <TableHead className="font-semibold text-center">Engagement</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePartners.slice(0, 6).map((partner) => (
                <TableRow
                  key={partner.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/partners/${partner.id}`)}
                >
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell className="text-muted-foreground">{partner.industry}</TableCell>
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
                            'h-full rounded-full transition-all',
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
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {visiblePartners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}