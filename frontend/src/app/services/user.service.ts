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
  
reloadUserFromStorage() {
  const user = this.loadFromLocalStorage();
  this.userSubject.next(user);
}

private loadFromLocalStorage(): User | null {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);

  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        _id: payload.id,
        email: payload.email,
        role: payload.role,
        status: 'active', // On suppose qu’un token valide implique un utilisateur actif
      };
    } catch (e) {
      console.error('Erreur de décodage du token :', e);
      return null;
    }
  }

  return null;
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
