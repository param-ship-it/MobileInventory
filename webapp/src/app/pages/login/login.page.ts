import { Component, OnInit, NgZone } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline, phonePortraitOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonSpinner]
})
export class LoginPage implements OnInit {
  form = this.fb.group({
    username: ['admin', Validators.required],
    password: ['Admin@123', Validators.required]
  });
  loading = false;
  errorMsg = '';
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    addIcons({ personOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline, phonePortraitOutline });
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.ngZone.run(() => this.router.navigate(['/dashboard']));
    }
  }

  login() {
    if (this.form.invalid) return;
    
    // Remove focus from the button before disabling it to prevent focus hangs
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.loading = true;
    this.errorMsg = '';
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => this.ngZone.run(() => this.router.navigate(['/dashboard'])),
      error: (e) => { this.errorMsg = e.error?.error || 'Login failed'; this.loading = false; }
    });
  }
}
