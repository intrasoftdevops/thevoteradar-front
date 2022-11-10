import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { AlertService } from '../../../services/alert/alert.service';

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
  dataGerente: any = {};
  dataDepartmentGerente: any = [];
  dataMunicipalsGerente: any;
  updateForm: FormGroup = this.fb.group({
    nuevo_rol: [null],
  });
  updateFormSupervisor: FormGroup = this.fb.group({
    nuevo_rol: [null, Validators.required],
    departamento: [null, Validators.required],
    municipio: [null, Validators.required],
    zonas: [null],
  });
  updateFormCoordinador: FormGroup = this.fb.group({
    nuevo_rol: [null, Validators.required],
    departamento: [null, Validators.required],
    municipio: [null, Validators.required],
    zona: [null, Validators.required],
    puestos: [null],
  });
  updateFormTestigo: FormGroup = this.fb.group({
    nuevo_rol: [null, Validators.required],
    departamento: [null, Validators.required],
    municipio: [null, Validators.required],
    zona: [null, Validators.required],
    puesto: [null, Validators.required],
    mesas: [null],
  });
  subscriber: any;
  idGerente: any;
  rolActual: any;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private localData: LocalDataService, private activatedRoute: ActivatedRoute, private alertService: AlertService) { }

  ngOnInit(): void {
    this.getGerente();
    this.getDepartmentAdmin();
    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });
  }

  get updateFormControlSupervisor() {
    return this.updateFormSupervisor.controls;
  }

  get updateFormControlCoordinador() {
    return this.updateFormCoordinador.controls;
  }

  get updateFormControlTestigo() {
    return this.updateFormTestigo.controls;
  }

  onSubmit() {
    if (this.rolActual == 3) {
      if (this.updateFormSupervisor.valid) {
        delete this.updateFormSupervisor.value.departamento;
        console.log(this.updateFormSupervisor.value)
      } else {

        this.alertService.errorAlert("Llene los campos obligatorios.");
      }
    } else if (this.rolActual == 4) {
      if (this.updateFormCoordinador.valid) {
        delete this.updateFormCoordinador.value.departamento;
        delete this.updateFormCoordinador.value.municipio;
        console.log(this.updateFormCoordinador.value)
      } else {

        this.alertService.errorAlert("Llene los campos obligatorios.");
      }
    } else if (this.rolActual == 5) {
      if (this.updateFormTestigo.valid) {
        delete this.updateFormTestigo.value.departamento;
        delete this.updateFormTestigo.value.municipio;
        delete this.updateFormTestigo.value.zona;
        console.log(this.updateFormTestigo.value);
        this.apiService.changeRole(this.idGerente, this.updateFormTestigo.value).subscribe((resp: any) => {
          console.log(resp)
        })
      } else {

        this.alertService.errorAlert("Llene los campos obligatorios.");
      }
    }
  }

  getGerente() {
    this.idGerente = this.localData.decryptIdUser(this.activatedRoute.snapshot.params['id']);
    this.apiService.getGerente(this.idGerente).subscribe((resp: any) => {

      console.log(resp)

      const { gerente, departamentos_asignados, municipios_asignados } = resp;
      if (gerente) {
        this.dataGerente = gerente;
        this.dataDepartmentGerente = departamentos_asignados[0].nombre_departamento_votacion;
        if (municipios_asignados.length > 1) {
          let lastMunicipal = municipios_asignados.shift();
          this.dataMunicipalsGerente = municipios_asignados.map((resp: any) => resp.nombre).join(',') + " y " + lastMunicipal.nombre;
        } else {
          if (municipios_asignados.length > 0) {
            this.dataMunicipalsGerente = municipios_asignados[0].nombre;
          }
        }
      } else {
        this.router.navigate(['consultarGerente']);
      }

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
      if (this.updateFormControlSupervisor['departamento'].value && this.rolActual == 3) {
        this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == this.updateFormControlSupervisor['departamento'].value);
      } else if (this.updateFormControlCoordinador['departamento'].value && this.rolActual == 4) {
        this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == this.updateFormControlCoordinador['departamento'].value);
      } else if (this.updateFormControlTestigo['departamento'].value && this.rolActual == 5) {
        this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == this.updateFormControlTestigo['departamento'].value);
      }

    });
  }

  getZonas(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas } = resp;
      this.dataZones = zonas;
    })
  }

  getPuestos(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    })
  }

  getMesas(data: any) {
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      const { mesas } = resp;
      this.dataTables = mesas;
    })
  }

  getCodeMunicipals(data: any) {
    return data.map((seletedData: any) => {
      const { codigo_unico } = seletedData;
      return codigo_unico;
    });
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  getSelectedRol(item: any) {
    this.dataMunicipals = [];
    this.dataZones = [];
    this.dataStations = [];
    this.dataTables = [];
    //Supervisor
    this.updateFormControlSupervisor['departamento'].reset();
    this.updateFormControlSupervisor['municipio'].reset();
    this.updateFormControlSupervisor['zonas'].reset();
    //Coordinador
    this.updateFormControlCoordinador['departamento'].reset();
    this.updateFormControlCoordinador['municipio'].reset();
    this.updateFormControlCoordinador['zona'].reset();
    this.updateFormControlCoordinador['puestos'].reset();
    //Testigo
    this.updateFormControlTestigo['departamento'].reset();
    this.updateFormControlTestigo['municipio'].reset();
    this.updateFormControlTestigo['zona'].reset();
    this.updateFormControlTestigo['puesto'].reset();
    this.updateFormControlTestigo['mesas'].reset();
    if (item) {
      this.rolActual = item;
      this.updateFormSupervisor.get('nuevo_rol')?.setValue(item);
      this.updateFormCoordinador.get('nuevo_rol')?.setValue(item);
      this.updateFormTestigo.get('nuevo_rol')?.setValue(item);
      if (item == 2) {
        this.getGerente();
        this.getDepartmentAdmin();
      }
    } else {
      this.rolActual = null;
      this.updateForm.reset();
      this.updateFormSupervisor.reset();
      this.updateFormCoordinador.reset();
      this.updateFormTestigo.reset();
    }
  }

  getSelectedDepartment(item: any) {
    //Supervisor
    this.updateFormControlSupervisor['municipio'].reset();
    this.updateFormControlSupervisor['zonas'].reset();
    //Coordinador
    this.updateFormControlCoordinador['municipio'].reset();
    this.updateFormControlCoordinador['zona'].reset();
    this.updateFormControlCoordinador['puestos'].reset();
    //Testigo
    this.updateFormControlTestigo['municipio'].reset();
    this.updateFormControlTestigo['zona'].reset();
    this.updateFormControlTestigo['puesto'].reset();
    this.updateFormControlTestigo['mesas'].reset();
    if (item) {
      this.getMunicipalAdmin();
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedMunicipal(item: any) {
    //Supervisor
    this.updateFormControlSupervisor['zonas'].reset();
    //Coordinador
    this.updateFormControlCoordinador['zona'].reset();
    this.updateFormControlCoordinador['puestos'].reset();
    //Testigo
    this.updateFormControlTestigo['zona'].reset();
    this.updateFormControlTestigo['puesto'].reset();
    this.updateFormControlTestigo['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico }
      this.getZonas(data);
    } else {
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedZone(item: any) {
    //Coordinador
    this.updateFormControlCoordinador['puestos'].reset();
    //Testigo
    this.updateFormControlTestigo['puesto'].reset();
    this.updateFormControlTestigo['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getPuestos(data);
    } else {
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedStation(item: any) {
    //Testigo
    this.updateFormControlTestigo['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico }
      this.getMesas(data);
    } else {
      this.dataTables = [];
    }
  }

}
