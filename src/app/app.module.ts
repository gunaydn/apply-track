import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { ApplicationFormComponent } from './pages/application-form/application-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplicationDetailComponent } from './pages/application-detail/application-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ApplicationsComponent,
    ApplicationFormComponent,
    ApplicationDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 2200,
      closeButton: false,
      progressBar: true,
      preventDuplicates: true,
      maxOpened: 1,
      autoDismiss: true,
    }),
    ServiceWorkerModule.register('firebase-messaging-sw.js', {
      enabled: !isDevMode(),
      // Combined worker: Angular ngsw (offline/PWA) + Firebase messaging.
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
