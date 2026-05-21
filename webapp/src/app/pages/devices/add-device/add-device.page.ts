import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
  IonContent, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { addIcons } from 'ionicons';
import { scanOutline, checkmarkOutline } from 'ionicons/icons';
import { DeviceService } from '../../../services/device';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.page.html',
  styleUrls: ['./add-device.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ZXingScannerModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
    IonContent, IonSpinner
  ]
})
export class AddDevicePage {
  scannerOpen = false;
  scanTarget: 'imei' | 'serial' = 'imei';
  saving = false;
  errorMsg = '';
  makes = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'LG', 'Motorola', 'Huawei', 'Nokia', 'Sony', 'Other'];

  form = this.fb.group({
    imei: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]],
    serialNumber: [''], make: ['', Validators.required], model: ['', Validators.required],
    color: [''], storage: [''], osType: [''], osVersion: [''],
    purchaseDate: [''], warrantyDate: [''], notes: ['']
  });

  constructor(private fb: FormBuilder, private deviceSvc: DeviceService, private router: Router, private toast: ToastController) {
    addIcons({ scanOutline, checkmarkOutline });
  }

  openScanner(target: 'imei' | 'serial') { this.scanTarget = target; this.scannerOpen = true; }
  closeScanner() { this.scannerOpen = false; }
  onScan(result: string) {
    this.scannerOpen = false;
    if (this.scanTarget === 'imei') this.form.patchValue({ imei: result });
    else this.form.patchValue({ serialNumber: result });
  }

  async submit() {
    if (this.form.invalid) return;
    this.saving = true; this.errorMsg = '';
    this.deviceSvc.createDevice(this.form.value).subscribe({
      next: async () => {
        const t = await this.toast.create({ message: '✅ Device added!', duration: 2500, color: 'success' });
        t.present();
        this.router.navigate(['/devices']);
      },
      error: (e) => { this.errorMsg = e.error?.error || 'Failed to add device'; this.saving = false; }
    });
  }
}
