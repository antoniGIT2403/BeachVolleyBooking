import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="pending"><h2>⏳ En attente de validation</h2><p>Un administrateur validera votre compte prochainement.</p></div>`,
  styles: [`.pending { text-align: center; padding: 2rem; max-width: 500px; margin: auto; }`]
})
export class PendingComponent {}
