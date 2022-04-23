import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-gerente',
  templateUrl: './menu-gerente.component.html',
  styleUrls: ['./menu-gerente.component.scss']
})
export class MenuGerenteComponent implements OnInit {

  listSupervisorAsignados: any = [];
  listSupervisorNoAsignados: any = [];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        this.apiService.deleteCookies();
        this.router.navigate(['']);
      },
      error: () => {
        this.apiService.deleteCookies();
        this.router.navigate(['']);
      }
    })
  }

}
