import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { UserService, User } from './services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User | null = null;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
      
    });
  }

  get isLoggedIn(): boolean {
    return !!this.user;
  }

    get isAdmin(): boolean {
      return this.user?.role === 'admin';
    }

  logout(): void {
    this.userService.clearUser(); // gère le localStorage et le BehaviorSubject
    this.router.navigate(['/login']);
  }
}
