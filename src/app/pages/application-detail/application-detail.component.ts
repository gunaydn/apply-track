import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobApplication } from 'src/app/models/job-application';
import { ApplicationService } from 'src/app/services/application.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss'],
})
export class ApplicationDetailComponent implements OnInit {
  application: JobApplication | undefined;

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

    this.application = this.applicationService.getApplicationById(id);

    if (!this.application) {
      this.router.navigate(['/applications']);
    }
  }

  deleteApplication(): void {
    if (!this.application) return;

    const confirmed = confirm(
      'Are you sure you want to delete this application?'
    );

    if (!confirmed) {
      return;
    }

    this.applicationService.deleteApplication(this.application.id);
    this.router.navigate(['/applications']);
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
