import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalDataService } from '../../services/localData/local-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private localData: LocalDataService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const rol = this.localData.getRol();
    const rolNumber = rol ? parseInt(rol, 10) : null;
    const keyB = localStorage.getItem('keyB');
   

    if (!rol || rol === '' || rol === '0' || rol === 'undefined' || rolNumber === null || isNaN(rolNumber)) {
      console.warn('AuthGuard - No hay rol válido, redirigiendo al login');
      console.warn('AuthGuard - Detalles del problema:', {
        rol,
        rolNumber,
        keyBExists: !!keyB,
        rolLength: rol ? rol.length : 0
      });
      
      this.router.navigate(['']);
      return false;
    } else if (route.data['rol'] && route.data['rol'].every((e: any) => e != rolNumber && e != rol)) {
      console.warn('AuthGuard - Rol no permitido, redirigiendo a forbidden');
      console.warn('AuthGuard - Rol del usuario:', rolNumber, 'no está en:', route.data['rol']);
      this.router.navigate(['forbidden']);
      return false;
    }
    return true;

  }
}
