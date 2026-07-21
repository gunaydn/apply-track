import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { Resume, ResumeService } from './services/resume.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('desktopUploadCvButton')
  desktopUploadCvButton?: ElementRef<HTMLButtonElement>;

  @ViewChild('mobileUploadCvButton')
  mobileUploadCvButton?: ElementRef<HTMLButtonElement>;

  isMobileMenuOpen = false;
  isFabVisible = true;
  hideNavbar = false;
  private lastScrollY = 0;
  private resumeModalTrigger: 'desktop' | 'mobile' | null = null;
  private resumePreviewObjectUrl: string | null = null;

  isResumeUploadModalOpen = false;
  isResumeDeleteConfirmOpen = false;
  currentResume: Resume | null = null;
  isResumeLoading = false;
  isResumeUploading = false;
  isResumeDeleting = false;
  showResumeUploadArea = false;
  selectedResumeFile: File | null = null;
  resumeUploadError = '';
  resumeLoadError = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private resumeService: ResumeService,
    private toastr: ToastrService
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isResumeBusy(): boolean {
    return this.isResumeUploading || this.isResumeDeleting;
  }

  ngOnInit(): void {
    this.closeMobileMenu();

    this.resumeService.openModalRequests$.subscribe(() => {
      this.openResumeUploadModal('desktop');
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEnd = event as NavigationEnd;

        this.hideNavbar =
          navigationEnd.urlAfterRedirects.startsWith('/auth') ||
          !this.authService.isLoggedIn();

        this.closeMobileMenu();
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScrollY = window.scrollY;

    if (currentScrollY > this.lastScrollY + 10) {
      this.isFabVisible = false;
    }

    if (currentScrollY < this.lastScrollY - 10) {
      this.isFabVisible = true;
    }

    if (currentScrollY < 50) {
      this.isFabVisible = true;
    }

    this.lastScrollY = currentScrollY;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (this.isResumeBusy) {
      return;
    }

    if (this.isResumeDeleteConfirmOpen) {
      event.preventDefault();
      this.cancelResumeDelete();
      return;
    }

    if (!this.isResumeUploadModalOpen) {
      return;
    }

    event.preventDefault();
    this.closeResumeUploadModal();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  openResumeUploadModal(trigger: 'desktop' | 'mobile' = 'desktop'): void {
    this.resumeModalTrigger = trigger;
    this.isResumeUploadModalOpen = true;
    this.closeMobileMenu();
    this.setBodyScrollLocked(true);
    this.loadCurrentResume();

    queueMicrotask(() => {
      const dialog = document.getElementById('resume-upload-title');
      dialog?.focus();
    });
  }

  loadCurrentResume(): void {
    this.isResumeLoading = true;
    this.resumeLoadError = '';

    this.resumeService.getCurrentResume().subscribe({
      next: (resume) => {
        this.currentResume = resume;
        this.isResumeLoading = false;
        this.showResumeUploadArea = resume === null;
      },
      error: (error: HttpErrorResponse) => {
        this.currentResume = null;
        this.isResumeLoading = false;
        this.showResumeUploadArea = true;
        this.resumeLoadError =
          this.extractErrorMessage(error) ||
          'Uploaded CV could not be loaded.';
      },
    });
  }

  showResumeUploader(): void {
    if (this.isResumeBusy) {
      return;
    }

    this.showResumeUploadArea = true;
  }

  onResumeFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.resumeUploadError = '';
    this.selectedResumeFile = null;

    if (!file) {
      return;
    }

    const isPdf =
      file.type === 'application/pdf' &&
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      this.resumeUploadError = 'Only PDF files are allowed.';
      input.value = '';
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      this.resumeUploadError = 'The PDF file must be smaller than 5 MB.';
      input.value = '';
      return;
    }

    this.selectedResumeFile = file;
  }

  uploadResume(): void {
    if (!this.selectedResumeFile || this.isResumeBusy) {
      this.resumeUploadError = 'Please select a PDF file.';
      return;
    }

    const title = this.selectedResumeFile.name.replace(/\.pdf$/i, '');
    const isReplacement = !!this.currentResume;

    this.isResumeUploading = true;
    this.resumeUploadError = '';

    this.resumeService.uploadResume(this.selectedResumeFile, title).subscribe({
      next: (resume) => {
        this.isResumeUploading = false;
        this.currentResume = resume;
        this.showResumeUploadArea = false;
        this.removeSelectedResume();
        this.resumeService.notifyResumeChanged(resume);
        this.toastr.success(
          isReplacement
            ? 'CV replaced successfully.'
            : 'CV uploaded successfully.'
        );
      },
      error: (error: HttpErrorResponse) => {
        this.isResumeUploading = false;

        this.resumeUploadError =
          this.extractErrorMessage(error) ||
          (isReplacement
            ? 'CV could not be replaced.'
            : 'CV could not be uploaded.');
      },
    });
  }

  deleteCurrentResume(): void {
    if (!this.currentResume || this.isResumeBusy) {
      return;
    }

    this.isResumeDeleteConfirmOpen = true;
  }

  cancelResumeDelete(): void {
    if (this.isResumeDeleting) {
      return;
    }

    this.isResumeDeleteConfirmOpen = false;
  }

  confirmResumeDelete(): void {
    if (!this.currentResume || this.isResumeBusy) {
      return;
    }

    this.isResumeDeleting = true;
    this.resumeUploadError = '';

    this.resumeService.deleteCurrentResume().subscribe({
      next: () => {
        this.isResumeDeleting = false;
        this.isResumeDeleteConfirmOpen = false;
        this.currentResume = null;
        this.showResumeUploadArea = true;
        this.removeSelectedResume();
        this.resumeService.notifyResumeChanged(null);
        this.toastr.success('CV deleted successfully.');
      },
      error: (error: HttpErrorResponse) => {
        this.isResumeDeleting = false;
        this.isResumeDeleteConfirmOpen = false;
        this.resumeUploadError =
          this.extractErrorMessage(error) || 'CV could not be deleted.';
      },
    });
  }

  viewCurrentResume(): void {
    if (!this.currentResume || this.isResumeBusy) {
      return;
    }

    this.resumeService.getResumeFileBlob().subscribe({
      next: (blob) => {
        this.revokeResumePreviewUrl();
        this.resumePreviewObjectUrl = URL.createObjectURL(blob);
        window.open(this.resumePreviewObjectUrl, '_blank', 'noopener,noreferrer');
      },
      error: () => {
        this.resumeUploadError = 'CV could not be opened.';
      },
    });
  }

  closeResumeUploadModal(): void {
    if (this.isResumeBusy) {
      return;
    }

    this.isResumeUploadModalOpen = false;
    this.isResumeDeleteConfirmOpen = false;
    this.selectedResumeFile = null;
    this.resumeUploadError = '';
    this.resumeLoadError = '';
    this.isResumeUploading = false;
    this.isResumeDeleting = false;
    this.showResumeUploadArea = false;
    this.setBodyScrollLocked(false);
    this.revokeResumePreviewUrl();
    this.restoreFocusToUploadButton();
  }

  removeSelectedResume(): void {
    this.selectedResumeFile = null;
    this.resumeUploadError = '';

    const fileInput = document.getElementById(
      'resumeFile'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  cancelResumeReplacement(): void {
    if (this.isResumeBusy) {
      return;
    }

    this.showResumeUploadArea = false;
    this.removeSelectedResume();
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/auth/login']);
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const message = error?.error?.message;

    if (Array.isArray(message)) {
      return message[0] || '';
    }

    if (typeof message === 'string') {
      return message;
    }

    return '';
  }

  private setBodyScrollLocked(locked: boolean): void {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  private restoreFocusToUploadButton(): void {
    queueMicrotask(() => {
      if (this.resumeModalTrigger === 'mobile') {
        this.mobileUploadCvButton?.nativeElement.focus();
      } else {
        this.desktopUploadCvButton?.nativeElement.focus();
      }
    });
  }

  private revokeResumePreviewUrl(): void {
    if (this.resumePreviewObjectUrl) {
      URL.revokeObjectURL(this.resumePreviewObjectUrl);
      this.resumePreviewObjectUrl = null;
    }
  }
}
