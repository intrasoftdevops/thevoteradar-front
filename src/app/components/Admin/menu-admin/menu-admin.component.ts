import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.scss']
})
export class MenuAdminComponent implements OnInit {

  listGerenteAsignados: any = [];
  listGerenteNoAsignados: any = [];

  constructor(private apiService: ApiService, private router: Router) {
  }

  ngOnInit(): void {
    this.getGerentes();
  }

  getGerentes() {

    this.apiService.getAssignedMunicipal().subscribe((resp: any) => {
      const { gerentes_asignados, gerentes_no_asignados } = resp;
      for (let gerente of gerentes_asignados) {
        this.listGerenteAsignados.push(gerente);
      }
      for (let gerente of gerentes_no_asignados) {
        this.listGerenteNoAsignados.push(gerente);
      }
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
    }));
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
