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
    municipio: [null], // Opcional
    zonas: [null], // Opcional
  });

  loading: boolean = false;
  supervisorLoaded: boolean = false;

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
    this.getMunicipalSupervisor();
  }

  getSelectedValue(item: any) {
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
            this.alertService.successAlert(resp.message || resp.res || 'Supervisor actualizado correctamente');
          },
          error: (error: any) => {
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
        const supervisor = resp.supervisor || resp;
        
        if (!supervisor) {
          this.loading = false;
          this.alertService.errorAlert('Error: No se pudo encontrar el supervisor con el ID proporcionado.');
          setTimeout(() => {
            this.router.navigate(['/panel/usuarios/supervisores']);
          }, 2000);
          return;
        }
        
        this.updateForm.get('nombres')?.setValue(supervisor.nombres || '');
        this.updateForm.get('apellidos')?.setValue(supervisor.apellidos || '');
        this.updateForm.get('email')?.setValue(supervisor.email || '');
        this.updateForm.get('password')?.setValue(supervisor.password || '');
        this.updateForm.get('numero_documento')?.setValue(supervisor.numero_documento || '');
        this.updateForm.get('telefono')?.setValue(supervisor.telefono || '');
        
        // Establecer municipio y zonas
        if (supervisor.municipio && supervisor.municipio.codigo_unico) {
          this.updateForm.get('municipio')?.setValue(supervisor.municipio.codigo_unico);
          this.getZoneSupervisor();
        }
        
        if (supervisor.zonas && Array.isArray(supervisor.zonas) && supervisor.zonas.length > 0) {
          const zonasCodigos = supervisor.zonas.map((z: any) => z.codigo_unico);
          this.updateForm.get('zonas')?.setValue(zonasCodigos);
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

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }

}
