import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../services/api.service';
import { UserService, User } from '../../services/user.service';
import { EventFormComponent } from '../event-form/event-form.component';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatIcon,
    MatSnackBarModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss'],
})
export class EventDialogComponent implements OnInit {
  user: User | null = null;
  message = '';
  event: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService,
    private dialogRef: MatDialogRef<EventDialogComponent>,
    private dialog: MatDialog,
    private userService: UserService,
     private snackBar: MatSnackBar 
  ) {
    this.event = structuredClone(data);
  }

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  joinEvent() {
    if (!this.user) return;

    this.api.joinEvent(this.event._id, this.user._id ).subscribe({
      next: (res) => {
        this.snackBar.open('✅ Inscription réussie !', 'Fermer', { duration: 3000 });
        this.event.registeredUsers = res.event.registeredUsers;
        this.userService.updateUser(res.user); // met à jour les crédits
        this.dialogRef.close({ modified: true }); // ferme et signale qu'une maj est nécessaire
      },
      error: (err) => {
      this.snackBar.open('❌ ' + err.error.error, 'Fermer', { duration: 3000 });
      },
    });
  }

  canJoin(): boolean {
    return (
      this.user !== null &&
      this.event.registeredUsers?.length < this.event.maxParticipants &&
      !this.event.registeredUsers?.some((u: any) => u._id === this.user?._id)
    );
  }

  isRegistered(): boolean {
    return this.event.registeredUsers?.some(
      (u: any) => u._id === this.user?._id
    );
  }

  openEditDialog() {
    const editDialogRef = this.dialog.open(EventFormComponent, {
  width: '600px',
  data: { mode: 'edit', event: this.event },
});

editDialogRef.afterClosed().subscribe((result) => {
  if (result?.updated) {
    this.dialogRef.close({updated:true} ); // <== ça fera remonter l'info jusqu'à AgendaComponent
  }
});

    
  }
  leaveEvent() {
    if (!this.user) return;
    this.api.unregisterFromEvent(this.event._id, this.user._id).subscribe({
      next: (res) => {
        this.snackBar.open('⛔ Désinscription réussie !', 'Fermer', { duration: 3000 });
        this.event.registeredUsers = res.event.registeredUsers;
        this.userService.updateUser(res.user); // met à jour les crédits
        this.dialogRef.close({ modified: true }); // ferme et signale qu'une maj est nécessaire
      },
      error: (err) => {
      this.snackBar.open('❌ ' + err.error.error, 'Fermer', { duration: 3000 });
      },
    });
  }

  deleteEvent() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    this.api.deleteEvent(this.event._id).subscribe({
      next: () => {
        this.message = '✅ Événement supprimé.';
        this.dialogRef.close({ deleted: true });
      },
      error: () => {
        this.message = '❌ Erreur lors de la suppression.';
      },
    });
  }
}
