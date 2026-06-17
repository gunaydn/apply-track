import { Component, OnInit } from '@angular/core';
import {
  JobApplication,
  ApplicationStatus,
} from 'src/app/models/job-application';
import { ApplicationService } from 'src/app/services/application.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  applications: JobApplication[] = [];

  statusChartGradient = '';

  totalApplications = 0;
  appliedCount = 0;
  interviewCount = 0;
  offerCount = 0;
  rejectedCount = 0;
  savedCount = 0;

  interviewRate = 0;
  offerRate = 0;
  rejectionRate = 0;

  statusOverview: {
    label: ApplicationStatus;
    count: number;
    percentage: number;
    barClass: string;
    textClass: string;
  }[] = [];

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.applications = this.applicationService.getApplications();

    this.totalApplications = this.applications.length;

    this.appliedCount = this.getStatusCount('Applied');
    this.interviewCount = this.getStatusCount('Interview');
    this.offerCount = this.getStatusCount('Offer');
    this.rejectedCount = this.getStatusCount('Rejected');
    this.savedCount = this.getStatusCount('Saved');

    this.interviewRate = this.getRate(this.interviewCount);
    this.offerRate = this.getRate(this.offerCount);
    this.rejectionRate = this.getRate(this.rejectedCount);

    this.statusOverview = [
      {
        label: 'Applied',
        count: this.appliedCount,
        percentage: this.getRate(this.appliedCount),
        barClass: 'bg-blue-500',
        textClass: 'text-blue-700',
      },
      {
        label: 'Interview',
        count: this.interviewCount,
        percentage: this.getRate(this.interviewCount),
        barClass: 'bg-purple-500',
        textClass: 'text-purple-700',
      },
      {
        label: 'Offer',
        count: this.offerCount,
        percentage: this.getRate(this.offerCount),
        barClass: 'bg-green-500',
        textClass: 'text-green-700',
      },
      {
        label: 'Rejected',
        count: this.rejectedCount,
        percentage: this.getRate(this.rejectedCount),
        barClass: 'bg-red-500',
        textClass: 'text-red-700',
      },
      {
        label: 'Saved',
        count: this.savedCount,
        percentage: this.getRate(this.savedCount),
        barClass: 'bg-slate-500',
        textClass: 'text-slate-700',
      },
    ];

    this.statusChartGradient = this.getStatusChartGradient();
  }

  getStatusCount(status: ApplicationStatus): number {
    return this.applications.filter((app) => app.status === status).length;
  }

  getRate(count: number): number {
    if (this.totalApplications === 0) {
      return 0;
    }

    return Math.round((count / this.totalApplications) * 100);
  }

  getStatusChartGradient(): string {
    if (this.totalApplications === 0) {
      return 'conic-gradient(#e2e8f0 0% 100%)';
    }

    let currentPercentage = 0;

    const colors: Record<ApplicationStatus, string> = {
      Applied: '#3b82f6',
      Interview: '#a855f7',
      Offer: '#22c55e',
      Rejected: '#ef4444',
      Saved: '#64748b',
    };

    const gradientParts = this.statusOverview.map((item) => {
      const start = currentPercentage;
      const end = currentPercentage + item.percentage;

      currentPercentage = end;

      return `${colors[item.label]} ${start}% ${end}%`;
    });

    return `conic-gradient(${gradientParts.join(', ')})`;
  }

  get recentApplications(): JobApplication[] {
    return this.applications.slice(-5).reverse();
  }
}
