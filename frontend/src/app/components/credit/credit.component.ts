import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ApiService } from '../../services/api.service';
import { UserService, User } from '../../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-credit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss']
})
export class CreditComponent implements OnInit {
  creditOptions = [5, 10, 20];
  selected = 10;
  message = '';
  user: User | null = null;

  constructor(
    private api: ApiService,
    private dialogRef: MatDialogRef<CreditComponent>,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  addCredits() {
    if (!this.user) return;

    this.api.addCredits(this.user._id, this.selected).subscribe({
      next: (updatedUser: User) => {
        this.userService.updateUser(updatedUser);
        
        this.message = `✅ ${this.selected} crédits ajoutés !`;
         this.dialogRef.close(true);
      },
      error: () => {
        this.message = '❌ Erreur lors de l’ajout de crédits.';
      }
    });
  }
}
