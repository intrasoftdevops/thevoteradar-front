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
    console.log('AuthGuard - Verificando acceso a:', state.url);
    console.log('AuthGuard - Rol del usuario (string):', rol);
    console.log('AuthGuard - Rol del usuario (number):', rolNumber);
    console.log('AuthGuard - Roles permitidos:', route.data['rol']);
    console.log('AuthGuard - localStorage keyB:', keyB);
    console.log('AuthGuard - localStorage completo:', {
      keyA: localStorage.getItem('keyA') ? 'existe' : 'no existe',
      keyB: localStorage.getItem('keyB') ? 'existe' : 'no existe',
      keyC: localStorage.getItem('keyC') ? 'existe' : 'no existe',
      backoffice_token: localStorage.getItem('backoffice_token') ? 'existe' : 'no existe'
    });

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
    console.log('AuthGuard - Acceso permitido');
    return true;

  }
}
