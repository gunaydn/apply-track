import { Injectable } from '@angular/core';
import { JobApplication } from '../models/job-application';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private storageKey = 'job-applications';

  getApplications(): JobApplication[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getApplicationById(id: string): JobApplication | undefined {
    return this.getApplications().find((app) => app.id === id);
  }

  addApplication(application: Omit<JobApplication, 'id' | 'createdAt'>): void {
    const applications = this.getApplications();

    const newApplication: JobApplication = {
      ...application,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    applications.push(newApplication);
    this.saveApplications(applications);
  }

  updateApplication(
    id: string,
    updatedApplication: Omit<JobApplication, 'id' | 'createdAt'>
  ): void {
    const applications = this.getApplications();

    const updatedApplications = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          ...updatedApplication,
        };
      }

      return app;
    });

    this.saveApplications(updatedApplications);
  }

  deleteApplication(id: string): void {
    const applications = this.getApplications().filter((app) => app.id !== id);
    this.saveApplications(applications);
  }

  private saveApplications(applications: JobApplication[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(applications));
  }
}
