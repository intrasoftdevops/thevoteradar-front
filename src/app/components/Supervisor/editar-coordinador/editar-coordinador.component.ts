import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from '../../../services/alert/alert.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-editar-coordinador',
  templateUrl: './editar-coordinador.component.html',
  styleUrls: ['./editar-coordinador.component.scss'],
})
export class EditarCoordinadorComponent implements OnInit {
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  selectedMunicipal: any = [];
  idCoordinador: any;
  subscriber: any;
  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        this.customValidator.patternValidator(),
      ],
    ],
    password: [''],
    departamento: [null], // Opcional
    municipio: [null], // Opcional
    zona: [null], // Opcional
    puestos: [null], // Opcional
  });

  loading: boolean = false;
  saving: boolean = false;
  coordinadorLoaded: boolean = false;
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
  ) {}

  ngOnInit() {
    this.loading = true;

    // Determinar si es admin (backoffice) o supervisor
    const rol = this.localData.getRol();
    this.isAdmin = rol === '1' || rol === 'admin';

    // Para admin, primero cargamos departamentos y luego el coordinador (flujo cascada).
    // Para supervisor, usamos los endpoints legacy (ApiService) para zonas y puestos.
    if (this.isAdmin) {
      this.getDepartmentAdmin();
    } else {
      this.getZonesSupervisor();
    }
  }

  getSelectedDepartment(codigoDepartamento: any) {
    this.selectedMunicipal = [];
    this.updateFormControl['zona'].reset();
    this.updateFormControl['puestos'].reset();

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
      this.dataStations = [];
    }
  }

  getSelectedMunicipal(codigoMunicipio: any) {
    this.updateFormControl['zona'].reset();
    this.updateFormControl['puestos'].reset();

    // En ng-select, el (change) puede enviar el objeto completo o el código; normalizamos
    const codigo =
      typeof codigoMunicipio === 'string'
        ? codigoMunicipio
        : codigoMunicipio?.codigo_unico || codigoMunicipio;

    if (codigo) {
      this.getZonasyGerentes(codigo);
    } else {
      this.dataZones = [];
      this.dataStations = [];
    }
  }

  getSelectedZone(codigoZona: any) {
    this.updateFormControl['puestos'].reset();

    // Normalizar: string o objeto con codigo_unico
    const codigo =
      typeof codigoZona === 'string'
        ? codigoZona
        : codigoZona?.codigo_unico || codigoZona;

    if (codigo) {
      this.getPuestosySupervisores(codigo);
    } else {
      this.dataStations = [];
    }
  }

  getSelectedValue(item: any) {
    // Método legacy para supervisor
    this.updateForm.patchValue({
      puestos: [],
    });
    if (item) {
      this.getStationsSupervisor();
    } else {
      this.dataStations = [];
    }
  }

  onSubmit() {
    if (
      !this.updateFormControl['email'].errors?.['email'] ||
      !this.updateFormControl['email'].errors?.['invalidEmail']
    ) {
      if (this.updateForm.valid) {
        this.saving = true;
        const formValue = this.updateForm.value;
        const coordinadorData: any = {
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          email: formValue.email,
          numero_documento: formValue.numero_documento,
          telefono: formValue.telefono
        };
        
        if (formValue.password) {
          coordinadorData.password = formValue.password;
        }
        
        if (formValue.zona) {
          coordinadorData.zona = formValue.zona;
        }
        
        if (Array.isArray(formValue.puestos) && formValue.puestos.length > 0) {
          coordinadorData.puestos = formValue.puestos;
        }
        
        this.backofficeAdminService.updateCoordinador(this.idCoordinador, coordinadorData).subscribe({
          next: (resp: any) => {
            this.saving = false;
            this.alertService.successAlert(resp.message || resp.res || 'Coordinador actualizado correctamente');
            // Redirigir a la lista de coordinadores
            this.router.navigate(['/panel/usuarios/coordinadores']);
          },
          error: (error: any) => {
            this.saving = false;
            let errorMessage = 'Error al actualizar el coordinador';
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

  get updateFormControl() {
    return this.updateForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  getZonesSupervisor() {
    // Solo aplica para el flujo de SUPERVISOR (legacy).
    this.apiService.getZonesSupervisor().subscribe({
      next: (resp: any) => {
        this.dataZones = resp || [];
        // Después de cargar zonas, cargar el coordinador
        this.getCoordinador();
      },
      error: (error: any) => {
        this.dataZones = [];
        this.loading = false;
        this.alertService.errorAlert('Error al cargar las zonas.');
      }
    });
  }

  getStationsSupervisor() {
    const zonaCodigo = this.updateFormControl['zona'].value;
    if (!zonaCodigo) {
      this.dataStations = [];
      return;
    }
    
    this.apiService.getStationsCoordinador().subscribe({
      next: (resp: any) => {
        if (Array.isArray(resp)) {
          this.dataStations = resp.filter(
            (dataStation: any) => {
              const codigoZona = dataStation.codigo_zona_votacion || dataStation.codigo_unico;
              return codigoZona && codigoZona.toString() == zonaCodigo.toString();
            }
          );
        } else {
          this.dataStations = [];
        }
      },
      error: (error: any) => {
        this.dataStations = [];
      }
    });
  }

  getCoordinador() {
    if (this.coordinadorLoaded) {
      return;
    }
    
    const encryptedId = this.activatedRoute.snapshot.params['id'];
    this.idCoordinador = this.localData.decryptIdUser(encryptedId);
    
    if (!this.idCoordinador || this.idCoordinador.trim() === '' || this.idCoordinador === encryptedId) {
      this.loading = false;
      this.alertService.errorAlert('Error: No se pudo obtener el ID del coordinador. Por favor, intente nuevamente.');
      this.router.navigate(['/panel/usuarios/coordinadores']);
      return;
    }
    
    this.coordinadorLoaded = true;
    
    this.backofficeAdminService.getCoordinador(this.idCoordinador).subscribe({
      next: (resp: any) => {
        // La respuesta puede venir como { coordinador: {...} } o directamente como objeto
        const coordinador = resp.coordinador || resp.data || resp;
        
        if (!coordinador) {
          this.loading = false;
          this.alertService.errorAlert('Error: No se pudo encontrar el coordinador con el ID proporcionado.');
          setTimeout(() => {
            this.router.navigate(['/panel/usuarios/coordinadores']);
          }, 2000);
          return;
        }
        
        // Cargar datos básicos del coordinador
        // El backend devuelve: nombres, apellidos, numero_documento, telefono, email
        const nombres = coordinador.nombres || coordinador.name || '';
        const apellidos = coordinador.apellidos || coordinador.lastname || coordinador.last_name || '';
        const numeroDocumento = coordinador.numero_documento || coordinador.document_number || coordinador.documento || '';
        const telefono = coordinador.telefono || coordinador.phone || '';
        const email = coordinador.email || '';
        
        // Asignar valores al formulario usando patchValue para asegurar que se asignen todos
        this.updateForm.patchValue({
          nombres: nombres,
          apellidos: apellidos,
          numero_documento: numeroDocumento,
          telefono: telefono,
          email: email,
          password: coordinador.password || ''
        });

        if (this.isAdmin) {
          // FLUJO ADMIN (backoffice): cargar departamento -> municipio -> zona -> puestos
          // Obtener departamento y municipio de la zona si existe
          if (coordinador.zona) {
            // La zona tiene información del municipio y departamento
            const zona = coordinador.zona;
            let codigoDepartamento: string | null = null;
            let codigoMunicipio: string | null = null;

            if (zona.codigo_departamento_votacion) {
              codigoDepartamento = zona.codigo_departamento_votacion;
            } else if (zona.municipio?.codigo_departamento_votacion) {
              codigoDepartamento = zona.municipio.codigo_departamento_votacion;
            }

            if (zona.codigo_municipio_votacion) {
              codigoMunicipio = zona.codigo_municipio_votacion;
            } else if (zona.municipio?.codigo_unico) {
              codigoMunicipio = zona.municipio.codigo_unico;
            }

            if (codigoDepartamento) {
              this.updateForm.get('departamento')?.setValue(codigoDepartamento);
              // Cargar municipios del departamento
              this.getMunicipalAdmin(codigoDepartamento).then(() => {
                if (codigoMunicipio) {
                  this.updateForm.get('municipio')?.setValue(codigoMunicipio);
                  // Cargar zonas del municipio
                  this.getZonasyGerentes(codigoMunicipio).then(() => {
                    // Establecer la zona
                    if (zona.codigo_unico) {
                      this.updateForm.get('zona')?.setValue(zona.codigo_unico);
                      // Cargar puestos de la zona
                      this.getPuestosySupervisores(zona.codigo_unico).then(() => {
                        // Establecer los puestos asignados
                        if (coordinador.puestos && Array.isArray(coordinador.puestos) && coordinador.puestos.length > 0) {
                          const puestosCodigos = coordinador.puestos
                            .filter((p: any) => !!p?.codigo_unico)
                            .map((p: any) => p.codigo_unico);
                          this.updateForm.get('puestos')?.setValue(puestosCodigos);
                        }
                        this.loading = false;
                      });
                    } else {
                      this.loading = false;
                    }
                  });
                } else {
                  this.loading = false;
                }
              });
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
          }
        } else {
          // FLUJO SUPERVISOR (legacy): se apoya en los catálogos de ApiService
          if (coordinador.zona && coordinador.zona.codigo_unico) {
            this.updateForm.get('zona')?.setValue(coordinador.zona.codigo_unico);
            this.getStationsSupervisor();
          }

          if (coordinador.puestos && Array.isArray(coordinador.puestos) && coordinador.puestos.length > 0) {
            const puestosCodigos = coordinador.puestos.map((p: any) => p.codigo_unico);
            this.updateForm.get('puestos')?.setValue(puestosCodigos);
          }
        }

        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar el coordinador.';
        this.alertService.errorAlert(errorMessage);
        setTimeout(() => {
          this.router.navigate(['/panel/usuarios/coordinadores']);
        }, 2000);
      }
    });
  }

  getDepartmentAdmin() {
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
        // Después de cargar departamentos, cargar el coordinador
        this.getCoordinador();
      },
      error: (error: any) => {
        this.dataDepartments = [];
        this.loading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar los departamentos.';
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

  getMunicipalAdmin(codigoDepartamento: string | any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Usar el nuevo servicio de backoffice, pasando el código del departamento.
      // codigoDepartamento puede llegar como string o como objeto desde el formulario.
      const codigo =
        typeof codigoDepartamento === 'string'
          ? codigoDepartamento
          : codigoDepartamento?.codigo_unico || codigoDepartamento;

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

  getPuestosySupervisores(codigoZona: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Usar el nuevo servicio de backoffice
      if (codigoZona) {
        this.backofficeAdminService.getPuestosPorZona(codigoZona).subscribe({
          next: (resp: any) => {
            this.dataStations = resp.puestos || resp || [];
            resolve();
          },
          error: (error: any) => {
            this.dataStations = [];
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
