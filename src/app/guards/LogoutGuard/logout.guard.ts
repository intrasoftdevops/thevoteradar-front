import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalDataService } from '../../services/localData/local-data.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {

  previousUrl: any[] = [];

  constructor(private localData: LocalDataService, private router: Router, private permissionsService: NgxPermissionsService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.permissionsService.getPermissions()[0]) {

      if (localStorage.getItem('previosUrl')) {
        this.router.navigateByUrl(localStorage.getItem('previosUrl')!);
      } else {
        if (this.localData.getRol() == '1') {
          this.router.navigate(['estadisticasEquipoAdmin']);
        } else if (this.localData.getRol() == '2') {
          this.router.navigate(['estadisticasEquipoGerente']);
        } else if (this.localData.getRol() == '3') {
          this.router.navigate(['estadisticasEquipoSupervisor']);
        } else if (this.localData.getRol() == '4') {
          this.router.navigate(['estadisticasEquipoCoordinador']);
        } else if (this.localData.getRol() == '5') {
          this.router.navigate(['reporteIncidencias']);
        } else if (this.localData.getRol() == '8') {
          this.router.navigate(['impugnar']);
        }
      }

      return false;

    }

    return true;

  }

}
