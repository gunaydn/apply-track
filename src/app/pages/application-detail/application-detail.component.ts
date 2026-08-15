import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Application } from 'src/app/models/job-application';
import { ApplicationService } from 'src/app/services/application.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
})
export class ApplicationDetailComponent implements OnInit {
  application: Application | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/applications']);
      return;
    }

    this.applicationService.getApplicationById(id).subscribe({
      next: (application) => {
        this.application = application;
      },
      error: (err) => {
        console.error('Application could not be loaded', err);
        this.router.navigate(['/applications']);
      },
    });
  }

  deleteApplication(): void {
    if (!this.application) return;

    const confirmed = confirm(
      'Are you sure you want to delete this application?'
    );

    if (!confirmed) {
      return;
    }

    const applicationId = this.application._id;

    if (!applicationId) {
      console.error('Application id not found');
      return;
    }

    this.applicationService.deleteApplication(applicationId).subscribe({
      next: () => {
        this.router.navigate(['/applications']);
      },
      error: (err) => {
        console.error('Application could not be deleted', err);
      },
    });
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

  markFollowUpCompleted(): void {
    if (!this.application?._id) {
      return;
    }

    this.applicationService
      .markFollowUpCompleted(this.application._id)
      .subscribe({
        next: (updatedApplication) => {
          this.application = updatedApplication;
        },
        error: (err) => {
          console.error('Follow-up could not be marked as completed', err);
        },
      });
  }
}
