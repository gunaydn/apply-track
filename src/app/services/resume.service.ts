import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Resume {
  _id: string;
  title: string;
  originalFileName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private readonly apiUrl = `${environment.apiUrl}/resumes`;
  private readonly openModalSubject = new Subject<void>();
  private readonly resumeChangedSubject = new Subject<Resume | null>();

  readonly openModalRequests$ = this.openModalSubject.asObservable();
  readonly resumeChanged$ = this.resumeChangedSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  requestOpenModal(): void {
    this.openModalSubject.next();
  }

  notifyResumeChanged(resume: Resume | null): void {
    this.resumeChangedSubject.next(resume);
  }

  getCurrentResume(): Observable<Resume | null> {
    return this.http
      .get<Resume | null>(`${this.apiUrl}/current`)
      .pipe(map((resume) => resume ?? null));
  }

  uploadResume(file: File, title: string): Observable<Resume> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('title', title);

    return this.http.post<Resume>(this.apiUrl, formData);
  }

  deleteCurrentResume(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/current`);
  }

  getResumeFileBlob(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/current/file`, {
      responseType: 'blob',
    });
  }

  getResumeFileUrl(filePath: string): string {
    const base = environment.fileBaseUrl.replace(/\/$/, '');
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${base}${path}`;
  }
}
