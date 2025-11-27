import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-testigo-home',
  templateUrl: './testigo-home.component.html',
  styleUrls: ['./testigo-home.component.scss']
})
export class TestigoHomeComponent implements OnInit {

  videos: string[] = ["https:
  sanitizedVideos!: SafeResourceUrl[];
  mesas_asignadas = []
  puesto_asignado = ""
  zona_asignada = ""
  municipio_asignado = ""
  departamento_asignado = ""

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.sanitizedVideos = this.videos.map(video => this._sanitizer.bypassSecurityTrustResourceUrl(video));
  }
  ngOnInit() {
    this.getTestigo()
  }

  getTestigo(){
    this.apiService.getTestigo(this.localData.getId()).subscribe((resp: any) => {
      this.mesas_asignadas = resp.mesas_asignadas.map((mesa: any) => mesa.numero_mesa);

      this.puesto_asignado = resp.puestos_asignados.nombre

      this.zona_asignada = resp.zona.nombre

      this.municipio_asignado = resp.municipio.nombre

      this.departamento_asignado = resp.departamento.nombre_departamento_votacion

    })
  }

}
