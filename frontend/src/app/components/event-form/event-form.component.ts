import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-event-form',
  standalone: true,
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
  ],
})
export class EventFormComponent {
  eventForm: FormGroup;
  message = '';
  isEditMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', event?: any, preselectedDate?: string },
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<EventFormComponent>
  ) {
    this.isEditMode = data.mode === 'edit';

    const start = this.getInitialStart();
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 90);

    this.eventForm = this.fb.group({
      title: [data.event?.title || '', Validators.required],
      dateStart: [this.formatDate(data.event?.dateStart || start), Validators.required],
      dateEnd: [this.formatDate(data.event?.dateEnd || end), Validators.required],
      maxParticipants: [data.event?.maxParticipants || 10, Validators.required],
      level: [data.event?.level || 'debutant', Validators.required],
      location: [data.event?.location || 'Cap 3000', Validators.required],
    });
  }

  private getInitialStart(): Date {
    if (this.data?.preselectedDate) {
      const date = new Date(this.data.preselectedDate);
      date.setHours(18, 0, 0, 0);
      return date;
    }

    const now = new Date();
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  }

  private formatDate(date: string | Date): string {
    return new Date(date).toISOString().slice(0, 16); // format input[type="datetime-local"]
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    const eventData = this.eventForm.value;

    if (this.isEditMode && this.data.event?._id) {
      this.api.updateEvent(this.data.event._id, eventData).subscribe({
        next: () => {
          this.message = '✅ Événement mis à jour';
          this.dialogRef.close({ updated: true });
        },
        error: () => this.message = '❌ Erreur lors de la mise à jour',
      });
    } else {
      this.api.createEvent(eventData).subscribe({
        next: () => {
          this.message = '✅ Événement créé avec succès';
          this.dialogRef.close('created');
        },
        error: () => this.message = '❌ Erreur lors de la création',
      });
    }
  }
}
