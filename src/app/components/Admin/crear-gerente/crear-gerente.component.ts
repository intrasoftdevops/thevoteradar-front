import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidationService } from '../../../services/custom-validation.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-crear-gerente',
  templateUrl: './crear-gerente.component.html',
  styleUrls: ['./crear-gerente.component.scss']
})
export class CrearGerenteComponent implements OnInit {

  selectedMunicipals: any = [];
  dropdownSettingsDepartment: IDropdownSettings = {};
  dropdownSettingsMunicipal: IDropdownSettings = {};
  dataMunicipals: any = [];
  dataDepartments: any = [];
  dataFiltered: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: ['', Validators.required],
    tipo_documento_id: ['', Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.compose([Validators.required, this.customValidator.patternValidator()])],
    municipios: [[]],
  }
  )
  submitted = false;

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit() {
    this.getDepartmentAdmin();
    this.dropdownSettingsDepartment = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: true,
      idField: 'codigo_unico',
      textField: 'nombre_departamento_votacion',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
    this.dropdownSettingsMunicipal = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  onSubmit() {
    this.createForm.patchValue({
      municipios: this.getCodeMunicipals(),
    });
    this.submitted = true;
    if (this.createForm.valid) {
      console.log(this.createForm.value)
      this.apiService.createGerente(this.createForm.value).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      }, (err: any) => {
        this.alertService.errorAlert(err.message);
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  onItemSelectDepartment(item: any) {
    this.dataFiltered = [];
    this.selectedMunicipals = [];
    this.getMunicipalAdmin(item.codigo_unico)

  }

  onItemDeSelectDepartment() {
    this.dataFiltered = [];
    this.selectedMunicipals = [];
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    })
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataFiltered = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == data);
    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    });
  }

  getCodeMunicipals() {
    return this.selectedMunicipals.map((selectedMunicipal: any) => {
      const { codigo_unico } = selectedMunicipal;
      return codigo_unico;
    });
  }

}
