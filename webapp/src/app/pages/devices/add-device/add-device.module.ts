import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AddDevicePageRoutingModule } from './add-device-routing.module';
import { AddDevicePage } from './add-device.page';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, ZXingScannerModule, AddDevicePageRoutingModule],
  declarations: [AddDevicePage]
})
export class AddDevicePageModule {}
