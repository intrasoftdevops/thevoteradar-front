import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantConfigService } from '../../../../services/tenant-config/tenant-config.service';
import { TenantConfigResponse, TenantConfigUpdate, TenantCreate } from '../../../../services/tenant-config/tenant-config.types';
import { AlertService } from '../../../../services/alert/alert.service';
import { LocalDataService } from '../../../../services/localData/local-data.service';

@Component({
  selector: 'app-tenant-edit',
  templateUrl: './tenant-edit.component.html',
  styleUrls: ['./tenant-edit.component.scss']
})
export class TenantEditComponent implements OnInit {
  tenantForm: FormGroup;
  isEditMode = false;
  tenantId: string | null = null;
  loading = false;
  saving = false;
  isSuperAdmin = false;
  accessDenied = false;
  logoError = false;
  currentTenantConfig: TenantConfigResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tenantConfigService: TenantConfigService,
    private alertService: AlertService,
    private localData: LocalDataService
  ) {
    this.tenantForm = this.createForm();
  }

  ngOnInit(): void {
    // Verificar que el usuario sea super_admin
    this.checkSuperAdminAccess();
    
    if (!this.isSuperAdmin) {
      return;
    }

    this.tenantId = this.route.snapshot.paramMap.get('tenantId');
    this.isEditMode = this.tenantId !== null && this.tenantId !== 'nuevo';

    if (this.isEditMode && this.tenantId) {
      this.loadTenantConfig(this.tenantId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Información básica
      client_project_id: ['', Validators.required],
      client_database_id: ['(default)'],
      subdomain: [''],
      
      // Branding
      branding: this.fb.group({
        candidate_name: [''],
        contact_name: [''],
        privacy_url: [''],
        privacy_video_url: [''],
        volunteer_welcome_message: [''],
        welcome_message: [''],
        // Colores
        primary_color: [''],
        secondary_color: [''],
        accent_color: [''],
        background_color: [''],
        surface_color: [''],
        text_primary_color: [''],
        text_secondary_color: [''],
        success_color: [''],
        warning_color: [''],
        error_color: [''],
        // Branding visual
        logo_url: [''],
        logo_size: ['small'],
        title: [''],
        description: ['']
      }),
      
      // AI Config
      ai_config: this.fb.group({
        documentation_bucket_url: ['']
      }),
      
      // Agent Emails
      agent_emails: this.fb.array([]),
      
      // Integraciones
      manychatApiToken: [''],
      numero_whatsapp: [''],
      link_calendly: [''],
      link_forms: [''],
      client_credentials_secret: [''],
      // Configuración adicional
      tenant_type: ['prod'],  // Por defecto 'prod'
      use_adc: [true],  // Por defecto true
      status: ['active'],  // Por defecto 'active'
      // Wati API
      wati_api_endpoint: [''],
      wati_api_token: [''],
      wati_tenant_id: ['']
    });
  }

  get agentEmailsArray(): FormArray {
    return this.tenantForm.get('agent_emails') as FormArray;
  }

  getAgentEmailControl(index: number): FormControl {
    return this.agentEmailsArray.at(index) as FormControl;
  }

  addAgentEmail(email: string = ''): void {
    this.agentEmailsArray.push(this.fb.control(email, [Validators.email]));
  }

  removeAgentEmail(index: number): void {
    this.agentEmailsArray.removeAt(index);
  }

  loadTenantConfig(tenantId: string): void {
    this.loading = true;
    this.tenantConfigService.getTenantConfig(tenantId).subscribe({
      next: (config) => {
        this.currentTenantConfig = config;
        this.populateForm(config);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.detail || error.message || 'Error al cargar configuración del tenant';
        this.alertService.errorAlert(errorMessage);
        this.router.navigate(['/panel/configuracion/tenants']);
      }
    });
  }

  populateForm(config: TenantConfigResponse): void {
    // Información básica
    this.tenantForm.patchValue({
      client_project_id: config.client_project_id || '',
      client_database_id: config.client_database_id || '(default)',
      subdomain: config.subdomain || '',
      manychatApiToken: config.manychatApiToken || '',
      numero_whatsapp: config.numero_whatsapp || '',
      link_calendly: config.link_calendly || '',
      link_forms: config.link_forms || '',
      client_credentials_secret: config.client_credentials_secret || '',
      tenant_type: config.tenant_type || 'prod',
      use_adc: config.use_adc !== undefined ? config.use_adc : true,
      status: config.status || 'active',
      wati_api_endpoint: config.wati_api_endpoint || '',
      wati_api_token: config.wati_api_token || '',
      wati_tenant_id: config.wati_tenant_id || ''
    });

    // Branding
    if (config.branding) {
      this.tenantForm.get('branding')?.patchValue({
        candidate_name: config.branding.candidate_name || '',
        contact_name: config.branding.contact_name || '',
        privacy_url: config.branding.privacy_url || '',
        privacy_video_url: config.branding.privacy_video_url || '',
        volunteer_welcome_message: config.branding.volunteer_welcome_message || '',
        welcome_message: config.branding.welcome_message || '',
        // Colores
        primary_color: config.branding.primary_color || '',
        secondary_color: config.branding.secondary_color || '',
        accent_color: config.branding.accent_color || '',
        background_color: config.branding.background_color || '',
        surface_color: config.branding.surface_color || '',
        text_primary_color: config.branding.text_primary_color || '',
        text_secondary_color: config.branding.text_secondary_color || '',
        success_color: config.branding.success_color || '',
        warning_color: config.branding.warning_color || '',
        error_color: config.branding.error_color || '',
        // Branding visual
        logo_url: config.branding.logo_url || '',
        logo_size: config.branding.logo_size || 'small',
        title: config.branding.title || '',
        description: config.branding.description || ''
      });
    }

    // AI Config
    if (config.ai_config) {
      this.tenantForm.get('ai_config')?.patchValue({
        documentation_bucket_url: config.ai_config.documentation_bucket_url || ''
      });
    }

    // Agent Emails
    this.agentEmailsArray.clear();
    if (config.agent_emails && config.agent_emails.length > 0) {
      config.agent_emails.forEach(email => {
        this.addAgentEmail(email);
      });
    }
  }

  onSubmit(): void {
    if (this.tenantForm.invalid) {
      this.alertService.errorAlert('Por favor, complete todos los campos requeridos');
      return;
    }

    this.saving = true;
    const formValue = this.tenantForm.value;

    // Preparar datos para enviar
    const configData: TenantConfigUpdate | TenantCreate = {
      client_project_id: formValue.client_project_id,
      client_database_id: formValue.client_database_id,
      subdomain: formValue.subdomain,
      branding: formValue.branding,
      ai_config: formValue.ai_config,
      agent_emails: formValue.agent_emails.filter((email: string) => email && email.trim() !== ''),
      manychatApiToken: formValue.manychatApiToken,
      numero_whatsapp: formValue.numero_whatsapp,
      link_calendly: formValue.link_calendly,
      link_forms: formValue.link_forms,
      client_credentials_secret: formValue.client_credentials_secret,
      tenant_type: formValue.tenant_type,
      use_adc: formValue.use_adc,
      status: formValue.status,
      wati_api_endpoint: formValue.wati_api_endpoint,
      wati_api_token: formValue.wati_api_token,
      wati_tenant_id: formValue.wati_tenant_id
    };

    if (this.isEditMode && this.tenantId) {
      // Actualizar tenant existente
      this.tenantConfigService.updateTenantConfig(this.tenantId, configData as TenantConfigUpdate).subscribe({
        next: () => {
          this.saving = false;
          this.alertService.successAlert('Configuración del tenant actualizada exitosamente');
          this.router.navigate(['/panel/configuracion/tenants']);
        },
        error: (error) => {
          this.saving = false;
          const errorMessage = error.error?.detail || error.message || 'Error al actualizar configuración del tenant';
          this.alertService.errorAlert(errorMessage);
        }
      });
    } else {
      // Crear nuevo tenant (necesita tenant_id)
      const tenantId = prompt('Ingrese el ID del nuevo tenant:');
      if (!tenantId) {
        this.saving = false;
        return;
      }

      const createData: TenantCreate = {
        tenant_id: tenantId,
        ...configData
      } as TenantCreate;

      this.tenantConfigService.createTenant(createData).subscribe({
        next: () => {
          this.saving = false;
          this.alertService.successAlert('Tenant creado exitosamente');
          this.router.navigate(['/panel/configuracion/tenants']);
        },
        error: (error) => {
          this.saving = false;
          const errorMessage = error.error?.detail || error.message || 'Error al crear tenant';
          this.alertService.errorAlert(errorMessage);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/panel/configuracion/tenants']);
  }

  /**
   * Maneja errores al cargar el logo
   */
  onLogoError(event: any): void {
    this.logoError = true;
  }

  /**
   * Verifica si el usuario actual tiene rol de super_admin
   */
  private checkSuperAdminAccess(): void {
    const backofficeUser = this.localData.getBackofficeUser();
    
    if (backofficeUser && backofficeUser.role) {
      const role = backofficeUser.role.toLowerCase();
      this.isSuperAdmin = role === 'super_admin';
    } else {
      const rol = this.localData.getRol();
      const rolNumber = rol ? parseInt(rol, 10) : null;
      this.isSuperAdmin = rolNumber === 9;
    }

    if (!this.isSuperAdmin) {
      this.accessDenied = true;
      this.alertService.errorAlert('Acceso denegado. Solo los super administradores pueden gestionar tenants.');
      setTimeout(() => {
        this.router.navigate(['/panel/configuracion/perfil']);
      }, 2000);
    }
  }
}

