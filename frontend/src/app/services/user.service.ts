import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  _id: string;
  email: string;
  prenom?: string;
  nom?: string;
  role?: string;
  credits?: number;
  sexe?: string;
  niveau?: string;
  status?: string; // 'active' | 'pending'
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(this.loadFromLocalStorage());
  user$ = this.userSubject.asObservable();

  private loadFromLocalStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  updateUser(user: User) {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser() {
    this.userSubject.next(null);
    localStorage.removeItem('user');
  }
}
