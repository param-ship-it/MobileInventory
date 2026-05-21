import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeviceListPage } from './device-list.page';

const routes: Routes = [
  {
    path: '',
    component: DeviceListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeviceListPageRoutingModule {}
