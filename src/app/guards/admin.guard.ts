import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/service/auth-service';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.usuarioLogueado()) {
    // No logueado: dejar como está (redirige a login)
    window.alert('No tienes permiso para acceder a esta página');
    console.log('AdminGuard: Usuario no logueado, redirigiendo a login');
    router.navigate(['/login']);
    return false;
  }

  
  return auth.rolUsuario().pipe(
    map(rolUsuario => {
      console.log('AdminGuard: Usuario rol:', rolUsuario);
      
      if (rolUsuario !== 'ADMIN') {
        window.alert('No tienes permiso para acceder a esta página');
        if (rolUsuario === 'PROFESOR') {
          router.navigate(['/dashboard']);
        } else {
          router.navigate(['/home']);
        }
        return false;
      }
      
      console.log('AdminGuard: Usuario admin autenticado, acceso permitido');
      return true;
    })
  );
};