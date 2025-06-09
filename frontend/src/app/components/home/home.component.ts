import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgendaComponent } from '../agenda/agenda.component';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventFormComponent } from '../event-form/event-form.component';
import { CreditComponent } from '../credit/credit.component';
import { ApiService } from '../../services/api.service';
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AgendaComponent, MatCard, RouterModule, MatSnackBarModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  events: any[] = [];
  isAdmin: boolean = false;
  selectedDate: string | null = null;

  constructor(
    public router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.userService.user$.subscribe((user) => {
      this.user = user;
      this.isAdmin = user?.role === 'admin';
    });
  }

  cloneLastWeek() {
    this.api.cloneLastWeek().subscribe({
      next: (res) => {
        this.snackBar.open('✅ Clonage réussi !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.loadEvents();
      },
      error: (err) => {
        this.snackBar.open('❌ Erreur lors du clonage', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  loadEvents() {
    this.api.getEvents().subscribe((events) => {
      this.events = events;
    });
  }

  openEventCreationDialog(): void {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '600px',
      data: { mode: 'create', preselectedDate: this.selectedDate },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created') {
        this.snackBar.open('✅ Événement créé !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.loadEvents();
      }
    });
  }

  openCreditDialog() {
    this.dialog
      .open(CreditComponent, { width: '600px' })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'success') {
          this.snackBar.open('✅ Crédits ajoutés !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        }
      });
  }

  onDateSelected(date: string) {
    this.selectedDate = date;
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
