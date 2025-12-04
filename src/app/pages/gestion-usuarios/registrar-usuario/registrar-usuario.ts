import { Component, inject, signal } from '@angular/core';
import { UsuarioService } from '../../../services/usuario-service/usuario-service';
import { AuthService } from '../../../auth/service/auth-service';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioCreateDto } from '../../../models/usuario/usuarioCreateDto';

@Component({
  selector: 'app-registrar-usuario',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registrar-usuario.html',
  styleUrl: './registrar-usuario.css',
})
export class RegistrarUsuario {
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  error = signal('');
  mensajeExito = signal('');

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    passwordConfirmar: ['', [Validators.required]],
    rol: ['', [Validators.required]],
  });

  enviar() {
    if (this.form.invalid) {
      return;
    }

    this.mensajeExito.set('');
    this.error.set('');

    if (!this.auth.validarPassword(this.form.value.password!, this.form.value.passwordConfirmar!)) {
      this.error.set('Repita correctamente la contraseña');
      return;
    }

    this.usuarioService.crear(this.buildUsuario()).subscribe({
      next: () => {
        this.mensajeExito.set('¡Usuario creado exitosamente!');
        this.form.reset();
      },
      error: (err) => {
        this.error.set(err.error);
      }
    })
  }

  private buildUsuario(): UsuarioCreateDto {
    return {
      nombre: this.form.value.nombre!.trim(),
      apellido: this.form.value.apellido!.trim(),
      password: this.form.value.password!,
      rol: this.usuarioService.convertirRol(this.form.value.rol!),
      email: this.form.value.email!.trim(),
    };
  }
}
