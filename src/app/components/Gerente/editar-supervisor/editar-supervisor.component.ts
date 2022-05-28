import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
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
    genero_id: ['', Validators.required],
    tipo_documento_id: ['', Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: [''],
    municipio: [[], Validators.required],
    zonas: [[]],
  });

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute,
    private router: Router, private fb: FormBuilder, private customValidator: CustomValidationService, private alertService: AlertService,private localData: LocalDataService) { }

  ngOnInit(): void {
    this.getSupervisor();
    this.getMunicipalSupervisor();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

  }

  getSelectedValue(item: any) {
    this.updateForm.patchValue({
      zonas: [],
    });
    if (item) {
      this.getZoneSupervisor()
    } else {
      this.dataZones = [];
    }
  }

  onSubmit() {
    if (!this.updateFormControl['email'].errors?.['email'] || !this.updateFormControl['email'].errors?.['invalidEmail']) {
      if (this.updateForm.valid) {
        this.apiService.updateSupervisor(this.idSupervisor, this.updateForm.value).subscribe((resp: any) => {

          this.alertService.successAlert(resp.res);

        })
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
    this.apiService.getMunicipalGerente().subscribe((resp: any) => {
      this.dataMunicipals = resp;
      this.getZoneSupervisor();
    })
  }

  getZoneSupervisor() {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      if (this.updateFormControl['municipio'].value) {
        this.dataZones = resp.filter((dataZone: any) => dataZone.codigo_municipio_votacion == this.updateFormControl['municipio'].value);
      }
    });
  }

  getSupervisor() {
    this.idSupervisor = this.localData.decryptIdUser(this.activatedRoute.snapshot.params['id']);
    this.apiService.getSupervisor(this.idSupervisor).subscribe((resp: any) => {
      const { municipios_asignados, supervisor, zonas_asignadas } = resp;

      this.updateForm.get('nombres')?.setValue(supervisor.nombres);
      this.updateForm.get('apellidos')?.setValue(supervisor.apellidos);
      this.updateForm.get('genero_id')?.setValue(supervisor.genero_id);
      this.updateForm.get('email')?.setValue(supervisor.email);
      this.updateForm.get('password')?.setValue(supervisor.password);
      this.updateForm.get('tipo_documento_id')?.setValue(supervisor.tipo_documento_id);
      this.updateForm.get('numero_documento')?.setValue(supervisor.numero_documento);
      this.updateForm.get('telefono')?.setValue(supervisor.telefono);
      this.updateForm.get('zonas')?.setValue(this.getCodeMunicipals(zonas_asignadas));
      this.updateForm.get('municipio')?.setValue(this.getCodeMunicipals(municipios_asignados)[0]);

    })
  }

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }

}
