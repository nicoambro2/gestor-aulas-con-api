export interface UsuarioResponseDto {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'ADMIN' | 'PROFESOR';
}