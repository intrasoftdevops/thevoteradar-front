import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-editar-testigo',
  templateUrl: './editar-testigo.component.html',
  styleUrls: ['./editar-testigo.component.scss']
})
export class EditarTestigoComponent implements OnInit {

  dataStations: any = [];
  dataTables: any = [];
  idTestigo: any;
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
    puesto: [[], Validators.required],
    mesas: [[]],
  });

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute,
    private router: Router, private fb: FormBuilder, private customValidator: CustomValidationService, private alertService: AlertService, private localData: LocalDataService) { }

  ngOnInit() {
    this.getTestigo();
    this.getStationsTestigo();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

  }

  getSelectedValue(item: any) {
    this.updateForm.patchValue({
      mesas: [],
    });
    if (item) {
      this.getTablesTestigo()
    } else {
      this.dataTables = [];
    }
  }

  onSubmit() {
    console.log(this.updateForm.value)
    if (!this.updateFormControl['email'].errors?.['email'] || !this.updateFormControl['email'].errors?.['invalidEmail']) {
      if (this.updateForm.valid) {

        this.apiService.updateTestigo(this.idTestigo, this.updateForm.value).subscribe((resp: any) => {

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

  getTestigo() {
    this.idTestigo = this.localData.decryptIdUser(this.activatedRoute.snapshot.params['id']);
    this.apiService.getTestigo(this.idTestigo).subscribe((resp: any) => {
      const { testigo, puestos_asignados, mesas_asignadas } = resp;

      this.updateForm.get('nombres')?.setValue(testigo.nombres);
      this.updateForm.get('apellidos')?.setValue(testigo.apellidos);
      this.updateForm.get('genero_id')?.setValue(testigo.genero_id);
      this.updateForm.get('email')?.setValue(testigo.email);
      this.updateForm.get('password')?.setValue(testigo.password);
      this.updateForm.get('tipo_documento_id')?.setValue(testigo.tipo_documento_id);
      this.updateForm.get('numero_documento')?.setValue(testigo.numero_documento);
      this.updateForm.get('telefono')?.setValue(testigo.telefono);
      this.updateForm.get('mesas')?.setValue(this.getCodeMunicipals(mesas_asignadas));
      this.updateForm.get('puesto')?.setValue(this.getCodeMunicipals(puestos_asignados)[0]);

    })
  }

  getStationsTestigo() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
      this.getTablesTestigo();
    })
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

}
