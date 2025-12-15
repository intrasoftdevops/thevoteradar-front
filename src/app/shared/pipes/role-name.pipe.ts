import { Pipe, PipeTransform } from '@angular/core';
import { UserRole, ROLE_CONFIG } from '../../core/models/user.model';

/**
 * Pipe para convertir role ID a nombre legible
 * 
 * Uso:
 * {{ 1 | roleName }}           → "Administrador"
 * {{ user.rol | roleName }}    → "Gerente"
 */
@Pipe({
  name: 'roleName'
})
export class RoleNamePipe implements PipeTransform {
  transform(roleId: number | string | null | undefined): string {
    if (roleId === null || roleId === undefined) {
      return 'Sin rol';
    }
    
    const id = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
    const roleConfig = ROLE_CONFIG[id];
    
    return roleConfig?.displayName || `Rol ${id}`;
  }
}

