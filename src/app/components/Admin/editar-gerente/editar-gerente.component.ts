import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from '../../../services/alert/alert.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
@Component({
  selector: 'app-editar-gerente',
  templateUrl: './editar-gerente.component.html',
  styleUrls: ['./editar-gerente.component.scss'],
})
export class EditarGerenteComponent implements OnInit, OnDestroy {
  dataDepartments: any = [];
  dataMunicipals: any = [];

  idGerente: any;
  loading: boolean = false;
  saving: boolean = false;
  gerenteLoaded: boolean = false; // Flag para evitar múltiples cargas

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
    municipios: [null], // Opcional
  });
  submitted = false;

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
    // Primero cargar los departamentos, luego el gerente
    this.getDepartmentAdmin();
  }

  getSelectedValue(item: any) {
    this.updateForm.patchValue({
      municipios: [],
    });
    if (item && item.codigo_unico) {
      this.getMunicipalAdmin(item.codigo_unico);
    } else {
      this.dataMunicipals = [];
    }
  }

  get updateFormControl() {
    return this.updateForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    if (
      !this.updateFormControl['email'].errors?.['email'] ||
      !this.updateFormControl['email'].errors?.['invalidEmail']
    ) {
      if (this.updateForm.valid) {
        this.saving = true;
        // Transformar los datos del formulario al formato esperado por el backend
        const formValue = this.updateForm.value;
        const gerenteData: any = {
          email: formValue.email,
          numero_documento: formValue.numero_documento.toString(),
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          telefono: formValue.telefono ? formValue.telefono.toString() : null,
        };
        
        // Solo incluir password si se proporcionó
        if (formValue.password && formValue.password.trim() !== '') {
          gerenteData.password = formValue.password;
        }
        
        // Solo incluir departamento y municipios si fueron seleccionados
        if (formValue.departamento) {
          gerenteData.departamento = formValue.departamento;
        }
        
        if (Array.isArray(formValue.municipios) && formValue.municipios.length > 0) {
          gerenteData.municipios = formValue.municipios;
        }
        
        // Usar el nuevo servicio de backoffice
        this.backofficeAdminService
          .updateGerente(this.idGerente, gerenteData)
          .subscribe({
            next: (resp: any) => {
              this.saving = false;
              this.alertService.successAlert(resp.message || resp.res || 'Gerente actualizado correctamente');
              // Redirigir a la lista de gerentes
              this.router.navigate(['/panel/usuarios/gerentes']);
            },
            error: (error: any) => {
              this.saving = false;
              let errorMessage = 'Error al actualizar el gerente';
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
        // Después de cargar departamentos, cargar el gerente
        this.getGerente();
      },
      error: (error: any) => {
        this.dataDepartments = [];
        this.loading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar los departamentos.';
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

  getMunicipalAdmin(codigoDepartamento?: string) {
    // Obtener el código del departamento del formulario o del parámetro
    const departamentoCodigo: string | undefined = codigoDepartamento || (this.updateFormControl['departamento'].value ? String(this.updateFormControl['departamento'].value) : undefined);
    
    if (!departamentoCodigo) {
      this.dataMunicipals = [];
      this.loading = false;
      return;
    }
    
    // Usar el nuevo servicio de backoffice con el código del departamento
    this.backofficeAdminService.getMunicipiosAdmin(departamentoCodigo).subscribe({
      next: (resp: any) => {
        this.dataMunicipals = resp.municipios || resp || [];
        this.loading = false;
      },
      error: (error: any) => {
        this.dataMunicipals = [];
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    // No hay suscripción que limpiar
  }

  getGerente() {
    // Evitar múltiples llamadas simultáneas
    if (this.gerenteLoaded) {
      return;
    }
    
    const encryptedId = this.activatedRoute.snapshot.params['id'];
    
    this.idGerente = this.localData.decryptIdUser(encryptedId);
    
    // Verificar que el ID desencriptado sea válido
    if (!this.idGerente || this.idGerente.trim() === '' || this.idGerente === encryptedId) {
      this.loading = false;
      this.alertService.errorAlert('Error: No se pudo obtener el ID del gerente. Por favor, intente nuevamente.');
      this.router.navigate(['/panel/usuarios/gerentes']);
      return;
    }
    
    this.gerenteLoaded = true; // Marcar como cargado para evitar duplicados
    
    // Usar el endpoint específico para obtener un gerente por ID
    this.backofficeAdminService.getGerente(this.idGerente).subscribe({
      next: (resp: any) => {
        const gerente = resp.gerente || resp;
        
        if (!gerente) {
          this.loading = false;
          this.alertService.errorAlert('Error: No se pudo encontrar el gerente con el ID proporcionado.');
          setTimeout(() => {
            this.router.navigate(['/panel/usuarios/gerentes']);
          }, 2000);
          return;
        }
        
        // Obtener municipios y departamentos del gerente
        const municipios_asignados = gerente.municipios || [];
        
        // Extraer departamentos únicos de los municipios
        const departamentosUnicos = Array.from(new Set(
          municipios_asignados
            .filter((m: any) => m && m.codigo_departamento_votacion)
            .map((m: any) => String(m.codigo_departamento_votacion))
        )) as string[];
        
        // Llenar el formulario
        this.updateForm.get('nombres')?.setValue(gerente.nombres || '');
        this.updateForm.get('apellidos')?.setValue(gerente.apellidos || '');
        this.updateForm.get('email')?.setValue(gerente.email || '');
        this.updateForm.get('password')?.setValue(gerente.password || '');
        this.updateForm.get('numero_documento')?.setValue(gerente.numero_documento || '');
        this.updateForm.get('telefono')?.setValue(gerente.telefono || '');
        
        // Establecer municipios
        if (municipios_asignados && municipios_asignados.length > 0) {
          this.updateForm.get('municipios')?.setValue(this.getCodeMunicipals(municipios_asignados));
          
          // Establecer departamento: usar el primero de los departamentos únicos encontrados
          if (departamentosUnicos.length > 0) {
            const departamentoCodigo: string = departamentosUnicos[0];
            this.updateForm.get('departamento')?.setValue(departamentoCodigo);
            // Cargar municipios después de establecer el departamento
            this.getMunicipalAdmin(departamentoCodigo);
          } else {
            this.loading = false;
          }
        } else {
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.loading = false;
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar el gerente.';
        this.alertService.errorAlert(errorMessage);
        setTimeout(() => {
          this.router.navigate(['/panel/usuarios/gerentes']);
        }, 2000);
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
