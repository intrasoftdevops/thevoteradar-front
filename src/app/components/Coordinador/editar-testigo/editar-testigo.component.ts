import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';

@Component({
  selector: 'app-editar-testigo',
  templateUrl: './editar-testigo.component.html',
  styleUrls: ['./editar-testigo.component.scss']
})
export class EditarTestigoComponent implements OnInit {

  dataStations: any = [];
  dataTables: any = [];
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  selectedDepartment: string = '';
  selectedMunicipal: any = [];
  selectedZone: any = [];
  isAdmin: boolean = false;
  loadingMunicipios: boolean = false;
  loadingZonas: boolean = false;
  loadingPuestos: boolean = false;
  loadingMesas: boolean = false;
  idTestigo: any;
  subscriber: any;
  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: [''],
    puesto: [null], // Opcional
    mesas: [null], // Opcional
  });

  loading: boolean = false;
  testigoLoaded: boolean = false;

  constructor(
    private apiService: ApiService, 
    private activatedRoute: ActivatedRoute,
    private router: Router, 
    private fb: FormBuilder, 
    private customValidator: CustomValidationService, 
    private alertService: AlertService, 
    private localData: LocalDataService,
    private backofficeAdminService: BackofficeAdminService
  ) { }

  ngOnInit() {
    // Verificar si el usuario es admin
    const rol = this.localData.getRol();
    this.isAdmin = rol === '1' || rol === 'admin';
    
    this.loading = true;
    
    if (this.isAdmin) {
      // Si es admin, cargar departamentos asignados
      this.getDepartmentAdmin();
    } else {
      // Si es coordinador, cargar puestos directamente
      this.getStationsTestigo();
    }
  }

  getSelectedValue(item: any) {
    // Este método se usa solo para coordinadores (flujo directo puesto -> mesas)
    const codigo = this.getCode(item);
    this.updateForm.patchValue({
      mesas: [],
    });
    if (codigo) {
      // Cargar mesas del puesto seleccionado
      this.apiService.getTablesTestigo().subscribe({
        next: (resp: any) => {
          this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == codigo);
        },
        error: (error: any) => {
          this.dataTables = [];
        }
      });
    } else {
      this.dataTables = [];
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  onSubmit() {
    if (!this.updateFormControl['email'].errors?.['email'] || !this.updateFormControl['email'].errors?.['invalidEmail']) {
      if (this.updateForm.valid) {
        const formValue = this.updateForm.value;
        const testigoData: any = {
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          email: formValue.email,
          numero_documento: formValue.numero_documento,
          telefono: formValue.telefono
        };
        
        if (formValue.password) {
          testigoData.password = formValue.password;
        }
        
        if (formValue.puesto) {
          testigoData.puesto = formValue.puesto;
        }
        
        if (Array.isArray(formValue.mesas) && formValue.mesas.length > 0) {
          testigoData.mesas = formValue.mesas;
        }
        
        this.backofficeAdminService.updateTestigo(this.idTestigo, testigoData).subscribe({
          next: (resp: any) => {
            this.alertService.successAlert(resp.message || resp.res || 'Testigo actualizado correctamente');
          },
          error: (error: any) => {
            let errorMessage = 'Error al actualizar el testigo';
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

  getTestigo() {
    if (this.testigoLoaded) {
      return;
    }
    
    const encryptedId = this.activatedRoute.snapshot.params['id'];
    this.idTestigo = this.localData.decryptIdUser(encryptedId);
    
    if (!this.idTestigo || this.idTestigo.trim() === '' || this.idTestigo === encryptedId) {
      this.loading = false;
      this.alertService.errorAlert('Error: No se pudo obtener el ID del testigo. Por favor, intente nuevamente.');
      this.router.navigate(['/panel/usuarios/testigos']);
      return;
    }
    
    this.testigoLoaded = true;
    
    this.backofficeAdminService.getTestigo(this.idTestigo).subscribe({
      next: (resp: any) => {
        const testigo = resp.testigo || resp;
        
        if (!testigo) {
          this.loading = false;
          this.alertService.errorAlert('Error: No se pudo encontrar el testigo con el ID proporcionado.');
          setTimeout(() => {
            this.router.navigate(['/panel/usuarios/testigos']);
          }, 2000);
          return;
        }
        
        this.updateForm.get('nombres')?.setValue(testigo.nombres || '');
        this.updateForm.get('apellidos')?.setValue(testigo.apellidos || '');
        this.updateForm.get('email')?.setValue(testigo.email || '');
        this.updateForm.get('password')?.setValue(testigo.password || '');
        this.updateForm.get('numero_documento')?.setValue(testigo.numero_documento || '');
        const telefono = testigo.telefono || testigo.phone || '';
        this.updateForm.get('telefono')?.setValue(telefono.toString());
        
        // Cargar puesto asignado y pre-seleccionar jerarquía si es admin
        if (testigo.puesto && testigo.puesto.codigo_unico) {
          if (this.isAdmin) {
            // Si es admin, pre-seleccionar toda la jerarquía
            // Necesitamos obtener la jerarquía del puesto desde el backend
            // Por ahora, solo pre-seleccionar el puesto
            this.updateForm.get('puesto')?.setValue(testigo.puesto.codigo_unico);
            this.loadMesasAndSelectAssigned(testigo.puesto.codigo_unico, testigo.mesas || []);
          } else {
            // Si es coordinador, solo seleccionar el puesto
            this.updateForm.get('puesto')?.setValue(testigo.puesto.codigo_unico);
            this.loadMesasAndSelectAssigned(testigo.puesto.codigo_unico, testigo.mesas || []);
          }
        } else {
          this.updateForm.get('puesto')?.setValue(null);
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.loading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar el testigo.';
        this.alertService.errorAlert(errorMessage);
        setTimeout(() => {
          this.router.navigate(['/panel/usuarios/testigos']);
        }, 2000);
      }
    });
  }

  getStationsTestigo() {
    this.apiService.getStationsTestigo().subscribe({
      next: (resp: any) => {
        this.dataStations = resp || [];
        // Después de cargar puestos, cargar el testigo
        this.getTestigo();
      },
      error: (error: any) => {
        this.dataStations = [];
        this.loading = false;
        this.alertService.errorAlert('Error al cargar los puestos.');
      }
    });
  }

  getTablesTestigo() {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      if (this.updateFormControl['puesto'].value) {
        this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == this.updateFormControl['puesto'].value);
      }
    })
  }

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }

  // Métodos para el flujo de admin (departamento -> municipio -> zona -> puesto)
  getDepartmentAdmin() {
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
        // Después de cargar departamentos, cargar el testigo
        this.getTestigo();
      },
      error: (error: any) => {
        this.dataDepartments = [];
        this.loading = false;
        this.alertService.errorAlert('Error al cargar los departamentos.');
      }
    });
  }

  getSelectedDepartment(item: any) {
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.updateForm.patchValue({
      puesto: null,
      mesas: []
    });
    if (item) {
      // item puede ser un objeto con codigo_unico o directamente el código
      const codigoDepartamento = typeof item === 'string' ? item : (item.codigo_unico || item);
      this.getMunicipalAdmin(codigoDepartamento);
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getMunicipalAdmin(codigoDepartamento: string) {
    this.loadingMunicipios = true;
    this.dataMunicipals = [];
    this.backofficeAdminService.getMunicipiosAdmin(codigoDepartamento).subscribe({
      next: (resp: any) => {
        this.dataMunicipals = resp.municipios || resp || [];
        this.loadingMunicipios = false;
      },
      error: (error: any) => {
        this.dataMunicipals = [];
        this.loadingMunicipios = false;
      }
    });
  }

  getSelectedMunicipal(codigoMunicipio: any) {
    // codigoMunicipio puede ser un string o un objeto
    const codigo = typeof codigoMunicipio === 'string' ? codigoMunicipio : (codigoMunicipio?.codigo_unico || codigoMunicipio);
    
    this.selectedZone = [];
    this.updateForm.patchValue({
      puesto: null,
      mesas: []
    });
    if (codigo) {
      this.getZonasyGerentes(codigo);
    } else {
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getZonasyGerentes(codigoMunicipio: string) {
    if (codigoMunicipio) {
      this.loadingZonas = true;
      this.dataZones = [];
      this.backofficeAdminService.getZonasPorMunicipio(codigoMunicipio).subscribe({
        next: (resp: any) => {
          this.dataZones = resp.zonas || resp || [];
          this.loadingZonas = false;
        },
        error: (error: any) => {
          this.dataZones = [];
          this.loadingZonas = false;
        }
      });
    }
  }

  getSelectedZone(codigoZona: any) {
    // codigoZona puede ser un string o un objeto
    const codigo = typeof codigoZona === 'string' ? codigoZona : (codigoZona?.codigo_unico || codigoZona);
    
    this.updateForm.patchValue({
      puesto: null,
      mesas: []
    });
    if (codigo) {
      this.getPuestosySupervisores(codigo);
    } else {
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getPuestosySupervisores(codigoZona: string) {
    if (codigoZona) {
      this.loadingPuestos = true;
      this.dataStations = [];
      this.backofficeAdminService.getPuestosPorZona(codigoZona).subscribe({
        next: (resp: any) => {
          this.dataStations = resp.puestos || resp || [];
          this.loadingPuestos = false;
        },
        error: (error: any) => {
          this.dataStations = [];
          this.loadingPuestos = false;
        }
      });
    }
  }

  getSelectedStation(codigoPuesto: any) {
    // codigoPuesto puede ser un string o un objeto
    const codigo = typeof codigoPuesto === 'string' ? codigoPuesto : (codigoPuesto?.codigo_unico || codigoPuesto);
    
    this.updateForm.patchValue({
      mesas: []
    });
    if (codigo) {
      this.getTablesTestigoForPuesto(codigo);
    } else {
      this.dataTables = [];
    }
  }

  getTablesTestigoForPuesto(codigoPuesto: string) {
    if (codigoPuesto) {
      this.loadingMesas = true;
      this.dataTables = [];
      this.backofficeAdminService.getMesasPorPuesto(codigoPuesto).subscribe({
        next: (resp: any) => {
          this.dataTables = resp.mesas || resp || [];
          this.loadingMesas = false;
        },
        error: (error: any) => {
          this.dataTables = [];
          this.loadingMesas = false;
        }
      });
    }
  }

  /**
   * Carga las mesas de un puesto y pre-selecciona las mesas asignadas
   */
  loadMesasAndSelectAssigned(codigoPuesto: string, mesasAsignadas: any[]) {
    if (!codigoPuesto) {
      return;
    }

    
    this.loadingMesas = true;
    this.dataTables = [];
    
    // Si es admin, usar getMesasPorPuesto, si es coordinador usar getTablesTestigo
    if (this.isAdmin) {
      this.backofficeAdminService.getMesasPorPuesto(codigoPuesto).subscribe({
        next: (resp: any) => {
          this.dataTables = resp.mesas || resp || [];
          this.loadingMesas = false;
          
          // Pre-seleccionar las mesas asignadas
          this.selectAssignedMesas(mesasAsignadas);
        },
        error: (error: any) => {
          this.dataTables = [];
          this.loadingMesas = false;
        }
      });
    } else {
      // Para coordinador, usar getTablesTestigo
      this.apiService.getTablesTestigo().subscribe({
        next: (resp: any) => {
          this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == codigoPuesto);
          this.loadingMesas = false;
          
          // Pre-seleccionar las mesas asignadas
          this.selectAssignedMesas(mesasAsignadas);
        },
        error: (error: any) => {
          this.dataTables = [];
          this.loadingMesas = false;
        }
      });
    }
  }

  /**
   * Pre-selecciona las mesas asignadas en el formulario
   */
  selectAssignedMesas(mesasAsignadas: any[]) {
    if (!mesasAsignadas || !Array.isArray(mesasAsignadas) || mesasAsignadas.length === 0) {
      this.updateForm.get('mesas')?.setValue([]);
      return;
    }

    if (!this.dataTables || this.dataTables.length === 0) {
      // Esperar un poco más si las mesas aún no están cargadas
      setTimeout(() => {
        this.selectAssignedMesas(mesasAsignadas);
      }, 500);
      return;
    }


    // Mapear las mesas asignadas a los objetos completos de dataTables
    const mesasToSelect: string[] = [];
    
    for (const mesaAsignada of mesasAsignadas) {
      const codigoUnico = mesaAsignada.codigo_unico;
      
      // Buscar la mesa en dataTables por codigo_unico
      const mesaCompleta = this.dataTables.find((mesa: any) => mesa.codigo_unico === codigoUnico);
      
      if (mesaCompleta) {
        mesasToSelect.push(codigoUnico);
      } else {
        // Si no se encuentra, usar directamente el código único
        // Esto puede pasar si la mesa fue eliminada o no está disponible
        mesasToSelect.push(codigoUnico);
      }
    }

    this.updateForm.get('mesas')?.setValue(mesasToSelect);
  }

}
