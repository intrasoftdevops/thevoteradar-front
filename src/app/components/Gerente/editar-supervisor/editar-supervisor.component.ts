import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from '../../../services/alert/alert.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-editar-supervisor',
  templateUrl: './editar-supervisor.component.html',
  styleUrls: ['./editar-supervisor.component.scss']
})
export class EditarSupervisorComponent implements OnInit {

  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  idSupervisor: any;
  subscriber: any;
  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: [''],
    departamento: [null], // Opcional
    municipio: [null], // Opcional
    zonas: [null], // Opcional
  });

  loading: boolean = false;
  saving: boolean = false;
  supervisorLoaded: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private customValidator: CustomValidationService,
    private alertService: AlertService,
    private localData: LocalDataService
  ) { }

  ngOnInit(): void {
    this.loading = true;

    // Determinar si es admin (backoffice) o gerente
    const rol = this.localData.getRol();
    this.isAdmin = rol === '1' || rol === 'admin';

    // Para admin, cargamos departamentos y luego el supervisor desde el backoffice.
    // Para gerente, usamos los endpoints legacy (ApiService) para municipios y zonas.
    if (this.isAdmin) {
      this.getDepartmentAdmin();
    } else {
      this.getMunicipalSupervisor();
    }
  }

  getSelectedDepartment(codigoDepartamento: any) {
    this.updateFormControl['municipio'].reset();
    this.updateFormControl['zonas'].reset();
    // codigoDepartamento ya es el código único del departamento (bindValue)
    if (codigoDepartamento) {
      this.getMunicipalAdmin(codigoDepartamento);
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
    }
  }

  getSelectedMunicipal(codigoMunicipio: any) {
    this.updateFormControl['zonas'].reset();
    // En ng-select, el (change) puede enviar el objeto completo o el código; normalizamos
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

  getSelectedValue(item: any) {
    // Método legacy para gerente
    this.updateForm.patchValue({
      zonas: [],
    });
    if (item) {
      this.getZoneSupervisor();
    } else {
      this.dataZones = [];
    }
  }

  onSubmit() {
    if (!this.updateFormControl['email'].errors?.['email'] || !this.updateFormControl['email'].errors?.['invalidEmail']) {
      if (this.updateForm.valid) {
        this.saving = true;
        const formValue = this.updateForm.value;
        const supervisorData: any = {
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          email: formValue.email,
          numero_documento: formValue.numero_documento,
          telefono: formValue.telefono
        };
        
        if (formValue.password) {
          supervisorData.password = formValue.password;
        }
        
        if (formValue.municipio) {
          supervisorData.municipio = formValue.municipio;
        }
        
        if (Array.isArray(formValue.zonas) && formValue.zonas.length > 0) {
          supervisorData.zonas = formValue.zonas;
        }
        
        this.backofficeAdminService.updateSupervisor(this.idSupervisor, supervisorData).subscribe({
          next: (resp: any) => {
            this.saving = false;
            this.alertService.successAlert(resp.message || resp.res || 'Supervisor actualizado correctamente');
            // Redirigir a la lista de supervisores
            this.router.navigate(['/panel/usuarios/supervisores']);
          },
          error: (error: any) => {
            this.saving = false;
            let errorMessage = 'Error al actualizar el supervisor';
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
        this.alertService.errorAlert("Llene los campos obligatorios.");
      }
    }
  }

  get updateFormControl() {
    return this.updateForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }


  getMunicipalSupervisor() {
    // Obtener municipios del gerente (desde el contexto del gerente autenticado)
    // Solo aplica para el flujo de GERENTE, no para admin de backoffice.
    this.apiService.getMunicipalGerente().subscribe({
      next: (resp: any) => {
        this.dataMunicipals = resp || [];
        // Después de cargar municipios, cargar el supervisor
        this.getSupervisor();
      },
      error: (error: any) => {
        this.dataMunicipals = [];
        this.loading = false;
        this.alertService.errorAlert('Error al cargar los municipios.');
      }
    });
  }

  getZoneSupervisor() {
    const municipioCodigo = this.updateFormControl['municipio'].value;
    if (!municipioCodigo) {
      this.dataZones = [];
      return;
    }
    
    this.apiService.getZoneGerente().subscribe({
      next: (resp: any) => {
        if (Array.isArray(resp)) {
          this.dataZones = resp.filter((dataZone: any) => {
            const codigoMunicipio = dataZone.codigo_municipio_votacion || dataZone.codigo_municipio;
            return codigoMunicipio && codigoMunicipio.toString().trim() === municipioCodigo.toString().trim();
          });
        } else {
          this.dataZones = [];
        }
      },
      error: (error: any) => {
        this.dataZones = [];
      }
    });
  }

  getSupervisor() {
    if (this.supervisorLoaded) {
      return;
    }
    
    const encryptedId = this.activatedRoute.snapshot.params['id'];
    this.idSupervisor = this.localData.decryptIdUser(encryptedId);
    
    if (!this.idSupervisor || this.idSupervisor.trim() === '' || this.idSupervisor === encryptedId) {
      this.loading = false;
      this.alertService.errorAlert('Error: No se pudo obtener el ID del supervisor. Por favor, intente nuevamente.');
      this.router.navigate(['/panel/usuarios/supervisores']);
      return;
    }
    
    this.supervisorLoaded = true;
    
    this.backofficeAdminService.getSupervisor(this.idSupervisor).subscribe({
      next: (resp: any) => {
        // La respuesta viene como { res: True, supervisor: {...} }
        const supervisor = resp.supervisor || resp.data || resp;
        
        if (!supervisor) {
          this.loading = false;
          this.alertService.errorAlert('Error: No se pudo encontrar el supervisor con el ID proporcionado.');
          setTimeout(() => {
            this.router.navigate(['/panel/usuarios/supervisores']);
          }, 2000);
          return;
        }
        
        // Debug: verificar qué datos recibimos
        
        // Cargar datos básicos del supervisor
        // El backend devuelve: nombres, apellidos, numero_documento, telefono, email
        const nombres = supervisor.nombres || supervisor.name || '';
        const apellidos = supervisor.apellidos || supervisor.lastname || supervisor.last_name || '';
        const numeroDocumento = supervisor.numero_documento || supervisor.document_number || supervisor.documento || '';
        const telefono = supervisor.telefono || supervisor.phone || '';
        const email = supervisor.email || '';
        
        // Asignar valores al formulario
        this.updateForm.patchValue({
          nombres: nombres,
          apellidos: apellidos,
          numero_documento: numeroDocumento,
          telefono: telefono,
          email: email,
          password: supervisor.password || ''
        });

        // FLUJO ADMIN (backoffice): cargar departamento -> municipio -> zonas
        if (this.isAdmin) {
          // Obtener códigos de departamento y municipio de forma robusta,
          // similar a como se hace en editar-testigo (soportando distintos nombres de campos)
          const municipio = supervisor.municipio || {};
          const codigoDepartamento =
            municipio.codigo_departamento_votacion ||
            municipio.departamento?.codigo_unico ||
            municipio.departamento?.codigo_departamento_votacion ||
            null;

          const codigoMunicipio =
            municipio.codigo_unico ||
            municipio.codigo_municipio_votacion ||
            municipio.codigo_municipio ||
            null;

          if (codigoDepartamento) {
            this.updateForm.get('departamento')?.setValue(codigoDepartamento);
            // Cargar municipios del departamento
            this.getMunicipalAdmin(codigoDepartamento).then(() => {
              // Después de cargar municipios, establecer el municipio si existe
              if (codigoMunicipio) {
                this.updateForm.get('municipio')?.setValue(codigoMunicipio);
                // Cargar zonas del municipio
                this.getZonasyGerentes(codigoMunicipio).then(() => {
                  // Después de cargar zonas, establecer las zonas asignadas
                  if (supervisor.zonas && Array.isArray(supervisor.zonas) && supervisor.zonas.length > 0) {
                    const zonasCodigos = supervisor.zonas
                      .filter((z: any) => !!z?.codigo_unico)
                      .map((z: any) => z.codigo_unico);
                    this.updateForm.get('zonas')?.setValue(zonasCodigos);
                  }
                  this.loading = false;
                });
              } else {
                this.loading = false;
              }
            });
          } else {
            // Si no hay municipio/departamento, solo cargar departamentos
            this.loading = false;
          }
        } else {
          // FLUJO GERENTE (legacy): se apoya en los catálogos de ApiService
          if (supervisor.municipio && supervisor.municipio.codigo_unico) {
            this.updateForm.get('municipio')?.setValue(supervisor.municipio.codigo_unico);
            this.getZoneSupervisor();
          }

          if (supervisor.zonas && Array.isArray(supervisor.zonas) && supervisor.zonas.length > 0) {
            const zonasCodigos = supervisor.zonas.map((z: any) => z.codigo_unico);
            this.updateForm.get('zonas')?.setValue(zonasCodigos);
          }
        }

        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar el supervisor.';
        this.alertService.errorAlert(errorMessage);
        setTimeout(() => {
          this.router.navigate(['/panel/usuarios/supervisores']);
        }, 2000);
      }
    });
  }

  getDepartmentAdmin() {
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
        // Después de cargar departamentos, cargar el supervisor
        this.getSupervisor();
      },
      error: (error: any) => {
        this.dataDepartments = [];
        this.loading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar los departamentos.';
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

  getMunicipalAdmin(codigoDepartamento: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Usar el nuevo servicio de backoffice, pasando el código del departamento
      // codigoDepartamento puede venir como string o como objeto, igual que en editar-testigo
      const codigo =
        typeof codigoDepartamento === 'string'
          ? codigoDepartamento
          : (codigoDepartamento as any)?.codigo_unico || (codigoDepartamento as any);

      this.backofficeAdminService.getMunicipiosAdmin(codigo).subscribe({
        next: (resp: any) => {
          this.dataMunicipals = resp.municipios || resp || [];
          resolve();
        },
        error: (error: any) => {
          this.dataMunicipals = [];
          reject(error);
        }
      });
    });
  }

  getZonasyGerentes(codigoMunicipio: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Usar el nuevo servicio de backoffice
      if (codigoMunicipio) {
        this.backofficeAdminService.getZonasPorMunicipio(codigoMunicipio).subscribe({
          next: (resp: any) => {
            this.dataZones = resp.zonas || resp || [];
            resolve();
          },
          error: (error: any) => {
            this.dataZones = [];
            reject(error);
          }
        });
      } else {
        resolve();
      }
    });
  }

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }

}
