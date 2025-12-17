import { Component, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Router } from '@angular/router';

/**
 * SidebarComponent - Barra lateral de navegación
 * 
 * Contenedor para el menú, recibe el contenido dinámico
 * a través de content projection
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private localData: LocalDataService,
    private permissionsService: NgxPermissionsService,
    private router: Router
  ) {}

  logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
        this.localData.deleteCookies();
        this.permissionsService.addPermission(['0']);
        this.authService.clearAll();
        this.router.navigate(['']);
      },
      error: () => {
        this.localData.deleteCookies();
        this.permissionsService.addPermission(['0']);
        this.authService.clearAll();
        this.router.navigate(['']);
      },
    });
  }
}

