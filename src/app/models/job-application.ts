export type ApplicationStatus =
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Saved';

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  status: ApplicationStatus;
  applicationDate: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  createdAt: string;
}
