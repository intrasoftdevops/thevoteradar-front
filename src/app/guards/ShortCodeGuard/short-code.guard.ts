import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

/**
 * Guard para validar si una ruta es un short code válido.
 * 
 * Solo permite activar la ruta si el parámetro parece un short code
 * (6-20 caracteres alfanuméricos). Si no, redirige al inicio.
 */
@Injectable({
  providedIn: 'root'
})
export class ShortCodeGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const shortCode = route.paramMap.get('shortCode');
    
    if (!shortCode) {
      this.router.navigate(['/']);
      return false;
    }

    // Validar que parezca un short code (6-20 caracteres alfanuméricos)
    const shortCodePattern = /^[a-zA-Z0-9]{6,20}$/;
    if (!shortCodePattern.test(shortCode)) {
      // No es un short code válido, redirigir al inicio
      this.router.navigate(['/']);
      return false;
    }

    // Es un short code válido, permitir activar la ruta
    return true;
  }
}

