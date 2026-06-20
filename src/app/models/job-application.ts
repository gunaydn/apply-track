export type ApplicationStatus =
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Saved';
export interface Application {
  _id?: string;
  companyName: string;
  position: string;
  location?: string;
  status: ApplicationStatus;
  applicationDate: string;
  followUpDate?: string;
  jobUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
