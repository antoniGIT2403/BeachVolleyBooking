import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatSelectModule  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  message = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
   this.registerForm = this.fb.group({
  prenom: ['', Validators.required],
  nom: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  password: ['', Validators.required],
  sexe: ['homme', Validators.required],
  niveau: ['débutant', Validators.required]
});

  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password, prenom, nom } = this.registerForm.value;
  
      this.apiService.register(email, password, prenom, nom).subscribe({
        next: res => {
          this.message = 'Inscription réussie 🎉';
          setTimeout(() => this.router.navigate(['/home']), 1000);
        },
        error: err => {
          this.message = 'Erreur lors de l’inscription 😢';
        }
      });
    }
  }
  
}
