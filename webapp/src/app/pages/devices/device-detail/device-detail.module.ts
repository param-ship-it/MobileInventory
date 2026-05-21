import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeviceDetailPageRoutingModule } from './device-detail-routing.module';
import { DeviceDetailPage } from './device-detail.page';
import { SharedPipesModule } from '../../../pipes/shared-pipes.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DeviceDetailPageRoutingModule, SharedPipesModule],
  declarations: [DeviceDetailPage]
})
export class DeviceDetailPageModule {}
