import { inject, Injectable, signal } from '@angular/core';
import { LoginRequest } from '../models/LoginRequest';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { UsuarioService } from '../../services/usuario-service/usuario-service';
import { Usuario } from '../../models/usuario/usuario';
import { LoginResponse } from '../models/loginResponse';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usuarioService = inject(UsuarioService);

  usuarioLogueado = signal<boolean>(false);

  infoUsuario = signal<Usuario>({
    id: '',
    apellido: '',
    nombre: '',
    rol: undefined,
    email: '',
  });


  constructor() {
    this.cargarSesion();
  }

  iniciarSesion(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.usuarioService.login(credenciales)
      .pipe(
        tap(() => {
          this.usuarioLogueado.set(true);
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }


  private cargarSesion(): void {
    const isLoggedIn = localStorage.getItem('logData');
    if (isLoggedIn) {
      this.usuarioLogueado.set(true);
    }
  }

/*
  actualizarInfoUsuario(usuario: Usuario): Observable<Usuario> {
    return this.usuarioService.actualizarUsuario(usuario).pipe(
      tap((usuarioActualizado) => {
        this.infoUsuario.set({
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo,
        });
        this.guardarSesion(usuarioActualizado);
      })
    );
  }
*/

  validarPassword(password1: string, password2: string): boolean {
    if (password1 === password2) {
      return true;
    }
    return false;
  }

  rolUsuario(): Observable<String> {
    return this.usuarioService.getUsuarioLogueado().pipe(
      map(usuario => usuario?.rol)
    );
  }

  logout(): void {
    this.usuarioLogueado.set(false);
    localStorage.removeItem('logData');
  }

}
