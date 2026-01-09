import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-testigo-admin',
  templateUrl: './crear-testigo-admin.component.html',
  styleUrls: ['./crear-testigo-admin.component.scss'],
})
export class CrearTestigoAdminComponent implements OnInit {
  dataStations: any = [];
  dataTables: any = [];
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  selectedMunicipal: any = [];
  selectedZone: any = [];

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
    puesto: [null], // Opcional - puede asignarse después
    mesas: [null], // Opcional - puede asignarse después
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
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.createFormControl['puesto'].reset();
    this.createFormControl['mesas'].reset();
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico);
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedMunicipal(codigoMunicipio: string) {
    this.selectedZone = [];
    this.createFormControl['puesto'].reset();
    this.createFormControl['mesas'].reset();
    if (codigoMunicipio) {
      // codigoMunicipio ya es el código único del municipio (bindValue)
      this.getZonasyGerentes(codigoMunicipio);
    } else {
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedZone(codigoZona: string) {
    this.createFormControl['puesto'].reset();
    this.createFormControl['mesas'].reset();
    if (codigoZona) {
      // codigoZona ya es el código único de la zona (bindValue)
      this.getPuestosySupervisores(codigoZona);
    } else {
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedStation(codigoPuesto: string) {
    this.createFormControl['mesas'].reset();
    if (codigoPuesto) {
      // codigoPuesto ya es el código único del puesto (bindValue)
      this.getTablesTestigo(codigoPuesto);
    } else {
      this.dataTables = [];
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
        const testigoData: any = {
          email: formValue.email,
          numero_documento: formValue.numero_documento.toString(),
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          telefono: formValue.telefono ? formValue.telefono.toString() : null,
        };
        
        // Solo incluir puesto y mesas si fueron seleccionados
        if (formValue.puesto) {
          testigoData.puesto = formValue.puesto;
        }
        
        if (Array.isArray(formValue.mesas) && formValue.mesas.length > 0) {
          testigoData.mesas = formValue.mesas;
        }
        
        this.backofficeAdminService
          .createTestigo(testigoData)
          .subscribe({
            next: (resp: any) => {
              this.alertService.successAlert(resp.message || 'Testigo creado correctamente');
              this.createForm.reset();
              this.dataMunicipals = [];
              this.dataZones = [];
              this.dataStations = [];
              this.dataTables = [];
            },
            error: (error: any) => {
              let errorMessage = 'Error al crear el testigo';
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

  getDepartmentAdmin() {
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
      },
      error: (error: any) => {
        this.dataDepartments = [];
      }
    });
  }

  getMunicipalAdmin(codigoDepartamento: string) {
    // Usar el nuevo servicio de backoffice, pasando el código del departamento
    this.backofficeAdminService.getMunicipiosAdmin(codigoDepartamento).subscribe({
      next: (resp: any) => {
        // El backend ya filtra por departamento, así que no necesitamos filtrar aquí
        this.dataMunicipals = resp.municipios || resp || [];
      },
      error: (error: any) => {
        this.dataMunicipals = [];
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
        }
      });
    }
  }

  getPuestosySupervisores(codigoZona: string) {
    // Usar el nuevo servicio de backoffice
    if (codigoZona) {
      this.backofficeAdminService.getPuestosPorZona(codigoZona).subscribe({
        next: (resp: any) => {
          this.dataStations = resp.puestos || resp || [];
        },
        error: (error: any) => {
          this.dataStations = [];
        }
      });
    }
  }

  getTablesTestigo(codigoPuesto: string) {
    // Usar el nuevo servicio de backoffice
    if (codigoPuesto) {
      this.backofficeAdminService.getMesasPorPuesto(codigoPuesto).subscribe({
        next: (resp: any) => {
          this.dataTables = resp.mesas || resp || [];
        },
        error: (error: any) => {
          this.dataTables = [];
        }
      });
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
