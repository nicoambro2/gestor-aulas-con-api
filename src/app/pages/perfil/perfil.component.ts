import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth/service/auth-service';
import { Usuario } from '../../models/usuario/usuario';
import { UsuarioService } from '../../services/usuario-service/usuario-service';
import { UsuarioResponseDto } from '../../models/usuario/usuarioResponseDto';
import { PasswordValidacionDto } from '../../auth/models/passwordValidacionDto';
import { UsuarioUpdateDto } from '../../models/usuario/usuarioUpdateDto';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  usuarioActual = signal<UsuarioResponseDto | null>(null);

  loadingPerfil = false;
  loadingPassword = false;
  mensajePerfil = signal('');
  mensajePassword = signal('');
  errorPerfil = signal('');
  errorPassword = signal('');
  mostrarAlertaEliminar = signal(false);

  formPerfil = this.fb.group({
    nombre: [this.auth.infoUsuario().nombre, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    apellido: [this.auth.infoUsuario().apellido, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: [this.auth.infoUsuario().email, [Validators.required, Validators.email, Validators.maxLength(100)]],
  });

  formPassword = this.fb.group({
    passwordActual: ['', [Validators.required]],
    passwordNuevo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    passwordConfirmar: ['', [Validators.required]],
  });

  ngOnInit() {
    this.getUsuarioActual();
  }

  private getUsuarioActual() {
    this.usuarioService.getUsuarioLogueado().subscribe({
      next: (res) => {
        this.usuarioActual.set(res);
        this.formPerfil.patchValue({
          nombre: res.nombre,
          apellido: res.apellido,
          email: res.email
        });
      },
      error: (err) => {
        this.errorPerfil.set(err.error);
        this.errorPassword.set(err.error);
      },
    });
  }

  enviarDatos() {
    if (this.formPerfil.invalid) {
      return;
    }

    this.loadingPerfil = true;
    this.mensajePerfil.set('');
    this.errorPerfil.set('');

    const usuarioActualizado = {
      //...this.usuarioActual()!,
      nombre: this.formPerfil.value.nombre!.trim(),
      apellido: this.formPerfil.value.apellido!.trim(),
      email: this.formPerfil.value.email!.trim(),
    };
    /*
    this.auth.actualizarInfoUsuario(usuarioActualizado).subscribe({
      next: () => {
        this.mensajePerfil.set('¡Perfil actualizado correctamente!');
        this.loadingPerfil = false;
        this.formPerfil.markAsUntouched();
        this.getUsuarioActual();
      },
      error: (err) => {
        this.errorPerfil.set('Error al actualizar el perfil');
        console.log(err);
        this.loadingPerfil = false;
      },
    });
*/
  }

  enviarPassword() {
    if (this.formPassword.invalid) {
      return;
    }

    this.loadingPassword = true;
    this.mensajePassword.set('');
    this.errorPassword.set('');

    if (
      !this.auth.validarPassword(
        this.formPassword.value.passwordNuevo!,
        this.formPassword.value.passwordConfirmar!
      )
    ) {
      this.errorPassword.set('Repita correctamente la nueva contraseña');
      this.loadingPassword = false;
      return;
    }

    const passDto: PasswordValidacionDto = {
      password: this.formPassword.value.passwordActual!,
    };

    this.usuarioService.validarPassword(passDto).subscribe({
      next: () => {
        const usuario: UsuarioUpdateDto = {
          password: this.formPassword.value.passwordNuevo!,
        };
        this.usuarioService.actualizarUsuario(usuario).subscribe({
          next: () => {
            this.mensajePassword.set('¡Contraseña actualizada correctamente!');
            this.loadingPassword = false;
            this.formPassword.reset();
            this.formPassword.markAsUntouched();
            this.getUsuarioActual();
          },
          error: (err) => {
            this.errorPassword.set(err.error.message);
          },
        });
      },
      error: (err) => {
        this.errorPassword.set(err.error.message);
        this.loadingPassword = false;
      },
    });

    /*
    if (
      !this.auth.validarPassword(
        this.usuarioActual()!.password!,
        this.formPassword.value.passwordActual!
      )
    ) {
      this.errorPassword.set('Contraseña incorrecta');
      this.loadingPassword = false;
      return;
    }

    if (this.formPassword.value.passwordNuevo! !== this.formPassword.value.passwordConfirmar!) {
      this.errorPassword.set('Repita correctamente la contraseña');
      this.loadingPassword = false;
      return;
    }

    this.usuarioService
      .actualizarPassword(this.usuarioActual()?.id!, this.formPassword.value.passwordNuevo!)
      .subscribe({
        next: () => {
          this.mensajePassword.set('¡Contraseña actualizada correctamente!');
          this.loadingPassword = false;
          this.formPassword.reset();
          this.formPassword.markAsUntouched();
          this.getUsuarioActual();
        },
        error: (err) => {
          this.errorPassword.set('Error al actualizar la contraseña');
          console.log(err);
          this.loadingPassword = false;
        },
      });
*/
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  abrirAlertaEliminar() {
    this.mostrarAlertaEliminar.set(true);
  }

  cerrarAlertaEliminar() {
    this.mostrarAlertaEliminar.set(false);
  }

  confirmarEliminar() {
    this.usuarioService.eliminarById(this.usuarioActual()!.id).subscribe({
      next: () => {
        this.cerrarAlertaEliminar();
        this.auth.logout();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert('Error al intentar eliminar la cuenta...');
        console.log(err);
        this.cerrarAlertaEliminar();
      },
    });
  }
}
