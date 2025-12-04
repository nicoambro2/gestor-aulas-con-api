import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Usuario } from '../../models/usuario/usuario';
import { UsuarioCreateDto } from '../../models/usuario/usuarioCreateDto';
import { UsuarioResponseDto } from '../../models/usuario/usuarioResponseDto';
import { LoginResponse } from '../../auth/models/loginResponse';
import { LoginRequest } from '../../auth/models/LoginRequest';
import { UsuarioUpdateDto } from '../../models/usuario/usuarioUpdateDto';
import { PasswordValidacionDto } from '../../auth/models/passwordValidacionDto';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private baseDatosUrl = '/api/usuarios';
  private authUrl = '/api/auth';

  login(credenciales: LoginRequest):Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credenciales)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  getAll(): Observable<UsuarioResponseDto[]> {
    return this.http.get<UsuarioResponseDto[]>(this.baseDatosUrl);
  }

  getUsuarioById(id: string): Observable<UsuarioResponseDto> {
    return this.http.get<UsuarioResponseDto>(`${this.baseDatosUrl}/${id}`);
  }

  getUsuarioByEmail(email: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseDatosUrl}/email/${email}`);
  }

  getUsuarioLogueado(): Observable<UsuarioResponseDto> {
    return this.http.get<UsuarioResponseDto>(`${this.baseDatosUrl}/me`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarUsuario(usuario: UsuarioUpdateDto): Observable<UsuarioResponseDto> {
    return this.http.patch<UsuarioResponseDto>(this.baseDatosUrl, usuario);
  }

  actualizarPassword(id: string, password: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseDatosUrl}/${id}`, { password });
  }

  eliminarById(id: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseDatosUrl}/${id}`, { activo: false });
  }

  reactivarById(id: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseDatosUrl}/${id}`, { activo: true });
  }

  crear(usuario: UsuarioCreateDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseDatosUrl, usuario).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  convertirRol(rol: string): 'ADMIN' | 'PROFESOR' {
    const rolMayus = rol.toUpperCase();
    if (rolMayus === 'ADMIN') {
      return 'ADMIN';
    }
    return 'PROFESOR';
  }

  validarPassword(password: PasswordValidacionDto): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/validarPassword`, password).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  obtenerUsuariosPaginados(
    pagina: number,
    limite: number,
    filtroTexto?: string,
    filtroRol?: string,
    filtroActivo?: boolean
  ): Observable<{ usuarios: Usuario[]; total: number }> {
    let params = '';

    if (filtroRol && filtroRol !== '') {
      params += `rol=${filtroRol}`;
    }

    if (filtroActivo !== undefined) {
      params += params ? '&' : '';
      params += `activo=${filtroActivo}`;
    }

    const url = params ? `${this.baseDatosUrl}?${params}` : this.baseDatosUrl;

    return this.http
      .get<Usuario[]>(url, { observe: 'response' })
      .pipe(
        map((response) => {
          let usuarios = response.body || [];
          
          if (filtroTexto && filtroTexto.trim() !== '') {
            const textoLower = filtroTexto.toLowerCase();
            usuarios = usuarios.filter(u => 
              u.nombre.toLowerCase().includes(textoLower) ||
              u.apellido.toLowerCase().includes(textoLower) ||
              u.email.toLowerCase().includes(textoLower)
            );
          }
          
          const inicio = (pagina - 1) * limite;
          const fin = inicio + limite;
          const usuariosPaginados = usuarios.slice(inicio, fin);
          
          return {
            usuarios: usuariosPaginados,
            total: usuarios.length,
          };
        })
      );
  }
}
