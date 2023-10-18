import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { LocalDataService } from 'src/app/services/localData/local-data.service';

@Component({
  selector: 'app-supervisor-home',
  templateUrl: './supervisor-home.component.html',
  styleUrls: ['./supervisor-home.component.scss'],
})
export class SupervisorHomeComponent implements OnInit {
  safeURL: any;
  zona_asignada = "";
  municipio_asignado = "";
  departamento_asignado = "";

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/bNU_d8rei4k'
    );
  }

  ngOnInit(){
    this.getSupervisor();
  }

  getSupervisor(){
    this.apiService.getCoordinador(this.localData.getId()).subscribe((resp: any) => {

      console.log(resp);

      this.zona_asignada = resp.zonas_asignadas.nombre;

      this.municipio_asignado = resp.municipio.nombre;

      this.departamento_asignado = resp.departamento.nombre_departamento_votacion;

    })
  }
}
