import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.scss']
})
export class MenuAdminComponent implements OnInit {

  listGerenteAsignados: any = [];
  listGerenteNoAsignados: any = [];

  constructor(private apiService: ApiService, private router: Router, private alertService: AlertService) {
  }

  ngOnInit() {
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
