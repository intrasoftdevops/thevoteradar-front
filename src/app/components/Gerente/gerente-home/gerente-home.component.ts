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
  municipio_asignado = "";
  departamento_asignado = "";

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/bNU_d8rei4k");
  }

  ngOnInit() {
    this.getGerente();
  }

  getGerente(){
    this.apiService.getGerente(this.localData.getId()).subscribe((resp: any) => {
      console.log(resp);

      this.municipio_asignado = resp.municipio.nombre;

      this.departamento_asignado = resp.departamento.nombre_departamento_votacion;
      
    });
  }

}
