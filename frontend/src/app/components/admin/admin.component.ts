import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../../services/api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatListModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent  implements OnInit {
  message = '';

  constructor(
    private api: ApiService,
  ) {
  }

users: User[] = [];
pendingUsers: User[] = [];
hasPendingRequests = false;

ngOnInit() {
  this.api.getAllUsers().subscribe((allUsers) => {
    this.users = allUsers.filter(u => u.status === 'active');
    this.pendingUsers = allUsers.filter(u => u.status === 'pending');
    this.hasPendingRequests = this.pendingUsers.length > 0;
  });
}

approve(userId: string) {
  this.api.approveUser(userId).subscribe(() => this.refreshUsers());
}

reject(userId: string) {
  this.api.rejectUser(userId).subscribe(() => this.refreshUsers());
}

refreshUsers() {
  this.api.getAllUsers().subscribe((allUsers) => {
    this.users = allUsers.filter(u => u.status === 'active');
    this.pendingUsers = allUsers.filter(u => u.status === 'pending');
  });
}
}
