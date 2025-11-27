import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { LocalDataService } from 'src/app/services/localData/local-data.service';

@Component({
  selector: 'app-coordinador-home',
  templateUrl: './coordinador-home.component.html',
  styleUrls: ['./coordinador-home.component.scss']
})
export class CoordinadorHomeComponent implements OnInit {
  videos: string[] = ["https:
  sanitizedVideos!: SafeResourceUrl[];
  puestos_asignados = []
  zona_asignada = ""
  municipio_asignado = ""
  departamento_asignado = ""

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.sanitizedVideos = this.videos.map(video => this._sanitizer.bypassSecurityTrustResourceUrl(video));
  }

  ngOnInit() {
    this.getCoordinador()
    
  }

  getCoordinador(){
    this.apiService.getCoordinador(this.localData.getId()).subscribe((resp: any) => {

      console.log(resp)

      this.puestos_asignados = resp.puestos_asignados.map((puestos: any) => " " + puestos.nombre);
      console.log(this.puestos_asignados)

      this.zona_asignada = resp.zonas_asignadas.nombre

      this.municipio_asignado = resp.municipio.nombre

      this.departamento_asignado = resp.departamento.nombre_departamento_votacion

    })
  }

}
