import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from '../../../services/alert/alert.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-editar-coordinador',
  templateUrl: './editar-coordinador.component.html',
  styleUrls: ['./editar-coordinador.component.scss']
})
export class EditarCoordinadorComponent implements OnInit {

  dataZones: any = [];
  dataStations: any = [];
  idCoordinador: any;
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
    zona: [[], Validators.required],
    puestos: [[]],
  });

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute,
    private router: Router, private fb: FormBuilder, private customValidator: CustomValidationService, private alertService: AlertService,private localData: LocalDataService) { }

  ngOnInit() {
    this.getCoordinador();
    this.getZonesSupervisor();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

  }

  getSelectedValue(item: any) {
    this.updateForm.patchValue({
      puestos: [],
    });
    if (item) {
      this.getStationsSupervisor()
    } else {
      this.dataStations = [];
    }
  }

  onSubmit() {
    console.log(this.updateForm.value)
    if (!this.updateFormControl['email'].errors?.['email'] || !this.updateFormControl['email'].errors?.['invalidEmail']) {
      if (this.updateForm.valid) {
        this.apiService.updateCoordinador(this.idCoordinador, this.updateForm.value).subscribe((resp: any) => {

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

  getZonesSupervisor() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
      this.getStationsSupervisor();
    })
  }

  getStationsSupervisor() {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      if (this.updateFormControl['zona'].value) {
        this.dataStations = resp.filter((dataStation: any) => dataStation.codigo_zona_votacion == this.updateFormControl['zona'].value);
      }
    })
  }

  getCoordinador() {
    this.idCoordinador = this.localData.decryptIdUser(this.activatedRoute.snapshot.params['id']);
    this.apiService.getCoordinador(this.idCoordinador).subscribe((resp: any) => {
      const { coordinador, puestos_asignados, zonas_asignadas } = resp;

      console.log(resp)

      this.updateForm.get('nombres')?.setValue(coordinador.nombres);
      this.updateForm.get('apellidos')?.setValue(coordinador.apellidos);
      this.updateForm.get('genero_id')?.setValue(coordinador.genero_id);
      this.updateForm.get('email')?.setValue(coordinador.email);
      this.updateForm.get('password')?.setValue(coordinador.password);
      this.updateForm.get('tipo_documento_id')?.setValue(coordinador.tipo_documento_id);
      this.updateForm.get('numero_documento')?.setValue(coordinador.numero_documento);
      this.updateForm.get('telefono')?.setValue(coordinador.telefono);
      this.updateForm.get('puestos')?.setValue(this.getCodeMunicipals(puestos_asignados));
      this.updateForm.get('zona')?.setValue(this.getCodeMunicipals(zonas_asignadas)[0]);
     
    })
  }

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }

}
