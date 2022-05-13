import { LocalDataService } from '../services/localData/local-data.service';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable()
export class LogoutPermissionsGuard implements CanActivate {
    previousUrl: any[] = [];

    constructor(private localData: LocalDataService, private router: Router, private permissionsService: NgxPermissionsService) { }

    canActivate() {
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

            //var urlTree = this.router.createUrlTree(['login']);
            //return urlTree;
        }

        return true;
    }

}
