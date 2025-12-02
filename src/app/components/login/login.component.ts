import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';
import packageJson from '../../../../package.json';
import { AlertService } from '../../services/alert/alert.service';
import { LocalDataService } from '../../services/localData/local-data.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme/theme.service';
import { Theme } from '../../models/theme.model';
import { BackofficeAuthService } from '../../services/backoffice-auth/backoffice-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = this.fb.group({
    telefono: ['', Validators.required],
    password: ['', Validators.required],
    otp: [''],
  });

  
  private readonly TENANT_CODE = '475711';

  
  public showOtpInput: boolean = false;
  public showProfileCompletion: boolean = false;
  public verificationId: string | null = null;
  public verifiedOtp: string | null = null; 
  public remoteUser: any = null;
  public missingFields: string[] = [];
  public isLoading: boolean = false;

  public version: string = packageJson.version;
  public isDevelopmentMode: boolean = this.checkDevelopmentMode();
  public showDevUsers: boolean = false;
  public showPassword: boolean = false;
  
  
  public currentTheme: Theme | null = null;
  public logo: string = '../../../assets/logo.png';
  public logoSize: string = 'medium'; 
  public title: string = 'VoteRadar';
  public description: string = 'Sistema de gestión electoral';

  
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
    private themeService: ThemeService,
    private backofficeAuth: BackofficeAuthService
  ) {
    
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
    
    return environment.development && 
           !environment.production && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev') ||
            window.location.hostname.includes('test'));
  }

  
  getLogoClasses(): string {
    const sizeClasses = {
      small: 'w-24 md:w-32',      
      medium: 'w-32 md:w-40',     
      large: 'w-40 md:w-48'       
    };
    return `${sizeClasses[this.logoSize as keyof typeof sizeClasses] || sizeClasses.medium} mx-auto mb-4`;
  }

  ngOnInit() {
  }

  get createFormControl() {
    return this.loginForm.controls;
  }

  private isEmail(input: string): boolean {
    return input.includes('@') && input.includes('.');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const input = this.loginForm.value.telefono?.trim() || '';
      const password = this.loginForm.value.password;


      if (this.isEmail(input)) {
        this.handleAdminLogin(input, password);
        return;
      }

      if (this.showOtpInput && this.loginForm.value.otp) {
        this.handleOtpVerification();
        return;
      }

      
      if (this.showProfileCompletion) {
        this.handleProfileCompletion();
        return;
      }

      
      if (this.isDevelopmentMode && this.loginForm.value.numero_documento) {
        const devUser = this.devUsers.find(user => 
          user.documento === this.loginForm.value.numero_documento && 
          user.password === this.loginForm.value.password
        );

        if (devUser) {
          this.loginAsDevUser(devUser);
          return;
        }
      }

      
      
      const loginData: any = {
        tenant_code: this.TENANT_CODE,
        telefono: this.loginForm.value.telefono,
        otp: this.loginForm.value.otp || null
      };

      
      if (this.loginForm.value.password) {
        loginData.password = this.loginForm.value.password;
      }

      this.apiService.tenantLogin(loginData).subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          
          
          if (resp.res === true) {
            this.handleSuccessfulLogin(resp);
            return;
          }

          
          if (resp.requires_otp === true) {
            
            this.showOtpInput = true;
            this.showProfileCompletion = false; 
            this.verificationId = resp.verification_id;
            this.remoteUser = resp.remote_user || {}; 
            this.missingFields = resp.missing_fields || [];
            
            
            setTimeout(() => {
              this.alertService.infoAlert(resp.message || 'Ingresa el código OTP enviado a tu WhatsApp');
            }, 100);
            return;
          }

          
          if (resp.requires_profile_completion === true && !resp.requires_otp) {
            this.showOtpInput = false;
            this.showProfileCompletion = true;
            this.verificationId = resp.verification_id;
            this.remoteUser = resp.remote_user || {};
            this.missingFields = resp.missing_fields || [];
            this.initProfileForm(); 
            this.alertService.infoAlert(resp.message || 'Necesitamos completar algunos datos');
            return;
          }

          
          if (resp.requires_onboarding === true) {
            this.showOtpInput = true;
            this.verificationId = resp.verification_id;
            this.remoteUser = resp.remote_user || {};
            this.alertService.infoAlert(resp.message || 'Te enviamos un código OTP para iniciar el registro');
            return;
          }

          
          this.alertService.errorAlert(resp.message || 'Error al iniciar sesión');
        },
        error: (error) => {
          this.isLoading = false;
          this.alertService.errorAlert(error.error?.message || 'Error al conectar con el servidor');
        }
      });
    } else {
      this.alertService.errorAlert("No pueden existir campos vacíos.");
    }
  }

  handleOtpVerification() {
    if (!this.loginForm.value.otp || this.loginForm.value.otp.length !== 6) {
      this.alertService.errorAlert("El código OTP debe tener 6 dígitos");
      this.isLoading = false;
      return;
    }

    
    const loginData = {
      tenant_code: this.TENANT_CODE,
      telefono: this.loginForm.value.telefono,
      otp: this.loginForm.value.otp
    };

    this.apiService.tenantLogin(loginData).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        
        
        if (resp.res === true) {
          this.handleSuccessfulLogin(resp);
          return;
        }

        
        if (resp.requires_profile_completion === true && !resp.requires_otp) {
          this.showOtpInput = false;
          this.showProfileCompletion = true;
          this.verificationId = resp.verification_id;
          this.verifiedOtp = this.loginForm.value.otp; 
          this.remoteUser = resp.remote_user || {};
          this.missingFields = resp.missing_fields || [];
          this.initProfileForm(); 
          this.alertService.infoAlert(resp.message || 'Por favor completa los siguientes datos');
          return;
        }

        
        if (resp.requires_otp === true) {
          this.showOtpInput = true;
          this.showProfileCompletion = false;
          this.verificationId = resp.verification_id;
          this.remoteUser = resp.remote_user || {};
          this.alertService.successAlert(resp.message || 'Ingresa el código OTP enviado a tu WhatsApp');
          return;
        }

        
        this.alertService.errorAlert(resp.message || 'Código OTP inválido');
      },
      error: (error) => {
        this.isLoading = false;
        this.alertService.errorAlert(error.error?.message || 'Error al verificar OTP');
      }
    });
  }

  handleProfileCompletion() {
    
    if (!this.profileForm) {
      this.initProfileForm();
    }

    if (!this.profileForm?.valid) {
      this.alertService.errorAlert("Por favor completa todos los campos requeridos");
      this.isLoading = false;
      return;
    }

    
    const otp = this.verifiedOtp || this.loginForm.value.otp;
    if (!otp || otp.length !== 6) {
      this.alertService.errorAlert("Por favor ingresa el código OTP primero");
      this.showProfileCompletion = false;
      this.showOtpInput = true;
      this.isLoading = false;
      return;
    }

    
    if (this.profileForm.value.password !== this.profileForm.value.password_confirmation) {
      this.alertService.errorAlert("Las contraseñas no coinciden");
      this.isLoading = false;
      return;
    }

    
    const profileData: any = {
      tenant_code: this.TENANT_CODE,
      telefono: (this.loginForm.value.telefono || '').toString().trim(),
      otp: (otp || '').toString().trim(),
      nombres: (this.profileForm.value.nombres || '').toString().trim(),
      apellidos: (this.profileForm.value.apellidos || '').toString().trim(),
      numero_documento: (this.profileForm.value.numero_documento || '').toString().trim(),
      password: (this.profileForm.value.password || '').toString().trim(),
      password_confirmation: (this.profileForm.value.password_confirmation || '').toString().trim(),
    };
    
    
    const missingFields: string[] = [];
    if (!profileData.telefono) missingFields.push('Teléfono');
    if (!profileData.otp || profileData.otp.length !== 6) missingFields.push('Código OTP');
    if (!profileData.nombres) missingFields.push('Nombres');
    if (!profileData.apellidos) missingFields.push('Apellidos');
    if (!profileData.numero_documento) missingFields.push('Número de Documento');
    if (!profileData.password) missingFields.push('Contraseña');
    if (!profileData.password_confirmation) missingFields.push('Confirmar Contraseña');
    
    if (missingFields.length > 0) {
      console.error('Campos faltantes:', missingFields);
      console.error('Datos del formulario:', {
        telefono: this.loginForm.value.telefono,
        otp: this.loginForm.value.otp,
        profileForm: this.profileForm?.value
      });
      this.alertService.errorAlert(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`);
      this.isLoading = false;
      return;
    }

    
    if (this.profileForm.value.email?.trim()) {
      profileData.email = this.profileForm.value.email.trim();
    }
    
    
    if (this.profileForm.value.genero_id && this.profileForm.value.genero_id !== '') {
      const generoId = parseInt(this.profileForm.value.genero_id, 10);
      if (!isNaN(generoId) && generoId > 0) {
        profileData.genero_id = generoId;
      }
    }
    
    
    
    const localidadValue = this.profileForm.value.localidad_residencia;
    if (localidadValue && localidadValue !== '' && localidadValue !== null && localidadValue !== undefined) {
      const localidadId = typeof localidadValue === 'number' 
        ? localidadValue 
        : parseInt(localidadValue.toString(), 10);
      if (!isNaN(localidadId) && localidadId > 0) {
        profileData.localidad_residencia = localidadId;
      }
    }
    
    if (this.profileForm.value.barrio?.trim()) {
      profileData.barrio = this.profileForm.value.barrio.trim();
    }
    
    if (this.profileForm.value.direccion?.trim()) {
      profileData.direccion = this.profileForm.value.direccion.trim();
    }

    
    
    this.apiService.completeProfile(profileData).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        if (resp.res === true) {
          this.handleSuccessfulLogin(resp);
        } else {
          this.alertService.errorAlert(resp.message || 'Error al completar el perfil');
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        
        console.error('Error completo al completar perfil:', error);
        console.error('Error details:', error.error);
        console.error('Validation errors:', error.error?.errors);
        
        
        let errorMessage = 'Error al completar el perfil';
        
        if (error.error?.errors) {
          
          const validationErrors = error.error.errors;
          const errorMessages: string[] = [];
          
          Object.keys(validationErrors).forEach(field => {
            const fieldErrors = validationErrors[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((msg: string) => {
                errorMessages.push(`${this.getFieldName(field)}: ${msg}`);
              });
            } else {
              errorMessages.push(`${this.getFieldName(field)}: ${fieldErrors}`);
            }
          });
          
          errorMessage = errorMessages.length > 0 
            ? errorMessages.join('\n') 
            : 'Por favor verifica que todos los campos estén completos correctamente';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

  handleSuccessfulLogin(resp: any) {
    const { rol, token, id } = resp;
          this.localData.deleteCookies();
          this.localData.setToken(token);
          this.localData.setRol(rol);
          this.localData.setId(id);
          this.permissionsService.addPermission([this.localData.getRol()]);
          this.redirectByRole(rol);
  }

  public profileForm: FormGroup | null = null;

  initProfileForm() {
    this.profileForm = this.fb.group({
      nombres: [this.remoteUser?.nombres || '', Validators.required],
      apellidos: [this.remoteUser?.apellidos || '', Validators.required],
      numero_documento: [this.remoteUser?.numero_documento || '', Validators.required],
      email: [this.remoteUser?.email || ''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      genero_id: [this.remoteUser?.genero_id || ''],
      localidad_residencia: [this.remoteUser?.localidad_residencia || ''],
      barrio: [this.remoteUser?.barrio || ''],
      direccion: [this.remoteUser?.direccion || ''],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const password = group.get('password')?.value;
    const passwordConfirmation = group.get('password_confirmation')?.value;
    return password === passwordConfirmation ? null : { passwordMismatch: true };
  }

  public showProfilePassword: boolean = false;
  public showProfilePasswordConfirmation: boolean = false;

  private getFieldName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'nombres': 'Nombres',
      'apellidos': 'Apellidos',
      'numero_documento': 'Número de Documento',
      'email': 'Email',
      'password': 'Contraseña',
      'password_confirmation': 'Confirmar Contraseña',
      'otp': 'Código OTP',
      'telefono': 'Teléfono',
      'genero_id': 'Género',
      'localidad_residencia': 'Localidad de Residencia',
      'barrio': 'Barrio',
      'direccion': 'Dirección',
      'tenant_code': 'Código de Tenant'
    };
    return fieldNames[field] || field;
  }

  resendOtp() {
    const otpData = {
      tenant_code: this.TENANT_CODE,
      telefono: this.loginForm.value.telefono,
      user_data: this.remoteUser || {}
    };

    this.apiService.requestOtp(otpData).subscribe({
      next: (resp: any) => {
        if (resp.res === true) {
          this.verificationId = resp.verification_id;
          this.alertService.successAlert('Código OTP reenviado correctamente');
        } else {
          this.alertService.errorAlert(resp.message || 'Error al reenviar OTP');
        }
      },
      error: (error) => {
        this.alertService.errorAlert(error.error?.message || 'Error al reenviar OTP');
      }
    });
  }

  goBack() {
    this.showOtpInput = false;
    this.showProfileCompletion = false;
    this.verificationId = null;
    this.verifiedOtp = null; 
    this.remoteUser = null;
    this.missingFields = [];
    this.profileForm = null;
    this.loginForm.patchValue({ otp: '' });
  }

  loginAsDevUser(devUser: any) {
    
    this.localData.deleteCookies();
    this.localData.setToken('dev-token-' + devUser.id);
    this.localData.setRol(devUser.rol);
    this.localData.setId(devUser.id);
    this.permissionsService.addPermission([devUser.rol]);
    
    
    localStorage.setItem('is_dev_user', 'true');
    localStorage.setItem('dev_user_name', devUser.name);

    this.redirectByRole(devUser.rol);
  }

  handleAdminLogin(email: string, password: string) {
    const tenantId = environment.defaultTenantId || this.TENANT_CODE || '475711';
    
    this.backofficeAuth.login(email, password, tenantId).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (!this.backofficeAuth.isAdmin(response)) {
          console.warn('LoginComponent - Usuario no es admin, abortando');
          return;
        }

        this.localData.setBackofficeToken(response.access_token);
        this.localData.setBackofficeUser(response.user);
        this.localData.setToken(response.access_token);
        this.localData.setRol(1);
        this.localData.setId(response.user.email);
        this.permissionsService.addPermission(['1']);
        
        
        setTimeout(() => {
          const savedRol = this.localData.getRol();
        }, 100);
        
        this.router.navigate(['adminHome']);
        this.alertService.successAlert('Bienvenido, administrador');
      },
      error: (error) => {
        console.error('LoginComponent - Error en login:', error);
        this.isLoading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al iniciar sesión';
        console.error('LoginComponent - Mensaje de error:', errorMessage);
        this.alertService.errorAlert(errorMessage);
      }
    });
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