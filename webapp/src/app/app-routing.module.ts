import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'dashboard', canActivate: [AuthGuard], loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule) },
  { path: 'devices', canActivate: [AuthGuard], loadChildren: () => import('./pages/devices/device-list/device-list.module').then(m => m.DeviceListPageModule) },
  { path: 'devices/add', canActivate: [AuthGuard], loadChildren: () => import('./pages/devices/add-device/add-device.module').then(m => m.AddDevicePageModule) },
  { path: 'devices/:id', canActivate: [AuthGuard], loadChildren: () => import('./pages/devices/device-detail/device-detail.module').then(m => m.DeviceDetailPageModule) },
  { path: 'devices/:id/assign', canActivate: [AuthGuard], loadChildren: () => import('./pages/devices/assign-device/assign-device.module').then(m => m.AssignDevicePageModule) },
  { path: 'scan', canActivate: [AuthGuard], loadChildren: () => import('./pages/scan/scan.module').then(m => m.ScanPageModule) },
  { path: 'reports', canActivate: [AuthGuard], loadChildren: () => import('./pages/reports/reports.module').then(m => m.ReportsPageModule) },
  { path: 'users', canActivate: [AuthGuard], loadChildren: () => import('./pages/users/users.module').then(m => m.UsersPageModule) },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
