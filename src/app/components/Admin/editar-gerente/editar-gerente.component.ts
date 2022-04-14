import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
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

  dropdownSettingsMunicipal: IDropdownSettings = {};
  dropdownSettingsDepartment: IDropdownSettings = {};
  dataDepartments: any = [];
  dataMunicipals: any = [];
  municipioAssign: any = [];
  departmentAssign: any = [];
  assignedItems: any = [];
  dataFiltered: any = [];

  idGerente: any;
  subscriber: any;

  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: ['', Validators.required],
    tipo_documento_id: ['', Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.compose([Validators.required, this.customValidator.patternValidator()])],
    municipios: [[]],
  });
  submitted = false;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute,
    private router: Router, private fb: FormBuilder, private customValidator: CustomValidationService, private alertService: AlertService) { }

  ngOnInit() {

    this.getGerente();
    this.getDepartmentAdmin();
    this.getMunicipalAdmin();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

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
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }

  get updateFormControl() {
    return this.updateForm.controls;
  }

  onSubmit() {
    console.log(this.updateForm.value)
    this.updateForm.patchValue({
      municipios: this.getCodeMunicipals(),
    });
    this.submitted = true;
    if (this.updateForm.valid) {
      console.log(this.updateForm.value)
      this.apiService.updateGerente(this.idGerente, this.updateForm.value).subscribe((resp: any) => {

        this.alertService.successAlert(resp.res);
      }, (err: any) => {
        this.alertService.errorAlert(err.message);
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  onItemSelect(item: any) {
    this.municipioAssign = [];
    this.dataFiltered = [];
    this.dataFiltered = this.dataMunicipals.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == item.codigo_unico);
    console.log(this.dataFiltered);
  }

  onItemDeSelect(item: any) {
    this.municipioAssign = [];
    this.dataFiltered = [];
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    })
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {

      this.dataMunicipals = resp;

      if (this.departmentAssign.length > 0) {
        this.dataFiltered = this.dataMunicipals.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == this.departmentAssign[0].codigo_unico);
      }

    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    });
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }

  getGerente() {
    this.idGerente = this.activatedRoute.snapshot.params['id'];
    this.apiService.getGerente(this.idGerente).subscribe((resp: any) => {

      const { gerente, municipios_asignados, departamentos_asignados } = resp;

      this.updateForm.get('nombres')?.setValue(gerente.nombres);
      this.updateForm.get('apellidos')?.setValue(gerente.apellidos);
      this.updateForm.get('genero_id')?.setValue(gerente.genero_id);
      this.updateForm.get('email')?.setValue(gerente.email);
      this.updateForm.get('password')?.setValue(gerente.password);
      this.updateForm.get('tipo_documento_id')?.setValue(gerente.tipo_documento_id);
      this.updateForm.get('numero_documento')?.setValue(gerente.numero_documento);
      this.updateForm.get('telefono')?.setValue(gerente.telefono);
      this.municipioAssign = municipios_asignados;
      this.departmentAssign = departamentos_asignados;

    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    })
  }

  getCodeMunicipals() {
    return this.municipioAssign.map((selectedMunicipal: any) => {
      const { codigo_unico } = selectedMunicipal;
      return codigo_unico;
    });
  }

}
