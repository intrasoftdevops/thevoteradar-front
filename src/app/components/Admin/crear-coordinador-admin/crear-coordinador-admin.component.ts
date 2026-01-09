import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-coordinador-admin',
  templateUrl: './crear-coordinador-admin.component.html',
  styleUrls: ['./crear-coordinador-admin.component.scss'],
})
export class CrearCoordinadorAdminComponent implements OnInit {
  loading: boolean = false;
  dataZones: any = [];
  dataStations: any = [];
  dataFiltered: any = [];
  dataDepartments: any = [];
  dataMunicipals: any = [];
  selectedMunicipal: any = [];

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
    zona: [null], // Opcional - puede asignarse después
    puestos: [null], // Opcional - puede asignarse después
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

  getSelectedDepartment(codigoDepartamento: any) {
    this.selectedMunicipal = [];
    this.createFormControl['zona'].reset();
    this.createFormControl['puestos'].reset();

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
    this.createFormControl['zona'].reset();
    this.createFormControl['puestos'].reset();

    // Normalizar municipio (string o objeto con codigo_unico)
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
    this.createFormControl['puestos'].reset();

    // Normalizar zona (string o objeto con codigo_unico)
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
        const coordinadorData: any = {
          email: formValue.email,
          numero_documento: formValue.numero_documento.toString(),
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          telefono: formValue.telefono ? formValue.telefono.toString() : null,
        };
        
        // Solo incluir zona y puestos si fueron seleccionados
        if (formValue.zona) {
          coordinadorData.zona = formValue.zona;
        }
        
        if (Array.isArray(formValue.puestos) && formValue.puestos.length > 0) {
          coordinadorData.puestos = formValue.puestos;
        }
        
        this.backofficeAdminService
          .createCoordinador(coordinadorData)
          .subscribe({
            next: (resp: any) => {
              this.loading = false;
              this.alertService.successAlert(resp.message || 'Coordinador creado correctamente');
              // Redirigir a la lista de coordinadores
              this.router.navigate(['/panel/usuarios/coordinadores']);
            },
            error: (error: any) => {
              this.loading = false;
              let errorMessage = 'Error al crear el coordinador';
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

  getMunicipalAdmin(codigoDepartamento: string | any) {
    // Usar el nuevo servicio de backoffice, pasando el código del departamento
    // codigoDepartamento puede llegar como string o como objeto desde el select
    const codigo =
      typeof codigoDepartamento === 'string'
        ? codigoDepartamento
        : codigoDepartamento?.codigo_unico || codigoDepartamento;

    this.backofficeAdminService.getMunicipiosAdmin(codigo).subscribe({
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
