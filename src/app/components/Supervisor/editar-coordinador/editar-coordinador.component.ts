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
  dataZones: any = [];
  dataStations: any = [];
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
    zona: [null], // Opcional
    puestos: [null], // Opcional
  });

  loading: boolean = false;
  coordinadorLoaded: boolean = false;

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
    this.getZonesSupervisor();
  }

  getSelectedValue(item: any) {
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
            this.alertService.successAlert(resp.message || resp.res || 'Coordinador actualizado correctamente');
          },
          error: (error: any) => {
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
        const coordinador = resp.coordinador || resp;
        
        if (!coordinador) {
          this.loading = false;
          this.alertService.errorAlert('Error: No se pudo encontrar el coordinador con el ID proporcionado.');
          setTimeout(() => {
            this.router.navigate(['/panel/usuarios/coordinadores']);
          }, 2000);
          return;
        }
        
        this.updateForm.get('nombres')?.setValue(coordinador.nombres || '');
        this.updateForm.get('apellidos')?.setValue(coordinador.apellidos || '');
        this.updateForm.get('email')?.setValue(coordinador.email || '');
        this.updateForm.get('password')?.setValue(coordinador.password || '');
        this.updateForm.get('numero_documento')?.setValue(coordinador.numero_documento || '');
        this.updateForm.get('telefono')?.setValue(coordinador.telefono || '');
        
        // Establecer zona y puestos
        if (coordinador.zona && coordinador.zona.codigo_unico) {
          this.updateForm.get('zona')?.setValue(coordinador.zona.codigo_unico);
          this.getStationsSupervisor();
        }
        
        if (coordinador.puestos && Array.isArray(coordinador.puestos) && coordinador.puestos.length > 0) {
          const puestosCodigos = coordinador.puestos.map((p: any) => p.codigo_unico);
          this.updateForm.get('puestos')?.setValue(puestosCodigos);
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

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }
}
