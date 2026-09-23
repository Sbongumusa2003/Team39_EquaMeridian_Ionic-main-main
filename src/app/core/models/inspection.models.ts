export interface InspectionListItemDto {
  inspectionID: number;
  listingID: number;
  machineryTitle: string;
  supplierName: string;
  scheduledDate: string;
  status: string;
  outcome?: string;
}

export interface InspectionOutcomeDto extends InspectionListItemDto {
  notes?: string;
}

export interface MachineryOptionDto {
  listingID: number;
  machineryTitle: string;
  company: string;
  status: string;
}

export interface RequestInspectionDto {
  listingID: number;
  scheduledDate: string;
}

export interface ConfirmOutcomeDto {
  outcome: string;
  notes?: string;
}

export interface InspectionsPagedResult {
  inspections: InspectionListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
