import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { LocalDataService } from 'src/app/services/localData/local-data.service';

@Component({
  selector: 'app-gerente-home',
  templateUrl: './gerente-home.component.html',
  styleUrls: ['./gerente-home.component.scss']
})
export class GerenteHomeComponent implements OnInit {
  safeURL: any;
  departamento_asignado = "";
  municipio_asignado = [];

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/bNU_d8rei4k");
  }

  ngOnInit() {
    this.getGerente();
  }

  getGerente(){
    this.apiService.getGerente(this.localData.getId()).subscribe((resp: any) => {
      
      this.departamento_asignado = resp.departamentos_asignados[0].nombre_departamento_votacion;

      this.municipio_asignado = resp.municipios_asignados.map((municipios: any) => " " + municipios.nombre);
      console.log(this.municipio_asignado);
      
    });
  }

}
