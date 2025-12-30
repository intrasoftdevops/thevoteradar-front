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
import { Theme } from '../../core/models/theme.model';
import { BackofficeAuthService } from '../../services/backoffice-auth/backoffice-auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { getTenantIdFromCode } from '../../core/models/tenant.model';

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

  
  // Tenant detectado dinámicamente desde el dominio
  private detectedTenantCode: string | null = null;

  
  public showOtpInput: boolean = false;
  public showProfileCompletion: boolean = false;
  public verificationId: string | null = null;
  public verifiedOtp: string | null = null; 
  public remoteUser: any = null;
  public missingFields: string[] = [];
  public isLoading: boolean = false;
  public loginEmail: string | null = null; // Email usado para el login inicial

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
    private backofficeAuth: BackofficeAuthService,
    private tenantService: TenantService
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
    this.detectTenantFromDomain();
  }

  /**
   * Detectar tenant_id desde el dominio y aplicar tema
   * Usa TenantService para obtener el tenant_id correcto (ej: 'juan-duque')
   * y luego ThemeService para aplicar el tema correspondiente
   */
  private detectTenantFromDomain(): void {
    // Usar TenantService para detectar el tenant_id desde el dominio
    // Esto retorna el tenant_id correcto (ej: 'juan-duque', 'daniel-quintero', etc.)
    const tenantId = this.tenantService.detectTenantFromDomain();
    
    if (tenantId) {
      this.detectedTenantCode = tenantId;
      // Aplicar el tema correspondiente usando ThemeService
      this.themeService.detectAndApplyThemeFromDomain();
    } else {
      this.detectedTenantCode = environment.defaultTenantId || null;
    }
  }

  get createFormControl() {
    return this.loginForm.controls;
  }

  private isEmail(input: string): boolean {
    return input.includes('@') && input.includes('.');
  }

  onSubmit(event?: Event) {
    // SIEMPRE prevenir el comportamiento por defecto del formulario (recargar página)
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Marcar todos los campos como "touched" para mostrar errores de validación
    if (this.loginForm) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
    
    if (this.loginForm.valid) {
      this.isLoading = true;

      const input = this.loginForm.value.telefono?.trim() || '';
      const password = this.loginForm.value.password || '';

      if (this.isEmail(input)) {
        this.handleAdminLogin(input, password);
        return;
      }

      if (this.showOtpInput && this.loginForm.value.otp) {
        // Crear evento sintético si no existe
        const eventToUse = event || new Event('submit');
        this.handleOtpVerification(eventToUse);
        return;
      }

      
      if (this.showProfileCompletion) {
        // Crear evento sintético si no existe
        const eventToUse = event || new Event('submit');
        this.handleProfileCompletion(eventToUse);
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

      // Validar que se haya detectado un tenant
      const tenantCode = this.detectedTenantCode || environment.defaultTenantId;
      if (!tenantCode) {
        this.isLoading = false;
        this.alertService.errorAlert('Error de configuración: No se pudo determinar el tenant. Por favor, accede desde un dominio válido.');
        return;
      }
      
      // IMPORTANTE: Convertir el tenant code (ej: 'juan-duque') al tenant_id numérico (ej: '475757')
      // que el backend espera, y guardarlo en localStorage ANTES de hacer login
      // Esto asegura que cuando se verifique el OTP, se use el mismo tenant_id
      const tenantIdForBackend = getTenantIdFromCode(tenantCode);
      localStorage.setItem('temp_tenant_id_for_login', tenantIdForBackend);
      
      // Para testigos: usar el endpoint del backoffice (permite login con teléfono)
      // El endpoint /users/token ahora acepta teléfono como username
      const phoneOrEmail = this.loginForm.value.telefono?.trim() || '';
      // password ya está declarado arriba en la línea 145
      
      // Usar backofficeAuth.login que acepta teléfono o email como username
      this.backofficeAuth.login(phoneOrEmail, password).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Si requiere completar perfil y OTP
          if (response.requires_profile_completion && response.requires_otp) {
            this.showOtpInput = true;
            this.showProfileCompletion = false;
            this.verificationId = response.verification_id || null;
            this.remoteUser = response.remote_user || {};
            this.missingFields = response.missing_fields || [];
            this.loginEmail = phoneOrEmail.includes('@') ? phoneOrEmail : (response.remote_user?.email || phoneOrEmail);
            
            console.log('✅ Login backoffice - verificationId:', this.verificationId, 'remoteUser:', this.remoteUser, 'loginEmail:', this.loginEmail);
            this.alertService.infoAlert(response.message || 'Es tu primera vez iniciando sesión. Por favor completa tus datos y verifica tu teléfono con el código OTP enviado.');
              return;
            }
            
          // Si solo requiere OTP (sin completar perfil)
          if (response.requires_otp && !response.requires_profile_completion) {
            this.showOtpInput = true;
            this.showProfileCompletion = false; 
            this.verificationId = response.verification_id || null;
            this.remoteUser = response.remote_user || {};
            this.loginEmail = phoneOrEmail.includes('@') ? phoneOrEmail : (response.remote_user?.email || phoneOrEmail);
            
            this.alertService.infoAlert(response.message || 'Ingresa el código OTP enviado a tu WhatsApp');
            return;
          }

          // Si solo requiere completar perfil (sin OTP)
          if (response.requires_profile_completion && !response.requires_otp) {
            this.showOtpInput = false;
            this.showProfileCompletion = true;
            this.verificationId = response.verification_id || null;
            this.remoteUser = response.remote_user || {};
            this.missingFields = response.missing_fields || [];
            this.loginEmail = phoneOrEmail.includes('@') ? phoneOrEmail : (response.remote_user?.email || phoneOrEmail);
            this.initProfileForm(); 
            this.alertService.infoAlert(response.message || 'Necesitamos completar algunos datos');
            return;
          }

          // Login exitoso sin requerir completar perfil
          if (response.access_token) {
            // Guardar token y datos del usuario
            this.localData.setBackofficeToken(response.access_token);
            if (response.user) {
              this.localData.setBackofficeUser(response.user);
              this.localData.setToken(response.access_token);
              
              // Mapear rol
              const role = response.user?.role?.toLowerCase();
              let rolId = 1;
              if (role === 'gerente') rolId = 2;
              else if (role === 'supervisor') rolId = 3;
              else if (role === 'coordinador') rolId = 4;
              else if (role === 'testigo') rolId = 5;
              else if (role === 'admin' || role === 'super_admin') rolId = 1;
              
              this.localData.setRol(rolId);
              this.localData.setId(response.user.email || phoneOrEmail || '');
              
              const tenantIdToStore = response.user?.tenant_id || 
                                         this.detectedTenantCode || 
                                         environment.defaultTenantId;
              localStorage.setItem('tenant_id', tenantIdToStore);
              
              this.themeService.loadThemeFromTenantId();
              this.permissionsService.addPermission([rolId.toString()]);
              
              this.redirectByRole(rolId);
              this.alertService.successAlert(`Bienvenido, ${response.user.role || 'usuario'}`);
            } else {
              this.alertService.errorAlert('Error: No se recibió información del usuario');
            }
            return;
          }

          // Si no hay access_token ni requiere completar perfil, mostrar error
          this.alertService.errorAlert(response.message || 'Error al iniciar sesión');
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error en login:', error);
          
          // IMPORTANTE: NO resetear el formulario, mantener los valores ingresados
          // Los valores del formulario se mantienen para que el usuario pueda corregirlos
          
          let errorMessage = 'Error al iniciar sesión';
          
          // Verificar si es un error de conexión
          if (error.status === 0 || error.status === undefined) {
            errorMessage = 'Error al conectar con el servidor. Verifica que el servidor esté en ejecución y que la URL sea correcta.';
          } else if (error.error?.detail) {
            errorMessage = error.error.detail;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas. Verifica tu teléfono y contraseña.';
          } else if (error.status === 404) {
            errorMessage = 'Endpoint no encontrado. Verifica la configuración del servidor.';
          } else if (error.status >= 500) {
            errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
          }
          
          // Mostrar error sin recargar la página ni resetear el formulario
          this.alertService.errorAlert(errorMessage);
        }
      });
    } else {
      // El formulario no es válido, mostrar mensaje de error
      const missingFields: string[] = [];
      if (this.loginForm.get('telefono')?.invalid) {
        missingFields.push('Teléfono o Usuario');
        }
      if (this.loginForm.get('password')?.invalid) {
        missingFields.push('Contraseña');
      }
      
      if (missingFields.length > 0) {
        this.alertService.errorAlert(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`);
    } else {
      this.alertService.errorAlert("No pueden existir campos vacíos.");
    }
    }
  }

  handleOtpVerification(event: Event) {
    // Prevenir el comportamiento por defecto del formulario (recargar página)
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.loginForm.value.otp || this.loginForm.value.otp.length !== 6) {
      this.alertService.errorAlert("El código OTP debe tener 6 dígitos");
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Validar que tenemos los datos necesarios para el flujo de backoffice
    if (!this.verificationId) {
      console.error('❌ No hay verificationId disponible');
      this.alertService.errorAlert('Error: No se encontró el ID de verificación. Por favor, intenta iniciar sesión nuevamente.');
      this.isLoading = false;
      return;
    }

    if (!this.remoteUser) {
      console.error('❌ No hay remoteUser disponible');
      this.alertService.errorAlert('Error: No se encontró la información del usuario. Por favor, intenta iniciar sesión nuevamente.');
      this.isLoading = false;
      return;
    }
    
    // Flujo de backoffice: verificar el OTP antes de mostrar el formulario
    console.log('✅ Verificando OTP - Flujo de backoffice');
    console.log('🔍 verificationId:', this.verificationId);
    console.log('🔍 remoteUser:', this.remoteUser);
    console.log('🔍 OTP ingresado:', this.loginForm.value.otp);
    
    // Verificar el OTP con el backend antes de mostrar el formulario
    this.backofficeAuth.verifyOtp(this.loginForm.value.otp, this.verificationId).subscribe({
      next: (resp: any) => {
        if (resp.res === true) {
          // OTP verificado correctamente, guardar y mostrar formulario
          this.verifiedOtp = this.loginForm.value.otp;

          try {
            // Inicializar el formulario primero
            this.initProfileForm();
        
            // Solo mostrar el formulario si la inicialización fue exitosa
          this.showOtpInput = false;
          this.showProfileCompletion = true;
            // Usar infoAlert en lugar de successAlert para evitar que recargue la página
            this.alertService.infoAlert('OTP verificado correctamente. Por favor completa tus datos para continuar.');
            this.isLoading = false;
          } catch (error) {
            console.error('❌ Error al inicializar formulario de perfil:', error);
            this.alertService.errorAlert('Error al inicializar el formulario. Por favor intenta nuevamente.');
            this.isLoading = false;
            // No cambiar el estado si hay un error
        }
        } else {
          this.alertService.errorAlert(resp.message || 'Error al verificar el OTP');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error al verificar OTP:', error);
        const errorMessage = error.error?.detail || error.error?.message || 'Código OTP incorrecto o expirado';
        this.alertService.errorAlert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  handleProfileCompletion(event: Event) {
    // Prevenir el comportamiento por defecto del formulario (recargar página)
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.profileForm) {
      this.initProfileForm();
    }

    // Marcar todos los campos como touched para que las validaciones se ejecuten correctamente
    if (this.profileForm) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm!.get(key)?.markAsTouched();
      });
    }

    
    const otp = this.verifiedOtp || this.loginForm.value.otp;
    if (!otp || otp.length !== 6) {
      this.alertService.errorAlert("Por favor ingresa el código OTP primero");
      this.showProfileCompletion = false;
      this.showOtpInput = true;
      this.isLoading = false;
      return;
    }

    
    if (this.profileForm?.value.password !== this.profileForm?.value.password_confirmation) {
      this.alertService.errorAlert("Las contraseñas no coinciden");
      this.isLoading = false;
      return;
    }

    // Validar campos requeridos individualmente para dar un mensaje más específico
    if (!this.profileForm?.valid) {
      if (!this.profileForm) {
        this.isLoading = false;
        return;
      }
      
      const missingFields: string[] = [];
      if (!this.profileForm.get('nombres')?.value?.trim()) missingFields.push('Nombres');
      if (!this.profileForm.get('apellidos')?.value?.trim()) missingFields.push('Apellidos');
      if (!this.profileForm.get('numero_documento')?.value?.trim()) missingFields.push('Número de Documento');
      if (!this.profileForm.get('password')?.value?.trim()) missingFields.push('Contraseña');
      if (!this.profileForm.get('password_confirmation')?.value?.trim()) missingFields.push('Confirmar Contraseña');
      
      // Validar longitud mínima de contraseña
      const passwordValue = this.profileForm.get('password')?.value?.trim();
      if (passwordValue && passwordValue.length < 6) {
        this.alertService.errorAlert("La contraseña debe tener al menos 6 caracteres");
        this.isLoading = false;
        return;
      }
      
      if (missingFields.length > 0) {
        this.alertService.errorAlert(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`);
      } else {
        this.alertService.errorAlert("Por favor completa todos los campos requeridos");
      }
      this.isLoading = false;
      return;
    }

    // Validar que se haya detectado un tenant
    const tenantCode = this.detectedTenantCode || environment.defaultTenantId;
    if (!tenantCode) {
      this.isLoading = false;
      this.alertService.errorAlert('Error de configuración: No se pudo determinar el tenant. Por favor, accede desde un dominio válido.');
      return;
    }
    
    // Obtener teléfono: primero del remoteUser (viene del backend), luego del profileForm, NUNCA del loginForm
    // El loginForm.value.telefono puede contener el email si el usuario ingresó email en lugar de teléfono
    const telefonoFromRemoteUser = this.remoteUser?.phone || this.remoteUser?.telefono;
    const telefonoFromProfile = this.profileForm?.value?.telefono;
    const telefonoToUse = telefonoFromRemoteUser || telefonoFromProfile || '';
    
    if (!telefonoToUse) {
      this.alertService.errorAlert('Error: No se encontró el teléfono del usuario. Por favor, intenta iniciar sesión nuevamente.');
      this.isLoading = false;
      return;
    }
    
    const profileData: any = {
      tenant_code: tenantCode,
      telefono: telefonoToUse.toString().trim(),
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

    
    // El email del formulario se envía como email_optional (opcional)
    if (this.profileForm.value.email?.trim() && this.profileForm.value.email.includes('@')) {
      profileData.email_optional = this.profileForm.value.email.trim();
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

    
    // Usar endpoint de backoffice (siempre es flujo de backoffice ahora)
    // Usar el email del login inicial, o el del formulario, o el de remoteUser
    const emailToUse = this.loginEmail || this.profileForm.value.email || this.remoteUser?.email;
    
    if (!emailToUse) {
      this.alertService.errorAlert('Error: No se encontró el email del usuario. Por favor, intenta iniciar sesión nuevamente.');
      this.isLoading = false;
      return;
    }
    
    const backofficeProfileData: any = {
      email: emailToUse,
        otp: otp || '',
        verification_id: this.verificationId || undefined,
        nombres: profileData.nombres,
        apellidos: profileData.apellidos,
        numero_documento: profileData.numero_documento,
        password: profileData.password,
        password_confirmation: profileData.password_confirmation,
      telefono: profileData.telefono  // Ya se obtuvo correctamente arriba
    };
    
    // Agregar email_optional si el usuario ingresó un email en el formulario
    if (profileData.email_optional && profileData.email_optional.includes('@')) {
      backofficeProfileData.email_optional = profileData.email_optional;
    }
    
    console.log('📤 Enviando datos de perfil completado:', { ...backofficeProfileData, password: '***', password_confirmation: '***' });
      
      this.backofficeAuth.completeProfile(backofficeProfileData).subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          if (resp.access_token) {
            // Validar que resp.user existe
            if (!resp.user) {
              console.error('❌ Respuesta sin información de usuario:', resp);
              this.alertService.errorAlert('Error: No se recibió información del usuario en la respuesta');
              return;
            }
            
            // Guardar token y datos del usuario
            this.localData.setBackofficeToken(resp.access_token);
            this.localData.setBackofficeUser(resp.user);
            this.localData.setToken(resp.access_token);
            
            // Mapear rol
            const role = resp.user?.role?.toLowerCase();
            let rolId = 1;
            if (role === 'gerente') rolId = 2;
            else if (role === 'supervisor') rolId = 3;
            else if (role === 'coordinador') rolId = 4;
            else if (role === 'testigo') rolId = 5;
            else if (role === 'admin' || role === 'super_admin') rolId = 1;
            
            this.localData.setRol(rolId);
            this.localData.setId(resp.user?.email || this.loginEmail || '');
            
            const tenantIdToStore = resp.user?.tenant_id || 
                                       this.detectedTenantCode || 
                                       environment.defaultTenantId;
            localStorage.setItem('tenant_id', tenantIdToStore);
            // Eliminar temp_tenant_id_for_login después de completar el perfil exitosamente
            localStorage.removeItem('temp_tenant_id_for_login');
            
            this.themeService.loadThemeFromTenantId();
            this.permissionsService.addPermission([rolId.toString()]);
            
            this.redirectByRole(rolId);
            this.alertService.successAlert('Perfil completado correctamente. Bienvenido!');
            
            // Limpiar estado
            this.showProfileCompletion = false;
            this.showOtpInput = false;
            this.verificationId = null;
            this.remoteUser = null;
          } else {
            this.alertService.errorAlert(resp.message || 'Error al completar el perfil');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error completo al completar perfil (backoffice):', error);
          const errorMessage = error.error?.detail || error.error?.message || 'Error al completar el perfil';
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
    try {
      console.log('🔧 Inicializando formulario de perfil...');
      console.log('🔧 remoteUser:', this.remoteUser);
      console.log('🔧 user role:', this.remoteUser?.role);
      
      // Autocompletar desde remoteUser si tiene datos de users (name, lastname, numero_documento)
      // Los gerentes, supervisores, coordinadores también tienen datos en users cuando fueron creados
      const hasUserProfileData = this.remoteUser?.name || this.remoteUser?.nombres || 
                                  this.remoteUser?.lastname || this.remoteUser?.apellidos ||
                                  this.remoteUser?.numero_documento;
      
      let nombres = '';
      let apellidos = '';
      let email = '';
      let numeroDocumento = '';
      let telefono = '';
      
      if (hasUserProfileData) {
        // Si tiene datos de users (name, lastname, numero_documento), usarlos para autocompletar
        nombres = this.remoteUser?.nombres || this.remoteUser?.name || '';
        apellidos = this.remoteUser?.apellidos || this.remoteUser?.lastname || '';
        email = this.remoteUser?.email || '';
        numeroDocumento = this.remoteUser?.numero_documento || '';
        telefono = this.remoteUser?.telefono || this.remoteUser?.phone || '';
        console.log('🔧 Datos de users detectados - autocompletando:', { nombres, apellidos, numeroDocumento });
      } else {
        // Si no tiene datos de users, solo usar datos básicos
        email = this.remoteUser?.email || '';
        telefono = this.remoteUser?.phone || this.remoteUser?.telefono || '';
        console.log('🔧 No hay datos de users, solo datos básicos');
      }
      
      console.log('🔧 Datos del formulario:', { nombres, apellidos, email, numeroDocumento, telefono });
    
    this.profileForm = this.fb.group({
      nombres: [nombres, Validators.required],
      apellidos: [apellidos, Validators.required],
      numero_documento: [numeroDocumento, Validators.required],
      email: [email],
      telefono: [telefono],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      genero_id: [this.remoteUser?.genero_id || ''],
      localidad_residencia: [this.remoteUser?.localidad_residencia || ''],
      barrio: [this.remoteUser?.barrio || ''],
      direccion: [this.remoteUser?.direccion || ''],
    }, {
      validators: this.passwordMatchValidator
    });
      
      console.log('✅ Formulario de perfil inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar formulario de perfil:', error);
      this.alertService.errorAlert('Error al inicializar el formulario. Por favor intenta nuevamente.');
      // No lanzar el error para evitar que se propague y resetee el componente
      // El error ya se maneja en handleOtpVerification()
    }
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
    // Validar que se haya detectado un tenant
    const tenantCode = this.detectedTenantCode || environment.defaultTenantId;
    if (!tenantCode) {
      this.alertService.errorAlert('Error de configuración: No se pudo determinar el tenant. Por favor, accede desde un dominio válido.');
      return;
    }
    
    // Detectar si es un usuario de backoffice (tiene email en remoteUser)
    const isBackofficeUser = this.remoteUser?.email;
    
    const otpData = {
      tenant_code: tenantCode,
      telefono: this.loginForm.value.telefono,
      email: this.remoteUser?.email,
      user_data: this.remoteUser || {}
    };

    // Usar backofficeAuthService si es usuario de backoffice, sino usar apiService (voteradar-back)
    const otpService = isBackofficeUser 
      ? this.backofficeAuth.requestOtp(otpData)
      : this.apiService.requestOtp(otpData);

    otpService.subscribe({
      next: (resp: any) => {
        if (resp.res === true || resp.verification_id) {
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
    this.loginEmail = null;
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
    const tenantCode = this.detectedTenantCode || environment.defaultTenantId;
    
    if (!tenantCode) {
      console.error('❌ No se pudo determinar el tenant_id para el login');
      this.alertService.errorAlert('Error de configuración: No se pudo determinar el tenant');
      this.isLoading = false;
      return;
    }
    
    // Convertir tenant code (ej: 'juan-duque') al tenant_id numérico (ej: '1062885')
    const tenantIdToUse = getTenantIdFromCode(tenantCode);
    
    localStorage.setItem('temp_tenant_id_for_login', tenantIdToUse);
    
    this.backofficeAuth.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Si requiere completar perfil y OTP
        if (response.requires_profile_completion && response.requires_otp) {
          this.showOtpInput = true;
          this.showProfileCompletion = false;
          this.verificationId = response.verification_id || null;
          this.remoteUser = response.remote_user || {};
          this.missingFields = response.missing_fields || [];
          // Guardar el email del login para usarlo después
          this.loginEmail = email;
          console.log('✅ Login backoffice - verificationId:', this.verificationId, 'remoteUser:', this.remoteUser, 'loginEmail:', this.loginEmail);
          this.alertService.infoAlert(response.message || 'Es tu primera vez iniciando sesión. Por favor completa tus datos y verifica tu teléfono con el código OTP enviado.');
          // NO eliminar temp_tenant_id_for_login aquí - se necesita para completar el perfil
          // Se eliminará después de completar el perfil exitosamente
          return;
        }
        
        // Si no tiene token, es porque requiere completar perfil
        if (!response.access_token) {
          console.warn('LoginComponent - Respuesta sin token, requiere completar perfil');
          localStorage.removeItem('temp_tenant_id_for_login');
          return;
        }

        // Verificar que response.user existe
        if (!response.user) {
          console.error('LoginComponent - Respuesta sin información de usuario');
          this.alertService.errorAlert('Error: No se recibió información del usuario');
          localStorage.removeItem('temp_tenant_id_for_login');
          return;
        }

        // Guardar token y datos del usuario de backoffice
        this.localData.setBackofficeToken(response.access_token);
        this.localData.setBackofficeUser(response.user);
        this.localData.setToken(response.access_token);
        
        // Mapear rol según el role del usuario
        const role = response.user.role?.toLowerCase();
        let rolId = 1; // Por defecto admin
        if (role === 'gerente') rolId = 2;
        else if (role === 'supervisor') rolId = 3;
        else if (role === 'coordinador') rolId = 4;
        else if (role === 'testigo') rolId = 5;
        else if (role === 'admin' || role === 'super_admin') rolId = 1;
        
        this.localData.setRol(rolId);
        this.localData.setId(response.user.email);
        
        // Guardar token de voteradar-back si está disponible (usuario creado/mapeado automáticamente)
        if (response.voteradar_token) {
          this.localData.setVoteradarToken(response.voteradar_token);
          
          if (response.voteradar_user_id) {
            this.localData.setVoteradarUserId(response.voteradar_user_id);
            console.log('✅ LoginComponent - voteradar_user_id guardado:', response.voteradar_user_id);
          } else {
            console.warn('⚠️ LoginComponent - voteradar_token recibido pero NO voteradar_user_id');
          }
        }
        
        // Usar el tenant_id del usuario si viene en la respuesta, 
        // sino usar el detectado del dominio o el del environment
        const tenantIdToStore = response.user.tenant_id || 
                                   this.detectedTenantCode || 
                                   environment.defaultTenantId;
        localStorage.setItem('tenant_id', tenantIdToStore);
        
        localStorage.removeItem('temp_tenant_id_for_login');
        
        // Aplicar tema basado en tenant_id
        this.themeService.loadThemeFromTenantId();
        
        this.permissionsService.addPermission([rolId.toString()]);
        
        // Redirigir según el rol
        this.redirectByRole(rolId);
        this.alertService.successAlert(`Bienvenido, ${response.user.role || 'usuario'}`);
      },
      error: (error) => {
        localStorage.removeItem('temp_tenant_id_for_login');
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
      this.router.navigate(['/inicio']);
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
      this.router.navigate(['menu-admin-impugnaciones']);
    }
    else if (rol == 8) {
      localStorage.setItem('login', 'true');
      this.router.navigate(['impugnadorHome']);
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