import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';

type NotificationPromptStatus = 'accepted' | 'declined';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private firebaseApp = initializeApp(environment.firebase);
  private apiUrl = `${environment.apiUrl}/notifications`;
  private promptStorageKey = 'applytrack_notification_prompt_status';

  constructor(private http: HttpClient) {}

  shouldShowNotificationPrompt(): boolean {
    const promptStatus = localStorage.getItem(this.promptStorageKey);

    return !promptStatus && Notification.permission === 'default';
  }

  markPromptAccepted(): void {
    localStorage.setItem(this.promptStorageKey, 'accepted');
  }

  markPromptDeclined(): void {
    localStorage.setItem(this.promptStorageKey, 'declined');
  }

  getPromptStatus(): NotificationPromptStatus | null {
    return localStorage.getItem(
      this.promptStorageKey
    ) as NotificationPromptStatus | null;
  }

  async requestPermissionAndRegisterToken(): Promise<boolean> {
    try {
      const supported = await isSupported();
      console.log('FCM supported:', supported);

      if (!supported) {
        console.warn('Firebase messaging is not supported in this browser.');
        return false;
      }

      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported.');
        return false;
      }

      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);

      if (permission !== 'granted') {
        console.warn('Notification permission was not granted.');
        return false;
      }

      const registration = await this.getMessagingServiceWorkerRegistration();

      console.log('Active service worker registration:', registration);

      const messaging = getMessaging(this.firebaseApp);

      const token = await getToken(messaging, {
        vapidKey: environment.firebase.vapidKey,
        serviceWorkerRegistration: registration,
      });

      console.log('FCM token:', token);

      if (!token) {
        console.warn('FCM token could not be generated.');
        return false;
      }

      await firstValueFrom(
        this.http.post(`${this.apiUrl}/register-token`, {
          token,
          platform: 'web',
        })
      );

      console.log('Notification token registered successfully.');

      this.markPromptAccepted();

      return true;
    } catch (error) {
      console.error('FCM registration error:', error);
      return false;
    }
  }

  /**
   * Prefer the PWA worker registered by Angular (prod).
   * Fall back to registering the FCM worker directly (dev / first visit).
   */
  private async getMessagingServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
    const existing = await navigator.serviceWorker.getRegistration('/');

    if (existing?.active) {
      return existing;
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );

    await this.waitForServiceWorkerActivation(registration);

    return registration;
  }

  private waitForServiceWorkerActivation(
    registration: ServiceWorkerRegistration
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (registration.active) {
        resolve();
        return;
      }

      const worker = registration.installing || registration.waiting;

      if (!worker) {
        reject('No service worker found.');
        return;
      }

      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') {
          resolve();
        }
      });
    });
  }
}
