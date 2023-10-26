import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';
import packageJson from '../../../../package.json';
import { AlertService } from '../../services/alert/alert.service';
import { LocalDataService } from '../../services/localData/local-data.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup = this.fb.group({
    numero_documento: ['', Validators.required],
    password: ['', Validators.required],
  });

  public version: string = packageJson.version;

  safeURL: any;

  constructor(private apiService: ApiService, private router: Router, private fb: UntypedFormBuilder, private alertService: AlertService, private localData: LocalDataService, private permissionsService: NgxPermissionsService, private _sanitizer: DomSanitizer) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/bNU_d8rei4k");
  }

  ngOnInit() {
  }

  get createFormControl() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.apiService.login(this.loginForm.value).subscribe((resp: any) => {
        const { res, rol, token, id } = resp;
        if (res == true) {
          this.localData.deleteCookies();
          this.localData.setToken(token);
          this.localData.setRol(rol);
          this.localData.setId(id);
          this.permissionsService.addPermission([this.localData.getRol()]);

          if (res == true && rol == 1) {
            this.router.navigate(['estadisticasEquipoAdmin']);
          }
          else if (res == true && rol == 2) {
            this.router.navigate(['estadisticasEquipoGerente']);
          }
          else if (res == true && rol == 3) {
            this.router.navigate(['estadisticasEquipoSupervisor']);
          }
          else if (res == true && rol == 4) {
            this.router.navigate(['estadisticasEquipoCoordinador']);
          }
          else if (res == true && rol == 5) {
            this.router.navigate(['reporteIncidencias']);
          }
          else if (res == true && rol == 6) {
            this.router.navigate(['adminHome']);
          }
          else if (res == true && rol == 7) {
            // TODO
            this.router.navigate(['administrar-impugnaciones']);
          }
          else if (res == true && rol == 8) {
            localStorage.setItem('login', 'true');
            this.router.navigate(['impugnar']);
          }
          else if (res == true && rol == 9) {
            // TODO
            this.router.navigate(['adminHome']);
          }
        } else {
          this.alertService.errorAlert(resp.message);
        }
      })
    } else {
      this.alertService.errorAlert("No pueden existir campos vacios.");
    }
  }

}

