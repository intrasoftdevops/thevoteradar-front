import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import packageJson from '../../../../package.json';
import { AlertService } from '../../services/alert/alert.service';
import { LocalDataService } from '../../services/localData/local-data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user: any = {
    numero_documento: '',
    password: ''
  }

  public version: string = packageJson.version;

  constructor(private apiService: ApiService, private router: Router, private alertService: AlertService, private localData: LocalDataService) { }

  ngOnInit() {
  }

  login() {
    this.apiService.login(this.user).subscribe({
      next: (resp: any) => {
        const { res, rol, token, id } = resp;
        if (res == true) {
          console.log(resp);
          this.localData.deleteCookies();
          this.localData.setToken(token);
          this.localData.setRol(rol);
          this.localData.setId(id);
          if (res == true && rol == 1) {
            this.router.navigate(['verPuestoAdmin']);
          }
          else if (res == true && rol == 2) {
            this.router.navigate(['verPuestoGerente']);
          }
          else if (res == true && rol == 3) {
            this.router.navigate(['verPuestoSupervisor']);
          }
          else if (res == true && rol == 4) {
            this.router.navigate(['verPuestoCoordinador']);
          }
          else if (res == true && rol == 5) {
            this.router.navigate(['reporteVotosTestigo']);
          }
          else if (res == true && rol == 6) {
            // TODO
            this.router.navigate(['adminHome']);
          }
          else if (res == true && rol == 7) {
            // TODO
            this.router.navigate(['adminHome']);
          }
          else if (res == true && rol == 8) {
            this.router.navigate(['impugnar']);
          }
          else if (res == true && rol == 9) {
            // TODO
            this.router.navigate(['adminHome']);
          }
        } else {
          this.alertService.errorAlert(resp.message);
        }
      },
    })
  }

}

