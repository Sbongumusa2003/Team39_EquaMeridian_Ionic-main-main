export interface RevenueMonthBreakDto {
  year: number;
  month: number;
  monthLabel: string;
  transactionCount: number;
  subtotal: number;
  platformFeeAmount: number;
  totalAmount: number;
}

export interface RevenueCategoryBreakDto {
  categoryID: number;
  categoryName: string;
  months: RevenueMonthBreakDto[];
  categoryTransactionCount: number;
  categorySubtotal: number;
  categoryPlatformFeeAmount: number;
  categoryTotalAmount: number;
}

export interface RevenueControlBreakReportDto {
  from?: string | null;
  to?: string | null;
  categories: RevenueCategoryBreakDto[];
  grandTransactionCount: number;
  grandSubtotal: number;
  grandPlatformFeeAmount: number;
  grandTotalAmount: number;
}

export interface CategoryDemandDto {
  categoryID: number;
  categoryName: string;
  quotationRequestCount: number;
  bookingCount: number;
  conversionRatePercent: number;
}

export interface MonthlyUsageDto {
  monthLabel: string;
  quotationCount: number;
  bookingCount: number;
}

export interface DemandTrendReportDto {
  from?: string | null;
  to?: string | null;
  categories: CategoryDemandDto[];
  monthlyUsage: MonthlyUsageDto[];
}

// ---- Active Listings ----
export interface ActiveListingRowDto {
  listingID: number;
  listingTitle: string;
  categoryName: string;
  supplierName: string;
  dailyRateZAR: number;
  location?: string | null;
  averageRating: number;
  createdDate: string;
}

export interface ActiveListingsReportDto {
  listings: ActiveListingRowDto[];
  totalCount: number;
}

// ---- Monthly Overview ----
export interface MonthlyOverviewRowDto {
  year: number;
  month: number;
  monthLabel: string;
  grossRevenue: number;
  platformCommission: number;
  bookingCount: number;
}

export interface MonthlyOverviewReportDto {
  from?: string | null;
  to?: string | null;
  months: MonthlyOverviewRowDto[];
}

// ---- Pending Supplier Approvals ----
export interface PendingSupplierRowDto {
  userID: number;
  fullName: string;
  email: string;
  companyName?: string | null;
  registrationNumber?: string | null;
  createdDate: string;
  daysPending: number;
}

export interface PendingSupplierApprovalsReportDto {
  suppliers: PendingSupplierRowDto[];
  totalCount: number;
}

// ---- Open Disputes ----
export interface OpenDisputeRowDto {
  disputeID: number;
  bookingReference: string;
  contractorName: string;
  supplierName: string;
  reasonCategory: string;
  bookingAmount: number;
  status: string;
  raisedDate: string;
}

export interface OpenDisputesReportDto {
  disputes: OpenDisputeRowDto[];
  totalCount: number;
}

// ---- Supplier Performance (control-break: Supplier -> Month) ----
export interface SupplierPerformanceBreakDto {
  supplierID: number;
  supplierName: string;
  months: RevenueMonthBreakDto[];
  supplierTransactionCount: number;
  supplierSubtotal: number;
  supplierPlatformFeeAmount: number;
  supplierTotalAmount: number;
}

export interface SupplierPerformanceReportDto {
  from?: string | null;
  to?: string | null;
  suppliers: SupplierPerformanceBreakDto[];
  grandTransactionCount: number;
  grandSubtotal: number;
  grandPlatformFeeAmount: number;
  grandTotalAmount: number;
}

export type ReportExportFormat = 'csv' | 'pdf' | 'xlsx' | 'docx';
export type ReportTab =
  | 'revenue'
  | 'demand'
  | 'active-listings'
  | 'monthly-overview'
  | 'pending-suppliers'
  | 'open-disputes'
  | 'supplier-performance';
