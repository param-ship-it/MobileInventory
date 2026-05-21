import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonRefresher, IonRefresherContent, IonSpinner,
  IonTabBar, IonTabButton, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, logOutOutline, grid, phonePortraitOutline,
  scanOutline, barChartOutline, peopleOutline, timeOutline, chevronDownOutline
} from 'ionicons/icons';
import { AuthService, User } from '../../services/auth';
import { ReportService } from '../../services/report';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonRefresher, IonRefresherContent, IonSpinner,
    IonTabBar, IonTabButton, IonLabel
  ]
})
export class DashboardPage implements OnInit {
  user: User | null = null;
  totals: any = {};
  activity: any[] = [];
  makeBreakdown: any[] = [];
  loading = true;
  today = new Date();

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }

  get isAdmin(): boolean { return this.auth.hasRole('ADMIN'); }

  constructor(
    private auth: AuthService,
    private reports: ReportService,
    private router: Router,
    private ngZone: NgZone
  ) {
    addIcons({ notificationsOutline, logOutOutline, grid, phonePortraitOutline, scanOutline, barChartOutline, peopleOutline, timeOutline, chevronDownOutline });
  }

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.reports.getSummary().subscribe({
      next: (data) => {
        this.totals = data.totals;
        this.activity = data.recentActivity || [];
        this.makeBreakdown = data.makeBreakdown || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  doRefresh(event: any) {
    this.reports.getSummary().subscribe({
      next: (data) => {
        this.totals = data.totals;
        this.activity = data.recentActivity || [];
        this.makeBreakdown = data.makeBreakdown || [];
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  nav(path: string, queryParams?: any) {
    this.ngZone.run(() => this.router.navigate([path], { queryParams }));
  }
  logout() { this.auth.logout(); }

  getActivityClass(action: string): string {
    const map: any = { CREATED: 'created', ASSIGNED: 'assigned', RETURNED: 'returned', STATUS_CHANGED: 'status', RETIRED: 'retired' };
    return map[action] || 'status';
  }

  formatAction(action: string): string {
    const map: any = { CREATED: 'added to inventory', ASSIGNED: 'assigned', RETURNED: 'returned', STATUS_CHANGED: 'status changed', RETIRED: 'retired' };
    return map[action] || action;
  }
}
