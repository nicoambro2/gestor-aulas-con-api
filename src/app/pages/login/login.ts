import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/service/auth-service';
import { LoginRequest } from '../../auth/models/LoginRequest';
import { UsuarioService } from '../../services/usuario-service/usuario-service';
import { LoginResponse } from '../../auth/models/loginResponse';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if(this.authService.usuarioLogueado()) {
        this.router.navigateByUrl('/dashboard');
      }
    });
  }

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  mensajeError = signal('');

  Enviar() {
    if (this.form.invalid) { return; }

    const login: LoginRequest = {
      username: this.form.value.email!,
      password: this.form.value.password!
    };

    this.mensajeError.set('');

    this.authService.iniciarSesion(login).subscribe({
      next: (res) => {
        localStorage.setItem("logData", JSON.stringify(res.token));
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.mensajeError.set(err.error.message);
      }
    });

/*
    this.authService.validarCredenciales(this.form.value as LoginRequest).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: (error) => {
        this.mensajeError.set(error.message);
      }
    });
*/
  }

}
