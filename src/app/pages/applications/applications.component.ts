import { Component, OnInit } from '@angular/core';
import {
  JobApplication,
  ApplicationStatus,
} from 'src/app/models/job-application';
import { ApplicationService } from 'src/app/services/application.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent implements OnInit {
  applications: JobApplication[] = [];
  filteredApplications: JobApplication[] = [];

  searchTerm = '';
  selectedStatus: ApplicationStatus | 'All' = 'All';

  statuses: (ApplicationStatus | 'All')[] = [
    'All',
    'Applied',
    'Interview',
    'Offer',
    'Rejected',
    'Saved',
  ];

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.applications = this.applicationService.getApplications();
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchTerm.toLowerCase().trim();

    this.filteredApplications = this.applications.filter((app) => {
      const matchesSearch =
        app.companyName.toLowerCase().includes(search) ||
        app.position.toLowerCase().includes(search) ||
        (app.location || '').toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' || app.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.applyFilters();
  }

  deleteApplication(id: string): void {
    this.applicationService.deleteApplication(id);
    this.loadApplications();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-700';
      case 'Interview':
        return 'bg-purple-100 text-purple-700';
      case 'Offer':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Saved':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
