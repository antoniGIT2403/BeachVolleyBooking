import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule ], // <== ICI : ReactiveFormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  message = '';


  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private snackBar: MatSnackBar , private userService: UserService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
      // Redirection automatique si déjà connecté
  const user = localStorage.getItem('user');
  if (user) {
    this.router.navigate(['/home']);
  }

  }

onSubmit() {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;

    this.api.login(email, password).subscribe({
      next: (data: any) => {
        if (data.user.status === 'pending') {
          this.snackBar.open('⏳ Compte en attente de validation', 'OK', {
            duration: 4000,
            panelClass: 'snackbar-warning',
          });
          this.router.navigate(['/pending']);
        } else if (data.user.status === 'active') {
          localStorage.setItem('user', JSON.stringify(data.user));
          this.userService.updateUser(data.user);
          this.snackBar.open('✅ Connexion réussie !', 'OK', {
            duration: 3000,
            panelClass: 'snackbar-success',
          });
          this.router.navigate(['/home']);
        } else {
          this.snackBar.open('❌ Compte inactif ou refusé', 'Fermer', {
            duration: 4000,
            panelClass: 'snackbar-error',
          });
        }
      },
      error: (err) => {
        const msg = err.error?.error || 'Erreur inconnue';
        this.snackBar.open(`❌ Connexion échouée : ${msg}`, 'Fermer', {
          duration: 5000,
          panelClass: 'snackbar-error',
        });
      }
    });
  }
}

}
