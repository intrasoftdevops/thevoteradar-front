import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-cambiar-rol-gerente',
  templateUrl: './cambiar-rol-gerente.component.html',
  styleUrls: ['./cambiar-rol-gerente.component.scss']
})
export class CambiarRolGerenteComponent implements OnInit {

  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  createForm: FormGroup = this.fb.group({
    departamentos: [null],
    municipios: [null],
    zonas: [null],
    puestos: [null],
  });
  subscriber: any;
  idGerente: any;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private localData: LocalDataService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.getGerente();
    this.getDepartmentAdmin();
    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  getGerente() {
    this.idGerente = this.localData.decryptIdUser(this.activatedRoute.snapshot.params['id']);
    this.apiService.getGerente(this.idGerente).subscribe((resp: any) => {

      const { gerente, municipios_asignados, departamentos_asignados } = resp;
      console.log(this.getCodeMunicipals(departamentos_asignados)[0])
      console.log(this.getCodeMunicipals(municipios_asignados))
      this.createForm.get('municipios')?.setValue(this.getCodeMunicipals(municipios_asignados));
      this.createForm.get('departamentos')?.setValue(this.getCodeMunicipals(departamentos_asignados)[0]);

    })
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      console.log(resp)
      this.dataDepartments = resp;
      console.log(resp)
      this.getMunicipalAdmin();
    })
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      console.log(resp)
      if (this.createFormControl['departamentos'].value) {
        this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == this.createFormControl['departamentos'].value);
        console.log(this.dataMunicipals)
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
