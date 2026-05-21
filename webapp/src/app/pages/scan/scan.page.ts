import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, IonContent, IonButton } from '@ionic/angular/standalone';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, IonContent, IonButton]
})
export class ScanPage {
  result = '';
  permDenied = false;
  constructor(private router: Router, private ngZone: NgZone) { addIcons({ checkmarkCircle }); }
  onResult(r: string) { this.result = r; }
  onPermission(p: boolean) { this.permDenied = !p; }
  useResult() {
    this.ngZone.run(() => this.router.navigate(['/devices/add'], { queryParams: { imei: this.result } }));
  }
}
