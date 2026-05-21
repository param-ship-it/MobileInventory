import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssignDevicePage } from './assign-device.page';

const routes: Routes = [
  {
    path: '',
    component: AssignDevicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignDevicePageRoutingModule {}
