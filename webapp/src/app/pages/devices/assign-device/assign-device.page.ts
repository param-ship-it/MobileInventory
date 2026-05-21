import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon,
  IonContent, IonButton, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, businessOutline, folderOutline, checkmarkOutline, alertCircleOutline, checkmarkCircle, closeOutline } from 'ionicons/icons';
import { DeviceService } from '../../../services/device';

@Component({
  selector: 'app-assign-device',
  templateUrl: './assign-device.page.html',
  styleUrls: ['./assign-device.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon,
    IonContent, IonButton, IonSpinner
  ]
})
export class AssignDevicePage implements OnInit {
  device: any = null;
  programs: any[] = [];
  projects: any[] = [];
  userResults: any[] = [];
  selectedUser: any = null;
  userSearch = '';
  saving = false;
  errorMsg = '';
  deviceId = '';

  form = this.fb.group({
    assignmentType: ['INDIVIDUAL', Validators.required],
    assignedToName: [''],
    programId: [''],
    projectId: [''],
    expectedReturn: [''],
    notes: ['']
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private deviceSvc: DeviceService,
    private toast: ToastController,
    private ngZone: NgZone
  ) {
    addIcons({ personOutline, businessOutline, folderOutline, checkmarkOutline, alertCircleOutline, checkmarkCircle, closeOutline });
  }

  ngOnInit() {
    this.deviceId = this.route.snapshot.paramMap.get('id')!;
    this.deviceSvc.getDevice(this.deviceId).subscribe(res => this.device = res.device);
    this.deviceSvc.getPrograms().subscribe(res => this.programs = res.data);
  }

  setType(t: string) { this.form.patchValue({ assignmentType: t }); }

  searchUsers() {
    if (this.userSearch.length < 2) { this.userResults = []; return; }
    this.deviceSvc.searchUsers(this.userSearch).subscribe(res => this.userResults = res.data);
  }

  selectUser(u: any) { this.selectedUser = u; this.userResults = []; this.userSearch = ''; }
  clearUser() { this.selectedUser = null; }

  onProgramChange(e: any) {
    const id = e.target.value;
    if (id) this.deviceSvc.getProjects(id).subscribe(res => this.projects = res.data);
  }

  async submit() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.saving = true; this.errorMsg = '';
    const payload = {
      deviceId: this.deviceId, ...this.form.value,
      assignedToUser: this.selectedUser?.USER_ID || null,
      assignedToName: this.selectedUser?.FULL_NAME || this.form.value.assignedToName
    };
    this.deviceSvc.assignDevice(payload).subscribe({
      next: async () => {
        const t = await this.toast.create({ message: '✅ Device assigned!', duration: 2500, color: 'success' });
        t.present();
        this.ngZone.run(() => this.router.navigate(['/devices', this.deviceId]));
      },
      error: (e) => { this.errorMsg = e.error?.error || 'Assignment failed'; this.saving = false; }
    });
  }
}
