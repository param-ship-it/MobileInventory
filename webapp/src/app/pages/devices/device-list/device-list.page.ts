import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
  IonContent, IonSearchbar, IonChip, IonLabel, IonInfiniteScroll, IonInfiniteScrollContent,
  IonFab, IonFabButton, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, chevronForwardOutline } from 'ionicons/icons';
import { DeviceService } from '../../../services/device';
import { ReplacePipe } from '../../../pipes/replace.pipe';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.page.html',
  styleUrls: ['./device-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TitleCasePipe, DatePipe, ReplacePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
    IonContent, IonSearchbar, IonChip, IonLabel, IonInfiniteScroll, IonInfiniteScrollContent,
    IonFab, IonFabButton, IonSpinner
  ]
})
export class DeviceListPage implements OnInit {
  devices: any[] = [];
  total = 0;
  page = 1;
  limit = 20;
  loading = true;
  searchQuery = '';
  activeFilter: string | null = null;

  constructor(private deviceSvc: DeviceService, private router: Router, private route: ActivatedRoute) {
    addIcons({ addOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['status']) this.activeFilter = p['status'];
      this.loadDevices(true);
    });
  }

  loadDevices(reset = false) {
    if (reset) { this.page = 1; this.devices = []; }
    this.loading = reset;
    this.deviceSvc.getDevices({ search: this.searchQuery, status: this.activeFilter, page: this.page, limit: this.limit }).subscribe({
      next: (res) => { this.devices = [...this.devices, ...res.data]; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch() { this.loadDevices(true); }
  setFilter(f: string | null) { this.activeFilter = f; this.loadDevices(true); }

  loadMore(event: any) {
    this.page++;
    this.deviceSvc.getDevices({ search: this.searchQuery, status: this.activeFilter, page: this.page, limit: this.limit }).subscribe({
      next: (res) => { this.devices = [...this.devices, ...res.data]; event.target.complete(); },
      error: () => event.target.complete()
    });
  }

  nav(path: string) { this.router.navigate([path]); }

  getMakeEmoji(make: string): string {
    const map: any = { apple: '🍎', samsung: '📱', google: '🔵', xiaomi: '📲', oneplus: '🔴', lg: '📟', motorola: '📡', huawei: '🔶' };
    return map[make?.toLowerCase()] || '📱';
  }

  formatStatus(status: string): string {
    const map: any = { AVAILABLE: 'Available', ASSIGNED: 'Assigned', IN_REPAIR: 'In Repair', LOST: 'Lost', STOLEN: 'Stolen', RETIRED: 'Retired' };
    return map[status] || status;
  }
}
