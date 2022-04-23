import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-coordinador',
  templateUrl: './menu-coordinador.component.html',
  styleUrls: ['./menu-coordinador.component.scss']
})
export class MenuCoordinadorComponent implements OnInit {

  constructor(private apiService: ApiService, private router: Router) { }

  listTestigoAsignados: any = [];
  listTestigoNoAsignados: any = [];

  ngOnInit(): void {
    this.getTestigos();
  }

  getTestigos() {
    this.apiService.getTestigos().subscribe((resp: any) => {
      const { testigos_asignados, testigos_no_asignados } = resp;
      for (let testigo of testigos_asignados) {
        this.listTestigoAsignados.push(testigo);
      }
      for (let testigo of testigos_no_asignados) {
        this.listTestigoNoAsignados.push(testigo);
      }
    });
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
