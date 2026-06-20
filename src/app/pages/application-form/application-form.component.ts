import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';
import { ApplicationStatus } from 'src/app/models/job-application';
import { Location } from '@angular/common';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent implements OnInit {
  statuses: ApplicationStatus[] = [
    'Applied',
    'Interview',
    'Offer',
    'Rejected',
    'Saved',
  ];

  isEditMode = false;
  returnUrl = '/applications';
  applicationId: string | null = null;

  applicationForm = this.fb.group({
    companyName: ['', Validators.required],
    position: ['', Validators.required],
    status: ['Applied' as ApplicationStatus, Validators.required],
    applicationDate: ['', Validators.required],
    location: [''],
    jobUrl: [''],
    notes: [''],
  });

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id');

    const returnUrlFromQuery =
      this.route.snapshot.queryParamMap.get('returnUrl');

    if (returnUrlFromQuery) {
      this.returnUrl = returnUrlFromQuery;
    }

    if (this.applicationId) {
      this.isEditMode = true;

      this.applicationService.getApplicationById(this.applicationId).subscribe({
        next: (application) => {
          this.applicationForm.patchValue({
            companyName: application.companyName,
            position: application.position,
            status: application.status,
            applicationDate: application.applicationDate,
            location: application.location || '',
            jobUrl: application.jobUrl || '',
            notes: application.notes || '',
          });
        },
        error: (err) => {
          console.error('Application could not be loaded', err);
          this.router.navigate(['/applications']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    const formValue = this.applicationForm.getRawValue();

    const applicationData = {
      companyName: formValue.companyName!,
      position: formValue.position!,
      status: formValue.status!,
      applicationDate: formValue.applicationDate!,
      location: formValue.location || '',
      jobUrl: formValue.jobUrl || '',
      notes: formValue.notes || '',
    };

    if (this.isEditMode && this.applicationId) {
      this.applicationService
        .updateApplication(this.applicationId, applicationData)
        .subscribe({
          next: () => {
            this.router.navigateByUrl(this.returnUrl);
          },
          error: (err) => {
            console.error('Application could not be updated', err);
          },
        });

      return;
    }

    this.applicationService.addApplication(applicationData).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        console.error('Application could not be added', err);
      },
    });

    this.router.navigateByUrl(this.returnUrl);
  }

  goBack(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  goBackToLastPage(): void {
    this.location.back();
  }
}
