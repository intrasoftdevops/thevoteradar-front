import { Component, OnInit } from '@angular/core';
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
  dataZones: any = [];
  dataMunicipals: any = [];
  dataDepartments: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
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
    private customValidator: CustomValidationService
  ) {}

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getSelectedDepartment(item: any) {
    this.createFormControl['municipio'].reset();
    this.createFormControl['zonas'].reset();
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico);
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
    }
  }

  getSelectedMunicipal(item: any) {
    this.createFormControl['zonas'].reset();
    if (item) {
      // item ya es el código único del municipio (bindValue)
      this.getZonasyGerentes(item);
    } else {
      this.dataZones = [];
    }
  }

  getDepartmentAdmin() {
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        console.log('✅ Departamentos cargados:', resp);
        // Adaptar respuesta según el formato del nuevo endpoint
        this.dataDepartments = resp.departamentos || resp || [];
      },
      error: (error: any) => {
        console.error('❌ Error al cargar departamentos:', error);
        console.error('❌ Error completo:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          message: error.message
        });
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

  getMunicipalAdmin(codigoDepartamento: string) {
    // Usar el nuevo servicio de backoffice, pasando el código del departamento
    this.backofficeAdminService.getMunicipiosAdmin(codigoDepartamento).subscribe({
      next: (resp: any) => {
        console.log('✅ Municipios cargados:', resp);
        // Adaptar respuesta según el formato del nuevo endpoint
        // El backend ya filtra por departamento, así que no necesitamos filtrar aquí
        this.dataMunicipals = resp.municipios || resp || [];
      },
      error: (error: any) => {
        console.error('❌ Error al cargar municipios:', error);
        console.error('❌ Error completo:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          message: error.message
        });
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
          console.log('✅ Zonas cargadas:', resp);
          this.dataZones = resp.zonas || resp || [];
        },
        error: (error: any) => {
          console.error('❌ Error al cargar zonas:', error);
          console.error('❌ Error completo:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error,
            message: error.message
          });
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
              this.alertService.successAlert(resp.message || 'Supervisor creado correctamente');
              this.createForm.reset();
              this.dataMunicipals = [];
              this.dataZones = [];
            },
            error: (error: any) => {
              console.error('❌ Error al crear supervisor:', error);
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
}
