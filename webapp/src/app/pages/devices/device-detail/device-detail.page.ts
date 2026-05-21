import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
  IonContent, IonSpinner, ActionSheetController, AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisVertical, personAddOutline, createOutline, trashOutline, checkmarkCircle } from 'ionicons/icons';
import { DeviceService } from '../../../services/device';
import { AuthService } from '../../../services/auth';
import { ReplacePipe } from '../../../pipes/replace.pipe';

@Component({
  selector: 'app-device-detail',
  templateUrl: './device-detail.page.html',
  styleUrls: ['./device-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, DatePipe, TitleCasePipe, ReplacePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
    IonContent, IonSpinner
  ]
})
export class DeviceDetailPage implements OnInit {
  device: any = null;
  history: any[] = [];
  assignments: any[] = [];
  loading = true;
  id = '';

  get currentAssignment() { return this.assignments.find(a => a.IS_ACTIVE === 1); }
  get isAdmin() { return this.auth.hasRole('ADMIN', 'MANAGER'); }

  constructor(
    private route: ActivatedRoute, private router: Router,
    private deviceSvc: DeviceService, private auth: AuthService,
    private actionSheet: ActionSheetController, private alert: AlertController, private toast: ToastController,
    private ngZone: NgZone
  ) {
    addIcons({ ellipsisVertical, personAddOutline, createOutline, trashOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.loadDevice();
  }

  loadDevice() {
    this.loading = true;
    this.deviceSvc.getDevice(this.id).subscribe({
      next: (res) => { this.device = res.device; this.history = res.history; this.assignments = res.assignments; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  nav(path: string) {
    this.ngZone.run(() => this.router.navigate([path]));
  }

  async openActions() {
    const sheet = await this.actionSheet.create({
      header: 'Device Actions',
      buttons: [
        { text: 'Assign Device', icon: 'person-add-outline', handler: () => this.nav(`/devices/${this.id}/assign`) },
        { text: 'Retire Device', icon: 'trash-outline', role: 'destructive', handler: () => this.retireDevice() },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await sheet.present();
  }

  async returnDevice() {
    const a = await this.alert.create({
      header: 'Return Device', message: 'Mark this device as returned and available?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Confirm Return', handler: () => {
            if (!this.currentAssignment) return;
            this.deviceSvc.returnDevice(this.currentAssignment.ASSIGNMENT_ID).subscribe({ next: () => this.loadDevice() });
        }}
      ]
    });
    await a.present();
  }

  async retireDevice() {
    const a = await this.alert.create({
      header: 'Retire Device', message: 'This will mark the device as RETIRED. Are you sure?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Retire', role: 'destructive', handler: () => {
            this.deviceSvc.retireDevice(this.id).subscribe({ next: () => this.nav('/devices') });
        }}
      ]
    });
    await a.present();
  }

  getMakeEmoji(make: string): string {
    const map: any = { apple: '🍎', samsung: '📱', google: '🔵', xiaomi: '📲', oneplus: '🔴' };
    return map[make?.toLowerCase()] || '📱';
  }

  formatStatus(s: string) { return s?.replace('_', ' '); }
  getActionClass(a: string) { const m: any = { CREATED: 'created', ASSIGNED: 'assigned', RETURNED: 'returned', STATUS_CHANGED: 'status', RETIRED: 'retired' }; return m[a] || 'status'; }
}
