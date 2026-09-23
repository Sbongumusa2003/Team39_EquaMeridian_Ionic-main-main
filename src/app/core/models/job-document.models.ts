export interface JobDocumentDto {
  jobDocumentID: number;
  documentType: string;
  documentName: string;
  uploadedByName: string;
  uploadedDate: string;
  fileSizeBytes: number;
  status: string;
  canDelete: boolean;
}

export interface JobDocumentsPageDto {
  leaseAgreementID: number;
  agreementNumber: string;
  inspectionReports: JobDocumentDto[];
  jobSitePhotos: JobDocumentDto[];
  deliveryDocumentation: JobDocumentDto[];
  maintenanceRecords: JobDocumentDto[];
  otherDocuments: JobDocumentDto[];
}

export const JobDocumentTypes = [
  'InspectionReport', 'JobSitePhoto', 'DeliveryDocumentation', 'MaintenanceRecord', 'Other'
];

export const JobDocumentTypeLabels: { [key: string]: string } = {
  InspectionReport: 'Inspection Report',
  JobSitePhoto: 'Job Site Photo',
  DeliveryDocumentation: 'Delivery Documentation',
  MaintenanceRecord: 'Maintenance Record',
  Other: 'Other'
};
