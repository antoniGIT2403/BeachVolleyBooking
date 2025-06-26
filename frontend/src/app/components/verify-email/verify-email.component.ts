import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit {
  statusMessage = 'Vérification en cours...';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.api.verifyEmail(token).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token); // ⬅️ Stocker le JWT
          this.statusMessage = '✅ Email vérifié, redirection...';
           localStorage.setItem('user', JSON.stringify(res.user)); 

          setTimeout(() => {
            this.router.navigate(['/home']); // ⬅️ Vers ta page principale
          }, 2000);
        },
        error: () => {
          this.statusMessage = '❌ Le lien est invalide ou expiré.';
        },
      });
    } else {
      this.statusMessage = '❌ Token manquant dans l’URL.';
    }
  }
}
