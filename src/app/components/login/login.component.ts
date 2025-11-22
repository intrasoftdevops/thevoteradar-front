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

  // Tenant fijo por ahora
  private readonly TENANT_CODE = '475711';

  // Estados del flujo de login
  public showOtpInput: boolean = false;
  public showProfileCompletion: boolean = false;
  public verificationId: string | null = null;
  public verifiedOtp: string | null = null; // Guardar el OTP verificado
  public remoteUser: any = null;
  public missingFields: string[] = [];
  public isLoading: boolean = false;

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
      this.isLoading = true;

      // Si ya tenemos OTP, intentar verificar y completar login
      if (this.showOtpInput && this.loginForm.value.otp) {
        this.handleOtpVerification();
        return;
      }

      // Si estamos completando perfil
      if (this.showProfileCompletion) {
        this.handleProfileCompletion();
        return;
      }

      // Verificar si es modo desarrollo y usar usuario de prueba (legacy)
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

      // Login con telefono y password (tenant_code hardcodeado a 475711)
      // Primero intentamos login legacy con password, si falla usamos el flujo de tenant
      const loginData: any = {
        tenant_code: this.TENANT_CODE,
        telefono: this.loginForm.value.telefono,
        otp: this.loginForm.value.otp || null
      };

      // Si hay password, lo agregamos (para usuarios existentes en MySQL)
      if (this.loginForm.value.password) {
        loginData.password = this.loginForm.value.password;
      }

      this.apiService.tenantLogin(loginData).subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          
          // Login exitoso
          if (resp.res === true) {
            this.handleSuccessfulLogin(resp);
            return;
          }

          // Requiere OTP (puede venir solo o junto con requires_profile_completion)
          if (resp.requires_otp === true) {
            // Establecer el estado ANTES de mostrar el alert
            this.showOtpInput = true;
            this.showProfileCompletion = false; // Asegurar que no se muestre el perfil aún
            this.verificationId = resp.verification_id;
            this.remoteUser = resp.remote_user || {}; // Guardar datos para prellenar después
            this.missingFields = resp.missing_fields || [];
            
            // Usar setTimeout para asegurar que Angular detecte el cambio de estado
            setTimeout(() => {
              this.alertService.infoAlert(resp.message || 'Ingresa el código OTP enviado a tu WhatsApp');
            }, 100);
            return;
          }

          // Requiere completar perfil (solo después de verificar OTP)
          if (resp.requires_profile_completion === true && !resp.requires_otp) {
            this.showOtpInput = false;
            this.showProfileCompletion = true;
            this.verificationId = resp.verification_id;
            this.remoteUser = resp.remote_user || {};
            this.missingFields = resp.missing_fields || [];
            this.initProfileForm(); // Esto prellenará los campos con remoteUser
            this.alertService.infoAlert(resp.message || 'Necesitamos completar algunos datos');
            return;
          }

          // Requiere onboarding (nuevo usuario)
          if (resp.requires_onboarding === true) {
            this.showOtpInput = true;
            this.verificationId = resp.verification_id;
            this.remoteUser = resp.remote_user || {};
            this.alertService.infoAlert(resp.message || 'Te enviamos un código OTP para iniciar el registro');
            return;
          }

          // Error
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

    // Intentar login con OTP directamente
    const loginData = {
      tenant_code: this.TENANT_CODE,
      telefono: this.loginForm.value.telefono,
      otp: this.loginForm.value.otp
    };

    this.apiService.tenantLogin(loginData).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        
        // Login exitoso
        if (resp.res === true) {
          this.handleSuccessfulLogin(resp);
          return;
        }

        // Si después de verificar OTP requiere completar perfil
        if (resp.requires_profile_completion === true && !resp.requires_otp) {
          this.showOtpInput = false;
          this.showProfileCompletion = true;
          this.verificationId = resp.verification_id;
          this.verifiedOtp = this.loginForm.value.otp; // Guardar el OTP verificado
          this.remoteUser = resp.remote_user || {};
          this.missingFields = resp.missing_fields || [];
          this.initProfileForm(); // Prellenará con datos de Firestore
          this.alertService.infoAlert(resp.message || 'Por favor completa los siguientes datos');
          return;
        }

        // Si aún requiere OTP (no debería pasar aquí, pero por si acaso)
        if (resp.requires_otp === true) {
          this.showOtpInput = true;
          this.showProfileCompletion = false;
          this.verificationId = resp.verification_id;
          this.remoteUser = resp.remote_user || {};
          this.alertService.successAlert(resp.message || 'Ingresa el código OTP enviado a tu WhatsApp');
          return;
        }

        // Error
        this.alertService.errorAlert(resp.message || 'Código OTP inválido');
      },
      error: (error) => {
        this.isLoading = false;
        this.alertService.errorAlert(error.error?.message || 'Error al verificar OTP');
      }
    });
  }

  handleProfileCompletion() {
    // Crear formulario de perfil si no existe
    if (!this.profileForm) {
      this.initProfileForm();
    }

    if (!this.profileForm?.valid) {
      this.alertService.errorAlert("Por favor completa todos los campos requeridos");
      this.isLoading = false;
      return;
    }

    // Verificar que tenemos OTP (usar el guardado o el del formulario)
    const otp = this.verifiedOtp || this.loginForm.value.otp;
    if (!otp || otp.length !== 6) {
      this.alertService.errorAlert("Por favor ingresa el código OTP primero");
      this.showProfileCompletion = false;
      this.showOtpInput = true;
      this.isLoading = false;
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.profileForm.value.password !== this.profileForm.value.password_confirmation) {
      this.alertService.errorAlert("Las contraseñas no coinciden");
      this.isLoading = false;
      return;
    }

    // Limpiar y validar campos antes de enviar
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
    
    // Validar que los campos requeridos no estén vacíos con mensaje específico
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

    // Solo agregar campos opcionales si tienen valor
    if (this.profileForm.value.email?.trim()) {
      profileData.email = this.profileForm.value.email.trim();
    }
    
    // Convertir a entero si tiene valor, o no enviarlo si está vacío
    if (this.profileForm.value.genero_id && this.profileForm.value.genero_id !== '') {
      const generoId = parseInt(this.profileForm.value.genero_id, 10);
      if (!isNaN(generoId) && generoId > 0) {
        profileData.genero_id = generoId;
      }
    }
    
    // Convertir a entero si tiene valor, o no enviarlo si está vacío
    // IMPORTANTE: Si el campo está vacío o es string vacío, no lo enviamos
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

    // Log para debugging
    console.log('Datos enviados al completar perfil:', profileData);
    
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
        
        // Log detallado del error
        console.error('Error completo al completar perfil:', error);
        console.error('Error details:', error.error);
        console.error('Validation errors:', error.error?.errors);
        
        // Mostrar mensaje de error más detallado
        let errorMessage = 'Error al completar el perfil';
        
        if (error.error?.errors) {
          // Si hay errores de validación, mostrarlos de forma más clara
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
    this.verifiedOtp = null; // Limpiar OTP guardado
    this.remoteUser = null;
    this.missingFields = [];
    this.profileForm = null;
    this.loginForm.patchValue({ otp: '' });
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