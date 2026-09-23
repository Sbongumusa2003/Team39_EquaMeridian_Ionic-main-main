export interface MetricDto {
  value: number;
  previousValue: number;
  percentChange?: number | null;
}

export interface RecentActivityDto {
  auditID: number;
  eventType: string;
  actingUser?: string | null;
  timestamp: string;
}

export interface DashboardSummaryDto {
  totalUsers: MetricDto;
  activeListings: MetricDto;
  pendingListings: MetricDto;
  openDisputes: MetricDto;
  monthlyRevenue: MetricDto;
  activeCampaigns: MetricDto;
  recentActivity: RecentActivityDto[];
}
