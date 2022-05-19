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
  dataTables: any = [];
  updateFormGerente: FormGroup = this.fb.group({
    rol: [null],
    departamento: [null],
    municipios: [null],
  });
  updateFormSupervisor: FormGroup = this.fb.group({
    rol: [null],
    departamento: [null],
    municipio: [null],
    zonas: [null],
  });
  updateFormCoordinador: FormGroup = this.fb.group({
    rol: [null],
    departamento: [null],
    municipio: [null],
    zona: [null],
    puestos: [null],
  });
  updateFormTestigo: FormGroup = this.fb.group({
    rol: [null],
    departamento: [null],
    municipio: [null],
    zona: [null],
    puesto: [null],
    mesas: [null],
  });
  subscriber: any;
  idGerente: any;
  rolActual: any;

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

  get updateFormControlGerente() {
    return this.updateFormGerente.controls;
  }

  get updateFormControlSupervisor() {
    return this.updateFormSupervisor.controls;
  }

  getGerente() {
    this.idGerente = this.localData.decryptIdUser(this.activatedRoute.snapshot.params['id']);
    this.apiService.getGerente(this.idGerente).subscribe((resp: any) => {

      const { gerente, municipios_asignados, departamentos_asignados } = resp;
      this.rolActual = gerente.rol_id;
      this.updateFormGerente.get('rol')?.setValue(gerente.rol_id);
      this.updateFormGerente.get('municipios')?.setValue(this.getCodeMunicipals(municipios_asignados));
      this.updateFormGerente.get('departamento')?.setValue(this.getCodeMunicipals(departamentos_asignados)[0]);

    })
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
      this.getMunicipalAdmin();
    })
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      if (this.updateFormControlGerente['departamento'].value) {
        this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == this.updateFormControlGerente['departamento'].value);
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
