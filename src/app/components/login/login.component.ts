import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginClass } from 'src/app/models/login-class';

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

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
  }

  login() {
    this.apiService.login(this.user).subscribe(
      (resp: any) => {
        const loginClass: LoginClass = resp;
        console.log(loginClass);
        const { res, rol, token, id } = loginClass;
        if (res == true) {

          this.apiService.setToken(token);
          this.apiService.setRol(rol);
          this.apiService.setId(id);
          if (res == true && rol == 1) {
            this.router.navigate(['adminHome']);
          }
          else if (res == true && rol == 2) {
            this.router.navigate(['gerenteHome']);
          }
          else if (res == true && rol == 3) {
            this.router.navigate(['supervisorHome']);
          }
          else if (res == true && rol == 4) {
            this.router.navigate(['coordinadorHome']);
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
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: resp.message,
          })
        }
      }, (err:any) => Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err,
      }))
  }

}

