import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';
import packageJson from '../../../../package.json';
import { AlertService } from '../../services/alert/alert.service';
import { LocalDataService } from '../../services/localData/local-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme/theme.service';
import { Theme } from '../../models/theme.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = this.fb.group({
    numero_documento: ['', Validators.required],
    password: ['', Validators.required],
  });

  public version: string = packageJson.version;
  public isDevelopmentMode: boolean = this.checkDevelopmentMode();
  public showDevUsers: boolean = false;
  public showPassword: boolean = false;
  
  // Branding dinámico del tema actual
  public currentTheme: Theme | null = null;
  public logo: string = '../../../assets/logo.png';
  public logoSize: string = 'medium'; // small, medium, large
  public title: string = 'VoteRadar';
  public description: string = 'Sistema de gestión electoral';

  // Usuarios de desarrollo
  devUsers = [
    { id: 1, name: 'Admin Dev', documento: 'admin', password: 'admin123', rol: 1, description: 'Administrador completo' },
    { id: 2, name: 'Gerente Dev', documento: 'gerente', password: 'gerente123', rol: 2, description: 'Gestión de departamentos' },
    { id: 3, name: 'Supervisor Dev', documento: 'supervisor', password: 'super123', rol: 3, description: 'Supervisión de equipos' },
    { id: 4, name: 'Coordinador Dev', documento: 'coord', password: 'coord123', rol: 4, description: 'Coordinación de testigos' },
    { id: 5, name: 'Testigo Dev', documento: 'testigo', password: 'test123', rol: 5, description: 'Reporte de incidencias' },
    { id: 6, name: 'Admin Sistema', documento: 'admin2', password: 'admin456', rol: 6, description: 'Administrador del sistema' },
    { id: 7, name: 'Impugnador Admin', documento: 'impugn', password: 'impugn123', rol: 7, description: 'Administrar impugnaciones' },
    { id: 8, name: 'Impugnador', documento: 'impugnador', password: 'imp123', rol: 8, description: 'Crear impugnaciones' },
    { id: 9, name: 'Super Admin', documento: 'superadmin', password: 'super456', rol: 9, description: 'Super administrador' }
  ];

  constructor(
    private apiService: ApiService, 
    private router: Router, 
    private fb: FormBuilder, 
    private alertService: AlertService, 
    private localData: LocalDataService, 
    private permissionsService: NgxPermissionsService,
    private themeService: ThemeService
  ) {
    // Suscribirse a cambios de tema para actualizar branding
    this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
      if (theme.branding) {
        this.logo = theme.branding.logo;
        this.logoSize = theme.branding.logoSize || 'medium';
        this.title = theme.branding.title;
        this.description = theme.branding.description;
      }
    });
  }

  private checkDevelopmentMode(): boolean {
    // Verificación de seguridad múltiple
    return environment.development && 
           !environment.production && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev') ||
            window.location.hostname.includes('test'));
  }

  // Obtener clases CSS según el tamaño del logo
  getLogoClasses(): string {
    const sizeClasses = {
      small: 'w-24 md:w-32',      // 96px / 128px
      medium: 'w-32 md:w-40',     // 128px / 160px
      large: 'w-40 md:w-48'       // 160px / 192px
    };
    return `${sizeClasses[this.logoSize as keyof typeof sizeClasses] || sizeClasses.medium} mx-auto mb-4`;
  }

  ngOnInit() {
  }

  get createFormControl() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Verificar si es modo desarrollo y usar usuario de prueba
      if (this.isDevelopmentMode) {
        const devUser = this.devUsers.find(user => 
          user.documento === this.loginForm.value.numero_documento && 
          user.password === this.loginForm.value.password
        );

        if (devUser) {
          this.loginAsDevUser(devUser);
          return;
        }
      }

      // Login normal con API
      this.apiService.login(this.loginForm.value).subscribe((resp: any) => {
        const { res, rol, token, id } = resp;
        if (res == true) {
          this.localData.deleteCookies();
          this.localData.setToken(token);
          this.localData.setRol(rol);
          this.localData.setId(id);
          this.permissionsService.addPermission([this.localData.getRol()]);

          this.redirectByRole(rol);
        } else {
          this.alertService.errorAlert(resp.message);
        }
      })
    } else {
      this.alertService.errorAlert("No pueden existir campos vacios.");
    }
  }

  loginAsDevUser(devUser: any) {
    // Simular login con usuario de desarrollo
    this.localData.deleteCookies();
    this.localData.setToken('dev-token-' + devUser.id);
    this.localData.setRol(devUser.rol);
    this.localData.setId(devUser.id);
    this.permissionsService.addPermission([devUser.rol]);
    
    // Marcar como usuario de desarrollo
    localStorage.setItem('is_dev_user', 'true');
    localStorage.setItem('dev_user_name', devUser.name);

    this.redirectByRole(devUser.rol);
  }

  redirectByRole(rol: number) {
    if (rol == 1) {
      this.router.navigate(['estadisticasEquipoAdmin']);
    }
    else if (rol == 2) {
      this.router.navigate(['estadisticasEquipoGerente']);
    }
    else if (rol == 3) {
      this.router.navigate(['estadisticasEquipoSupervisor']);
    }
    else if (rol == 4) {
      this.router.navigate(['estadisticasEquipoCoordinador']);
    }
    else if (rol == 5) {
      this.router.navigate(['reporteIncidencias']);
    }
    else if (rol == 6) {
      this.router.navigate(['adminHome']);
    }
    else if (rol == 7) {
      this.router.navigate(['administrar-impugnaciones']);
    }
    else if (rol == 8) {
      localStorage.setItem('login', 'true');
      this.router.navigate(['impugnar']);
    }
    else if (rol == 9) {
      this.router.navigate(['adminHome']);
    }
  }

  toggleDevUsers() {
    this.showDevUsers = !this.showDevUsers;
  }

  selectDevUser(devUser: any) {
    this.loginForm.patchValue({
      numero_documento: devUser.documento,
      password: devUser.password
    });
    this.showDevUsers = false;
  }

}