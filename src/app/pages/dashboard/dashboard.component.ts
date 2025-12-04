import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Solicitud as SolicitudService } from '../../services/solicitud';
import { UsuarioService } from '../../services/usuario-service/usuario-service';
import { UsuarioResponseDto } from '../../models/usuario/usuarioResponseDto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private solicitudService = inject(SolicitudService);

  usuario = signal<UsuarioResponseDto | null> (null);

  // Simulamos solicitudes pendientes - después se conectará con el servicio real
  private pendingCount = signal<number>(0);

  get pendingSolicitudes(): number {
    return this.pendingCount();
  }

  constructor() {
    this.usuarioService.getUsuarioLogueado().subscribe(user => {
      this.usuario.set(user);
    });

    this.solicitudService.getSolicitudes().subscribe((sols) => {
      if (!sols) {
        this.pendingCount.set(0);
        return;
      }
      const pending = sols.filter((s) => s.estado === 'PENDIENTE').length;
      this.pendingCount.set(pending);
    });
    
  }

  navigateTo(path: string | null) {
    // Si el path es null, vacío o no implementado, ir a coming-soon
    if (!path || path === '' || path === '#') {
      this.router.navigate(['/coming-soon']);
      return;
    }
    this.router.navigate([path]);
  }
}