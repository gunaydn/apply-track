import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { ApplicationFormComponent } from './pages/application-form/application-form.component';
import { ApplicationDetailComponent } from './pages/application-detail/application-detail.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'applications', component: ApplicationsComponent },
  { path: 'applications/new', component: ApplicationFormComponent },
  { path: 'applications/edit/:id', component: ApplicationFormComponent },
  { path: 'applications/:id', component: ApplicationDetailComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
