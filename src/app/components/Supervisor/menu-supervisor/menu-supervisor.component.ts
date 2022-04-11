import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-supervisor',
  templateUrl: './menu-supervisor.component.html',
  styleUrls: ['./menu-supervisor.component.scss']
})
export class MenuSupervisorComponent implements OnInit {

  listCoordinadorAsignados: any = [];
  listCoordinadorNoAsignados: any = [];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.getCoordinadores();
  }

  getCoordinadores() {
    this.apiService.getCoordinadores().subscribe((resp: any) => {
      const { coordinadores_asignados, coordinadores_no_asignados } = resp;
      console.log(resp)
      for (let coordinador of coordinadores_asignados) {
        this.listCoordinadorAsignados.push(coordinador);
      }
      for (let coordinador of coordinadores_no_asignados) {
        this.listCoordinadorNoAsignados.push(coordinador);
      }
    }, (err: any) => {
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
