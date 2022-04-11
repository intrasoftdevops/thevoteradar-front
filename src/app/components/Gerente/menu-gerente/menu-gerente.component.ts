import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
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
    this.getSupervisores();
  }

  getSupervisores() {
    this.apiService.getSupervisores().subscribe((resp: any) => {
      console.log(resp)
      const { supervisores_asignados, supervisores_no_asignados } = resp;
      for (let supervisor of supervisores_asignados) {
        this.listSupervisorAsignados.push(supervisor);
      }
      for (let supervisor of supervisores_no_asignados) {
        this.listSupervisorNoAsignados.push(supervisor);
      }
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  logout() {
    this.apiService.logout().subscribe((resp: any) => {
      console.log(resp);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    }, (err: any) => {
      console.log(err);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    })
  }

}
