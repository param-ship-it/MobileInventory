import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
  { path: 'devices', canActivate: [authGuard], loadComponent: () => import('./pages/devices/device-list/device-list.page').then(m => m.DeviceListPage) },
  { path: 'devices/add', canActivate: [authGuard], loadComponent: () => import('./pages/devices/add-device/add-device.page').then(m => m.AddDevicePage) },
  { path: 'devices/:id', canActivate: [authGuard], loadComponent: () => import('./pages/devices/device-detail/device-detail.page').then(m => m.DeviceDetailPage) },
  { path: 'devices/:id/assign', canActivate: [authGuard], loadComponent: () => import('./pages/devices/assign-device/assign-device.page').then(m => m.AssignDevicePage) },
  { path: 'scan', canActivate: [authGuard], loadComponent: () => import('./pages/scan/scan.page').then(m => m.ScanPage) },
  { path: 'reports', canActivate: [authGuard], loadComponent: () => import('./pages/reports/reports.page').then(m => m.ReportsPage) },
  { path: 'users', canActivate: [authGuard], loadComponent: () => import('./pages/users/users.page').then(m => m.UsersPage) },
  { path: '**', redirectTo: 'dashboard' }
];
