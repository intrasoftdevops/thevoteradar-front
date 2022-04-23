import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidationService } from '../../../services/custom-validation.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-editar-gerente',
  templateUrl: './editar-gerente.component.html',
  styleUrls: ['./editar-gerente.component.scss']
})
export class EditarGerenteComponent implements OnInit {

  showLoading:boolean = false;
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
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: [''],
    departamento: [[],Validators.required],
    municipios: [[]],
  });
  submitted = false;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute,
    private router: Router, private fb: FormBuilder, private customValidator: CustomValidationService, private alertService: AlertService) { }

  ngOnInit() {

    this.getGerente();
    this.getDepartmentAdmin();
    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

  }

  getSelectedValue(item: any) {
    this.updateForm.patchValue({
      municipios: [],
    });
    if (item) {
      this.getMunicipalAdmin()
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
    if (!this.updateFormControl['email'].errors?.['email'] || !this.updateFormControl['email'].errors?.['invalidEmail']) {
      if (this.updateForm.valid) {
        this.showLoading = true;
        console.log(this.updateForm.value)
        this.apiService.updateGerente(this.idGerente, this.updateForm.value).subscribe((resp: any) => {
          this.showLoading = false;

          this.alertService.successAlert(resp.res);

        }, (err: any) => {
          console.log(err);
          this.alertService.errorAlert(err.message);
        })
      } else {
        this.showLoading = false;
        this.alertService.errorAlert("Llene los campos obligatorios.");
      }
    }
  }

  getDepartmentAdmin() {
    this.showLoading = true;
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.showLoading = false;
      this.dataDepartments = resp;
      this.getMunicipalAdmin();
    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    })
  }

  getMunicipalAdmin() {
    this.showLoading = true;
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.showLoading = false;

      if (this.updateFormControl['departamento'].value) {
        this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == this.updateFormControl['departamento'].value);
      }

    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    });
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }

  getGerente() {
    this.showLoading = true;
    this.idGerente = this.activatedRoute.snapshot.params['id'];
    this.apiService.getGerente(this.idGerente).subscribe((resp: any) => {
      this.showLoading = false;

      const { gerente, municipios_asignados, departamentos_asignados } = resp;

      this.updateForm.get('nombres')?.setValue(gerente.nombres);
      this.updateForm.get('apellidos')?.setValue(gerente.apellidos);
      this.updateForm.get('genero_id')?.setValue(gerente.genero_id);
      this.updateForm.get('email')?.setValue(gerente.email);
      this.updateForm.get('password')?.setValue(gerente.password);
      this.updateForm.get('tipo_documento_id')?.setValue(gerente.tipo_documento_id);
      this.updateForm.get('numero_documento')?.setValue(gerente.numero_documento);
      this.updateForm.get('telefono')?.setValue(gerente.telefono);
      this.updateForm.get('municipios')?.setValue(this.getCodeMunicipals(municipios_asignados));
      this.updateForm.get('departamento')?.setValue(this.getCodeMunicipals(departamentos_asignados)[0]);

    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    })
  }

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }

}
