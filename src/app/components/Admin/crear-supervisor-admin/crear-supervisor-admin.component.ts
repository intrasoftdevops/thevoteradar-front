import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-supervisor-admin',
  templateUrl: './crear-supervisor-admin.component.html',
  styleUrls: ['./crear-supervisor-admin.component.scss'],
})
export class CrearSupervisorAdminComponent implements OnInit {
  loading: boolean = false;
  dataZones: any = [];
  dataMunicipals: any = [];
  dataDepartments: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    numero_documento: ['', Validators.required],
    telefono: ['', Validators.required],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        this.customValidator.patternValidator(),
      ],
    ],
    municipio: [null], // Opcional - puede asignarse después
    zonas: [null], // Opcional - puede asignarse después
  });

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private customValidator: CustomValidationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getSelectedDepartment(codigoDepartamento: any) {
    this.createFormControl['municipio'].reset();
    this.createFormControl['zonas'].reset();

    // En ng-select, el (change) puede enviar el objeto completo o el código; normalizamos
    const codigo =
      typeof codigoDepartamento === 'string'
        ? codigoDepartamento
        : codigoDepartamento?.codigo_unico || codigoDepartamento;

    if (codigo) {
      this.getMunicipalAdmin(codigo);
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
    }
  }

  getSelectedMunicipal(codigoMunicipio: any) {
    this.createFormControl['zonas'].reset();

    // Normalizamos el municipio (string o objeto con codigo_unico)
    const codigo =
      typeof codigoMunicipio === 'string'
        ? codigoMunicipio
        : codigoMunicipio?.codigo_unico || codigoMunicipio;

    if (codigo) {
      this.getZonasyGerentes(codigo);
    } else {
      this.dataZones = [];
    }
  }

  getDepartmentAdmin() {
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        // Adaptar respuesta según el formato del nuevo endpoint
        this.dataDepartments = resp.departamentos || resp || [];
      },
      error: (error: any) => {
        
        this.dataDepartments = [];
        
        let errorMessage = 'Error al cargar los departamentos.';
        
        if (error.status === 401) {
          errorMessage = 'Error de autenticación: El token del backoffice no es válido para esta operación. ' +
            'Por favor, contacte al administrador del sistema.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor (500): El backend no pudo procesar la solicitud. ' +
            'Esto puede deberse a un problema de autenticación o configuración. ' +
            'Verifique los logs del servidor backend.';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión: No se pudo conectar con el servidor backend. ' +
            'Verifique que el servidor esté corriendo en http://localhost:8002';
        } else if (error.error?.detail || error.error?.message) {
          errorMessage = `Error: ${error.error.detail || error.error.message}`;
        }
        
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

  getMunicipalAdmin(codigoDepartamento: string | any) {
    // Usar el nuevo servicio de backoffice, pasando el código del departamento
    // codigoDepartamento puede llegar como string o como objeto
    const codigo =
      typeof codigoDepartamento === 'string'
        ? codigoDepartamento
        : codigoDepartamento?.codigo_unico || codigoDepartamento;

    this.backofficeAdminService.getMunicipiosAdmin(codigo).subscribe({
      next: (resp: any) => {
        // Adaptar respuesta según el formato del nuevo endpoint
        // El backend ya filtra por departamento, así que no necesitamos filtrar aquí
        this.dataMunicipals = resp.municipios || resp || [];
      },
      error: (error: any) => {
       
        this.dataMunicipals = [];
        
        let errorMessage = 'Error al cargar los municipios.';
        
        if (error.status === 401) {
          errorMessage = 'Error de autenticación: El token del backoffice no es válido para esta operación. ' +
            'Por favor, contacte al administrador del sistema.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor (500): El backend no pudo procesar la solicitud. ' +
            'Esto puede deberse a un problema de autenticación o configuración. ' +
            'Verifique los logs del servidor backend.';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión: No se pudo conectar con el servidor backend. ' +
            'Verifique que el servidor esté corriendo en http://localhost:8002';
        } else if (error.error?.detail || error.error?.message) {
          errorMessage = `Error: ${error.error.detail || error.error.message}`;
        }
        
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

  getZonasyGerentes(codigoMunicipio: string) {
    // Usar el nuevo servicio de backoffice
    if (codigoMunicipio) {
      this.backofficeAdminService.getZonasPorMunicipio(codigoMunicipio).subscribe({
        next: (resp: any) => {
          this.dataZones = resp.zonas || resp || [];
        },
        error: (error: any) => {
        
          this.dataZones = [];
          
          let errorMessage = 'Error al cargar las zonas.';
          
          if (error.status === 401) {
            errorMessage = 'Error de autenticación: El token del backoffice no es válido para esta operación. ' +
              'Por favor, contacte al administrador del sistema.';
          } else if (error.status === 500) {
            errorMessage = 'Error del servidor (500): El backend no pudo procesar la solicitud. ' +
              'Esto puede deberse a un problema de autenticación o configuración. ' +
              'Verifique los logs del servidor backend.';
          } else if (error.status === 0) {
            errorMessage = 'Error de conexión: No se pudo conectar con el servidor backend. ' +
              'Verifique que el servidor esté corriendo en http://localhost:8002';
          } else if (error.error?.detail || error.error?.message) {
            errorMessage = `Error: ${error.error.detail || error.error.message}`;
          }
          
          this.alertService.errorAlert(errorMessage);
        }
      });
    }
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    if (
      !this.createFormControl['email'].errors?.['email'] ||
      !this.createFormControl['email'].errors?.['invalidEmail']
    ) {
      if (this.createForm.valid) {
        this.loading = true;
        // Transformar los datos del formulario al formato esperado por el backend
        const formValue = this.createForm.value;
        const supervisorData: any = {
          email: formValue.email,
          numero_documento: formValue.numero_documento.toString(),
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          telefono: formValue.telefono ? formValue.telefono.toString() : null,
        };
        
        // Solo incluir municipio y zonas si fueron seleccionados
        if (formValue.municipio) {
          supervisorData.municipio = formValue.municipio;
        }
        
        if (Array.isArray(formValue.zonas) && formValue.zonas.length > 0) {
          supervisorData.zonas = formValue.zonas;
        }
        
        this.backofficeAdminService
          .createSupervisor(supervisorData)
          .subscribe({
            next: (resp: any) => {
              this.loading = false;
              this.alertService.successAlert(resp.message || 'Supervisor creado correctamente');
              // Redirigir a la lista de supervisores
              this.router.navigate(['/panel/usuarios/supervisores']);
            },
            error: (error: any) => {
              this.loading = false;
              let errorMessage = 'Error al crear el supervisor';
              if (error.error?.detail) {
                if (Array.isArray(error.error.detail)) {
                  errorMessage = error.error.detail.map((err: any) => 
                    `${err.loc?.join('.')}: ${err.msg}`
                  ).join('\n');
                } else {
                  errorMessage = error.error.detail;
                }
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              }
              this.alertService.errorAlert(errorMessage);
            }
          });
      } else {
        this.alertService.errorAlert('Llene los campos obligatorios.');
      }
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  onInputFocus(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.borderColor = 'var(--color-primary)';
      target.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.05)';
    }
  }

  onInputBlur(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.borderColor = '';
      target.style.backgroundColor = '';
    }
  }

  onButtonHoverEnter(event: Event): void {
    const target = event.target as HTMLElement;
    if (target && target.tagName === 'BUTTON') {
      target.style.transform = 'translateY(-2px)';
      target.style.background = 'linear-gradient(to right, var(--color-accent), var(--color-primary))';
    }
  }

  onButtonHoverLeave(event: Event): void {
    const target = event.target as HTMLElement;
    if (target && target.tagName === 'BUTTON') {
      target.style.transform = '';
      target.style.background = 'linear-gradient(to right, var(--color-primary), var(--color-accent))';
    }
  }
}
