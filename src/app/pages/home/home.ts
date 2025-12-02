import { Component, inject } from '@angular/core';
import { UsuarioService } from '../../services/usuario-service/usuario-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private usuarioService = inject(UsuarioService);

constructor() {
  this.usuarioService.getAll().subscribe({
    next: (usuarios) => {
      console.log('Lista de usuarios:', usuarios);
    },
  });
}
}
