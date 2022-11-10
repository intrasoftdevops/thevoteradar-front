import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-testigo',
  templateUrl: './crear-testigo.component.html',
  styleUrls: ['./crear-testigo.component.scss'],
})
export class CrearTestigoComponent implements OnInit {
  dataStations: any = [];
  dataTables: any = [];
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
    puesto: [[], Validators.required],
    mesas: [[]],
  });

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private customValidator: CustomValidationService
  ) {}

  ngOnInit() {
    this.getStationsTestigo();
  }

  getSelectedValue(item: any) {
    this.createForm.patchValue({
      mesas: [],
    });
    if (item) {
      const puesto = { puesto: item.codigo_unico };
      this.getTablesTestigo(puesto);
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
        this.apiService
          .createTestigo(this.createForm.value)
          .subscribe((resp: any) => {
            this.alertService.successAlert(resp.message);
          });
      } else {
        this.alertService.errorAlert('Llene los campos obligatorios.');
      }
    }
  }

  getStationsTestigo() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
    });
  }

  getTablesTestigo(data: any) {
    this.apiService.getMesasSinAsignar(data).subscribe((resp: any) => {
      this.dataTables = resp;
    });
  }
}
