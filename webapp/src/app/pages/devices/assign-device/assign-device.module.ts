import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AssignDevicePageRoutingModule } from './assign-device-routing.module';
import { AssignDevicePage } from './assign-device.page';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, AssignDevicePageRoutingModule],
  declarations: [AssignDevicePage]
})
export class AssignDevicePageModule {}
