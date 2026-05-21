import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon,
  IonContent, IonSpinner, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { ReportService } from '../../services/report';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TitleCasePipe, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon,
    IonContent, IonSpinner, IonSelect, IonSelectOption
  ]
})
export class ReportsPage implements OnInit {
  summary: any = null;
  agingDevices: any[] = [];
  byProgram: any[] = [];
  agingDays = 30;
  agingLoading = false;

  statusRows = [
    { key: 'AVAILABLE', label: 'Available', color: '#10b981' },
    { key: 'ASSIGNED', label: 'Assigned', color: '#7c3aed' },
    { key: 'IN_REPAIR', label: 'In Repair', color: '#f59e0b' },
    { key: 'LOST', label: 'Lost', color: '#ef4444' },
    { key: 'RETIRED', label: 'Retired', color: '#6b7280' },
  ];

  constructor(private reportSvc: ReportService) { addIcons({ checkmarkCircleOutline }); }

  ngOnInit() {
    this.reportSvc.getSummary().subscribe(r => this.summary = r);
    this.loadAging();
    this.reportSvc.getByProgram().subscribe(r => this.byProgram = r.data);
  }

  loadAging() {
    this.agingLoading = true;
    this.reportSvc.getAgingReport(this.agingDays).subscribe({
      next: r => { this.agingDevices = r.data; this.agingLoading = false; },
      error: () => { this.agingLoading = false; }
    });
  }

  getPercent(key: string): number {
    if (!this.summary?.totals?.TOTAL) return 0;
    return Math.round(((this.summary.totals[key] || 0) / this.summary.totals.TOTAL) * 100);
  }
}
