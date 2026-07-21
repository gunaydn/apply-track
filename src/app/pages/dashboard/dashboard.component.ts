import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Application, ApplicationStatus } from 'src/app/models/job-application';
import { ApplicationService } from 'src/app/services/application.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Resume, ResumeService } from 'src/app/services/resume.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  applications: Application[] = [];

  statusChartGradient = '';

  showNotificationPrompt = false;
  isEnablingNotifications = false;

  totalApplications = 0;
  appliedCount = 0;
  interviewCount = 0;
  offerCount = 0;
  rejectedCount = 0;
  savedCount = 0;

  interviewRate = 0;
  offerRate = 0;
  rejectionRate = 0;

  pendingFollowUps: Application[] = [];
  overdueFollowUps: Application[] = [];
  todayFollowUps: Application[] = [];
  upcomingFollowUps: Application[] = [];
  nextFollowUp: Application | null = null;

  statusOverview: {
    label: ApplicationStatus;
    count: number;
    percentage: number;
    barClass: string;
    textClass: string;
  }[] = [];

  currentResume: Resume | null = null;
  isResumeStatusLoading = false;

  private resumeSubscription?: Subscription;

  constructor(
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private resumeService: ResumeService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadResumeStatus();
    this.checkNotificationPrompt();

    this.resumeSubscription = this.resumeService.resumeChanged$.subscribe(
      (resume) => {
        this.currentResume = resume;
      }
    );
  }

  ngOnDestroy(): void {
    this.resumeSubscription?.unsubscribe();
  }

  loadResumeStatus(): void {
    this.isResumeStatusLoading = true;

    this.resumeService.getCurrentResume().subscribe({
      next: (resume) => {
        this.currentResume = resume;
        this.isResumeStatusLoading = false;
      },
      error: () => {
        this.currentResume = null;
        this.isResumeStatusLoading = false;
      },
    });
  }

  openResumeManager(): void {
    this.resumeService.requestOpenModal();
  }

  loadDashboardData(): void {
    this.applicationService.getApplications().subscribe({
      next: (data) => {
        this.applications = data;

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

        this.loadFollowUpData();
      },
      error: (err) => {
        console.error('Dashboard data could not be loaded', err);
      },
    });
  }

  loadFollowUpData(): void {
    const today = this.getDateOnly(new Date());

    const activeFollowUps = this.applications
      .filter((app) => app.followUpDate && !app.followUpCompleted)
      .sort(
        (a, b) =>
          new Date(a.followUpDate!).getTime() -
          new Date(b.followUpDate!).getTime()
      );

    this.pendingFollowUps = activeFollowUps;

    this.overdueFollowUps = activeFollowUps.filter((app) => {
      const followUpDate = this.getDateOnly(new Date(app.followUpDate!));
      return followUpDate < today;
    });

    this.todayFollowUps = activeFollowUps.filter((app) => {
      const followUpDate = this.getDateOnly(new Date(app.followUpDate!));
      return followUpDate.getTime() === today.getTime();
    });

    this.upcomingFollowUps = activeFollowUps.filter((app) => {
      const followUpDate = this.getDateOnly(new Date(app.followUpDate!));
      return followUpDate > today;
    });

    this.nextFollowUp = activeFollowUps[0] || null;
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

  getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  getFollowUpLabel(app: Application): string {
    if (!app.followUpDate) {
      return '';
    }

    const today = this.getDateOnly(new Date());
    const followUpDate = this.getDateOnly(new Date(app.followUpDate));

    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${
        Math.abs(diffDays) > 1 ? 's' : ''
      } overdue`;
    }

    if (diffDays === 0) {
      return 'Due today';
    }

    if (diffDays === 1) {
      return 'Tomorrow';
    }

    return `In ${diffDays} days`;
  }

  getFollowUpStatusClass(app: Application): string {
    if (!app.followUpDate) {
      return 'bg-slate-100 text-slate-600';
    }

    const today = this.getDateOnly(new Date());
    const followUpDate = this.getDateOnly(new Date(app.followUpDate));

    if (followUpDate < today) {
      return 'bg-red-100 text-red-700';
    }

    if (followUpDate.getTime() === today.getTime()) {
      return 'bg-amber-100 text-amber-700';
    }

    return 'bg-blue-100 text-blue-700';
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

  get recentApplications(): Application[] {
    return this.applications.slice(0, 5);
  }

  get compactRecentApplications(): Application[] {
    return this.applications.slice(0, 3);
  }

  checkNotificationPrompt(): void {
    setTimeout(() => {
      console.log('Prompt status:', this.notificationService.getPromptStatus());
      console.log('Browser permission:', Notification.permission);

      this.showNotificationPrompt =
        this.notificationService.shouldShowNotificationPrompt();

      console.log('Show popup:', this.showNotificationPrompt);
    }, 800);
  }

  async enableReminders(): Promise<void> {
    this.isEnablingNotifications = true;

    const success =
      await this.notificationService.requestPermissionAndRegisterToken();

    this.isEnablingNotifications = false;

    if (success) {
      this.showNotificationPrompt = false;
    }
  }

  declineNotificationPrompt(): void {
    this.notificationService.markPromptDeclined();
    this.showNotificationPrompt = false;
  }
}
