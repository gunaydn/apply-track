import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { ApplicationFormComponent } from './pages/application-form/application-form.component';
import { ApplicationDetailComponent } from './pages/application-detail/application-detail.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'applications',
    component: ApplicationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'applications/new',
    component: ApplicationFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'applications/edit/:id',
    component: ApplicationFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'applications/:id',
    component: ApplicationDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then((m) => m.AuthModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
