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

    if (!this.localData.getRol()) {
      this.localData.deleteCookies();
      this.router.navigate(['']);
      return false;
    } else if (route.data['rol'].every((e: any) => e != this.localData.getRol())) {
      this.router.navigate(['forbidden']);
      return false;
    }
    return true;

  }
}
