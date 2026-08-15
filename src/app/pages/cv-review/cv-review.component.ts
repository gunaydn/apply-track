import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Resume,
  ResumeAnalysis,
  ResumeService,
} from 'src/app/services/resume.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cv-review',
  templateUrl: './cv-review.component.html',
})
export class CvReviewComponent implements OnInit {
  selectedFile: File | null = null;
  currentResume: Resume | null = null;
  analysis: ResumeAnalysis | null = null;

  isLoadingResume = true;
  isAnalyzing = false;
  showReviewWorkspace = false;
  isUploading = false;
  mobileView: 'cv' | 'review' = 'review';

  uploadError = '';
  loadError = '';
  analysisError = '';

  constructor(
    private readonly resumeService: ResumeService,
    private readonly toastr: ToastrService
  ) {}

  get currentResumeFileUrl(): string {
    if (!this.currentResume?.filePath) {
      return '';
    }

    return `${environment.fileBaseUrl}${this.currentResume.filePath}`;
  }

  ngOnInit(): void {
    this.loadCurrentResume();
  }

  setMobileView(view: 'cv' | 'review'): void {
    this.mobileView = view;
  }

  startReview(): void {
    if (!this.currentResume || this.isAnalyzing) {
      return;
    }

    this.analysisError = '';
    this.analysis = null;
    this.isAnalyzing = true;
    this.showReviewWorkspace = true;
    this.mobileView = 'review';

    this.resumeService.analyzeCurrentResume().subscribe({
      next: (response) => {
        this.analysis = response.analysis;
        this.isAnalyzing = false;
        this.mobileView = 'review';
      },
      error: (error: HttpErrorResponse) => {
        this.isAnalyzing = false;
        this.analysisError = this.extractErrorMessage(
          error,
          'The CV review could not be completed. Please try again later.'
        );
      },
    });
  }

  loadCurrentResume(): void {
    this.isLoadingResume = true;
    this.loadError = '';

    this.resumeService.getCurrentResume().subscribe({
      next: (resume) => {
        this.currentResume = resume;
        this.isLoadingResume = false;
      },
      error: () => {
        this.currentResume = null;
        this.isLoadingResume = false;
        this.loadError = 'Your CV could not be loaded.';
      },
    });
  }

  onResumeFileSelected(file: File | null): void {
    this.selectedFile = file;
    this.uploadError = '';
  }

  uploadResume(): void {
    if (!this.selectedFile || this.isUploading) {
      return;
    }

    const title = this.selectedFile.name.replace(/\.pdf$/i, '');

    this.isUploading = true;
    this.uploadError = '';

    this.resumeService.uploadResume(this.selectedFile, title).subscribe({
      next: (resume) => {
        this.currentResume = resume;
        this.selectedFile = null;
        this.isUploading = false;
        this.analysis = null;
        this.analysisError = '';

        this.toastr.success('CV uploaded successfully.');
      },
      error: (error) => {
        this.isUploading = false;

        this.uploadError =
          this.extractErrorMessage(error, 'CV could not be uploaded.');
      },
    });
  }

  private extractErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    const message = error?.error?.message;

    if (Array.isArray(message)) {
      return message[0] || fallback;
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return fallback;
  }
}
