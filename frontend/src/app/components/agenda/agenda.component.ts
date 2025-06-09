import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss'],
})
export class AgendaComponent implements OnChanges {
  @Input() events: any[] = [];
  @Output() dateSelected = new EventEmitter<string>(); // ou Date selon ton besoin

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: [],
    height: 'auto',
    nowIndicator: true,
    eventClick: (info) => {
      this.openEventDialog(info.event.extendedProps);
    },
    dateClick: (info) => {
      this.dateSelected.emit(info.dateStr);
      this.handleDateSelect.bind(this)
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '21:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  };
  selectedDate: string | null = null;
selectedSlot: { startStr: string, endStr: string } | null = null;

  constructor(private api: ApiService, private dialog: MatDialog) {}

  ngOnChanges() {
    this.loadEvents(this.events);
  }

  handleDateSelect(selection: any) {
  this.selectedSlot = {
    startStr: selection.startStr,
    endStr: selection.endStr
  };
   this.calendarOptions.events = [
    ...this.events.map(e => this.transformEvent(e)),
    {
      title: '🆕 Créneau sélectionné',
      start: this.selectedSlot.startStr,
      end: this.selectedSlot.endStr,
      display: 'background',
      backgroundColor: '#C8E6C9',
      borderColor: '#388E3C',
      textColor: '#000',
      editable: false
    }
  ];
}

transformEvent(e: any) {
  const registered = e.registeredUsers?.length || 0;
  const max = e.maxParticipants;
  const isFull = registered >= max;

  const levelLabel = e.level === 'debutant'
    ? '🟢 Débutant'
    : e.level === 'intermediaire'
      ? '🟡 Intermédiaire'
      : '🔴 Avancé';

  const locationLabel = e.location === 'Cap 3000'
    ? '🏖 Cap 3000'
    : e.location === 'Cagnes CLJ'
      ? '🌊 Cagnes CLJ'
      : '🏐 Ponchettes';

  return {
    title: `[${levelLabel}] ${e.title}\n${locationLabel} – ${isFull ? '⚠️ Complet' : `${registered}/${max}`}`,
    start: e.date,
    extendedProps: e,
    classNames: [
      `level-${e.level}`,
      `location-${e.location}`,
      isFull ? 'event-full' : 'event-available'
    ]
  };
}


  loadEvents(eventsData?: any[]) {
    const source = eventsData ?? this.events;
    this.calendarOptions.events = source.map((e) => {
      const registered = e.registeredUsers?.length || 0;
      const max = e.maxParticipants;
      const isFull = registered >= max;

      const levelLabel =
        e.level === 'debutant'
          ? '🟢 Débutant'
          : e.level === 'intermediaire'
          ? '🟡 Intermédiaire'
          : '🔴 Avancé';

      const locationLabel =
        e.location === 'Cap 3000'
          ? '🏖 Cap 3000'
          : e.location === 'Cagnes CLJ'
          ? '🌊 Cagnes CLJ'
          : '🏐 Ponchettes';

      return {
        title: `[${levelLabel}] ${e.title}\n${locationLabel} – ${
          isFull ? '⚠️ Complet' : `${registered}/${max}`
        }`,
        start: e.date,
        extendedProps: e,
        classNames: [
          `level-${e.level}`,
          `location-${e.location}`,
          isFull ? 'event-full' : 'event-available',
        ],
      };
    });
  }

  openEventDialog(eventData: any) {
    const dialogRef = this.dialog.open(EventDialogComponent, {
       width: '300px',
      data: eventData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.deleted || result?.joined || result?.modified || result?.updated ) {
        this.api.getEvents().subscribe((events) => {
          this.loadEvents(events);
        });
      }
    });
  }

  addHours(dateStr: string, hours: number): string {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + hours);
    return date.toISOString();
  }
}
