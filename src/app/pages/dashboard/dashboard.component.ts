import { Component, OnInit } from '@angular/core';
import { JobApplication } from 'src/app/models/job-application';
import { ApplicationService } from 'src/app/services/application.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  applications: JobApplication[] = [];

  totalApplications = 0;
  interviewCount = 0;
  offerCount = 0;
  rejectedCount = 0;

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.applications = this.applicationService.getApplications();

    this.totalApplications = this.applications.length;
    this.interviewCount = this.applications.filter(
      (app) => app.status === 'Interview'
    ).length;
    this.offerCount = this.applications.filter(
      (app) => app.status === 'Offer'
    ).length;
    this.rejectedCount = this.applications.filter(
      (app) => app.status === 'Rejected'
    ).length;
  }

  get recentApplications(): JobApplication[] {
    return this.applications.slice(-5).reverse();
  }
}
