import { Component, HostListener, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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

  applicationToDelete: JobApplication | null = null;

  isFabVisible = true;
  private lastScrollY = 0;

  statuses: (ApplicationStatus | 'All')[] = [
    'All',
    'Applied',
    'Interview',
    'Offer',
    'Rejected',
    'Saved',
  ];

  constructor(
    private applicationService: ApplicationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

    this.isFabVisible = distanceFromBottom > 100;
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

  openDeleteConfirm(application: JobApplication): void {
    this.applicationToDelete = application;
  }

  cancelDelete(): void {
    this.applicationToDelete = null;
  }

  confirmDelete(): void {
    if (!this.applicationToDelete) {
      return;
    }

    this.applicationService.deleteApplication(this.applicationToDelete.id);

    this.toastr.success(
      `${this.applicationToDelete.companyName} application deleted successfully.`,
      'Deleted'
    );

    this.applicationToDelete = null;
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
