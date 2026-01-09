import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
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
export class EditarGerenteComponent implements OnInit {
  dataDepartments: any = [];
  dataMunicipals: any = [];

  idGerente: any;
  subscriber: any;

  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: ['', Validators.required],
    tipo_documento_id: ['', Validators.required],
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
    departamento: [[], Validators.required],
    municipios: [[]],
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
    this.getGerente();
    this.getDepartmentAdmin();
    this.subscriber = this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event) => {
        window.location.reload();
      });
  }

  getSelectedValue(item: any) {
    this.updateForm.patchValue({
      municipios: [],
    });
    if (item) {
      this.getMunicipalAdmin();
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
        // Usar el nuevo servicio de backoffice
        this.backofficeAdminService
          .updateGerente(this.idGerente, this.updateForm.value)
          .subscribe({
            next: (resp: any) => {
              this.alertService.successAlert(resp.message || resp.res || 'Gerente actualizado correctamente');
            },
            error: (error: any) => {
              const errorMessage = error.error?.detail || error.error?.message || 'Error al actualizar el gerente';
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
        this.getMunicipalAdmin();
      },
      error: (error: any) => {
        this.dataDepartments = [];
      }
    });
  }

  getMunicipalAdmin() {
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getMunicipiosAdmin().subscribe({
      next: (resp: any) => {
        const municipios = resp.municipios || resp || [];
        if (this.updateFormControl['departamento'].value) {
          this.dataMunicipals = municipios.filter(
            (dataMunicipal: any) =>
              dataMunicipal.codigo_departamento_votacion ==
              this.updateFormControl['departamento'].value
          );
        }
      },
      error: (error: any) => {
        this.dataMunicipals = [];
      }
    });
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }

  getGerente() {
    const encryptedId = this.activatedRoute.snapshot.params['id'];
    
    this.idGerente = this.localData.decryptIdUser(encryptedId);
    
    // Verificar que el ID desencriptado sea válido
    if (!this.idGerente || this.idGerente.trim() === '' || this.idGerente === encryptedId) {
      this.alertService.errorAlert('Error: No se pudo obtener el ID del gerente. Por favor, intente nuevamente.');
      this.router.navigate(['/panel/usuarios/gerentes']);
      return;
    }
    
    // El endpoint /admin/get-gerente/{id} no existe, usar el método de obtener desde lista
    this.backofficeAdminService.getGerentesMunicipioAsignado().subscribe({
      next: (resp: any) => {
        const { gerentes_asignados, gerentes_no_asignados } = resp;
        const allGerentes = [...(gerentes_asignados || []), ...(gerentes_no_asignados || [])];
        
        // Buscar el gerente por ID (probar tanto 'id' como '_id')
        const gerente = allGerentes.find((g: any) => {
          return g.id === this.idGerente || 
                 g._id === this.idGerente || 
                 String(g.id) === String(this.idGerente) || 
                 String(g._id) === String(this.idGerente);
        });
        
        if (gerente) {
          
          // Obtener municipios y departamentos del gerente
          const municipios_asignados = gerente.municipios || [];
          
          // Extraer departamentos únicos de los municipios
          const departamentosUnicos = [...new Set(
            municipios_asignados
              .filter((m: any) => m && m.codigo_departamento_votacion)
              .map((m: any) => m.codigo_departamento_votacion)
          )];
          
          // Llenar el formulario
          this.updateForm.get('nombres')?.setValue(gerente.nombres);
          this.updateForm.get('apellidos')?.setValue(gerente.apellidos);
          this.updateForm.get('genero_id')?.setValue(gerente.genero_id);
          this.updateForm.get('email')?.setValue(gerente.email);
          this.updateForm.get('password')?.setValue(gerente.password || '');
          this.updateForm.get('tipo_documento_id')?.setValue(gerente.tipo_documento_id);
          this.updateForm.get('numero_documento')?.setValue(gerente.numero_documento);
          this.updateForm.get('telefono')?.setValue(gerente.telefono);
          
          // Establecer municipios
          if (municipios_asignados && municipios_asignados.length > 0) {
            this.updateForm.get('municipios')?.setValue(this.getCodeMunicipals(municipios_asignados));
            
            // Establecer departamento: usar el primero de los departamentos únicos encontrados
            if (departamentosUnicos.length > 0) {
              this.updateForm.get('departamento')?.setValue(departamentosUnicos[0]);
              // Cargar municipios después de establecer el departamento
              this.getMunicipalAdmin();
            }
          }
        } else {
          this.alertService.errorAlert('Error: No se pudo encontrar el gerente con el ID proporcionado.');
          setTimeout(() => {
            this.router.navigate(['/panel/usuarios/gerentes']);
          }, 2000);
        }
      },
      error: (error: any) => {
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
