import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
  IonContent, IonSpinner, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon,
    IonContent, IonSpinner
  ]
})
export class UsersPage implements OnInit {
  users: any[] = [];
  loading = true;
  constructor(private http: HttpClient, private alert: AlertController) { addIcons({ personAddOutline }); }
  ngOnInit() { this.loadUsers(); }
  loadUsers() { this.loading = true; this.http.get<any>(`${environment.apiUrl}/users`).subscribe({ next: r => { this.users = r.data; this.loading = false; }, error: () => { this.loading = false; } }); }
  async openAddUser() {
    const a = await this.alert.create({
      header: 'Add User',
      inputs: [
        { name: 'fullName', type: 'text', placeholder: 'Full Name' },
        { name: 'username', type: 'text', placeholder: 'Username' },
        { name: 'email', type: 'email', placeholder: 'Email' },
        { name: 'password', type: 'password', placeholder: 'Password' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Create', handler: (data) => { this.http.post(`${environment.apiUrl}/users`, { ...data, role: 'USER' }).subscribe({ next: () => this.loadUsers() }); } }
      ]
    });
    await a.present();
  }
}
