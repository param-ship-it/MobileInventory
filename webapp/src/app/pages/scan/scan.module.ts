import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScanPageRoutingModule } from './scan-routing.module';
import { ScanPage } from './scan.page';

@NgModule({
  imports: [CommonModule, IonicModule, ZXingScannerModule, ScanPageRoutingModule],
  declarations: [ScanPage]
})
export class ScanPageModule {}
