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
    // Contador de inactividad
    this.inactivityService.inactivityObservable.subscribe(() => {
      // Realiza acciones cuando se detecta inactividad, como cerrar la sesión del usuario
      this.logout();
      console.log('Inactividad detectada');
    });

    // Reinicia el temporizador de inactividad cuando ocurran eventos de actividad
    window.addEventListener('mousemove', () => this.inactivityService.resetTimer());
    window.addEventListener('click', () => this.inactivityService.resetTimer());
    window.addEventListener('keypress', () => this.inactivityService.resetTimer());
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        this.localData.deleteCookies();
        this.router.navigate(['']);
        this.permissionsService.addPermission(['0']);
      },
      error: () => {
        this.localData.deleteCookies();
        this.router.navigate(['']);
        this.permissionsService.addPermission(['0']);
      },
    });
  }
}
