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
  municipio_asignado = "";
  zona_asignada = [];

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnInit(){
    this.getSupervisor();
  }

  getSupervisor(){
    this.apiService.getSupervisor(this.localData.getId()).subscribe((resp: any) => {
      
      this.municipio_asignado = resp.municipios_asignados[0].nombre;

      this.zona_asignada = resp.zonas_asignadas.map((zonas: any) => " " + zonas.nombre);

    })
  }
}
