import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import packageJson from '../../../../package.json';

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

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit() {
  }

  login() {
    this.apiService.login(this.user).subscribe({
      next: (resp: any) => {
        const { res, rol, token, id } = resp;
        if (res == true) {
          console.log(resp);

          this.apiService.setToken(token);
          this.apiService.setRol(rol);
          this.apiService.setId(id);
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
            this.router.navigate(['testigoHome']);
          }
          else if (res == true && rol == 6) {
            this.router.navigate(['adminHome']);
          }
          else if (res == true && rol == 7) {
            this.router.navigate(['adminHome']);
          }
          else if (res == true && rol == 8) {
            this.router.navigate(['adminHome']);
          }
          else if (res == true && rol == 9) {
            this.router.navigate(['adminHome']);
          }
        } else {
          this.showError(resp);
        }
      },
      error: (e) => this.showError(e),
    })
  }

  showError(err: any) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
    });
  }

}

