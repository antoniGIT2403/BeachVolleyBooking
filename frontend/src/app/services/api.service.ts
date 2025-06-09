import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  register(
    email: string,
    password: string,
    prenom: string,
    nom: string
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, {
      email,
      password,
      prenom,
      nom,
    });
  }

  getEventById(eventId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/${eventId}`);
  }
  login(email: string, password: string): Observable<any> {
    // À implémenter côté backend plus tard
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }
  cloneLastWeek(): Observable<any> {
    return this.http.post(`${this.baseUrl}/events/clone-last-week`, {});
  }

  getPendingUsers() {
    return this.http.get<User[]>(`${this.baseUrl}/users/pending`);
  }

 approveUser(id: string) {
  return this.http.patch(`${this.baseUrl}/users/${id}/approve`, {});
}
updateEvent(id: string, data: any) {
  return this.http.put(`${this.baseUrl}/events/${id}`, data);
}

  rejectUser(id: string) {
    return this.http.patch(`${this.baseUrl}/users/${id}/reject`, {});
  }

  // Events
  createEvent(event: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/events`, event);
  }

  joinEvent(eventId: string, userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/events/${eventId}/register`, {
      userId,
    });
  }

  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/events`);
  }

  addCredits(userId: string, amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/credits`, {
      amount,
    });
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/events/${eventId}`);
  }
  unregisterFromEvent(eventId: string, userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/events/${eventId}/unregister`, {
      userId,
    });
  }
}
