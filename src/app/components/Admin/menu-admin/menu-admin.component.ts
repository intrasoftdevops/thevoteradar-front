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
    this.getGerente();
  }

  ngOnInit(): void {
  }

  getGerente() {

    this.apiService.getAssignedMunicipal().subscribe((resp: any) => {
      const { gerentes_asignados, gerentes_no_asignados } = resp;
      console.log(resp)
      for (let gerente of gerentes_asignados) {
        if (gerente.rol_id == 2) {
          this.listGerenteAsignados.push(gerente);
        }
      }
      for (let gerente of gerentes_no_asignados) {
        if (gerente.rol_id == 2) {
          this.listGerenteNoAsignados.push(gerente);
        }
      }
    }, err => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: "Un error ha ocurrido, vuelva a iniciar sesion.",
    }));
  }

  logout() {
    this.apiService.logout().subscribe((resp: any) => {
      console.log(resp);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    }, err => console.log(err))
  }

}
