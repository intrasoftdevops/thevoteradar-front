import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDataService } from '../../services/localData/local-data.service';
import { ApiService } from '../../services/api/api.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { InactivityService } from '../../services/inactivity/inactivity.service';

@Component({
  selector: 'app-dropdown-menu-users',
  templateUrl: './dropdown-menu-users.component.html',
  styleUrls: ['./dropdown-menu-users.component.scss'],
})
export class DropdownMenuUsersComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private localData: LocalDataService,
    private permissionsService: NgxPermissionsService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    
    this.inactivityService.inactivityObservable.subscribe(() => {
      
      this.logout();
    });

    
    window.addEventListener('mousemove', () => this.inactivityService.resetTimer());
    window.addEventListener('click', () => this.inactivityService.resetTimer());
    window.addEventListener('keypress', () => this.inactivityService.resetTimer());
  }

  logout() {
    // Limpiar datos localmente primero
    this.localData.deleteCookies();
    this.permissionsService.addPermission(['0']);
    
    // Intentar logout en el backend, pero ignorar errores silenciosamente
    // (el token puede estar expirado o el servidor puede no estar disponible)
    this.apiService.logout().subscribe({
      next: () => {
        // Logout exitoso, navegar al login
        this.router.navigate(['']);
      },
      error: () => {
        // Ignorar errores silenciosamente - ya limpiamos todo localmente
        // Navegar al login de todas formas
        this.router.navigate(['']);
      },
    });
  }
}
