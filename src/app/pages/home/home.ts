import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../auth/service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router)

  ngOnInit(): void {
    if(this.authService.usuarioLogueado()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

}
