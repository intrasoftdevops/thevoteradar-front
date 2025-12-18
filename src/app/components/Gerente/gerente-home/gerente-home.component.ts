import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { LocalDataService } from 'src/app/services/localData/local-data.service';

@Component({
  selector: 'app-gerente-home',
  templateUrl: './gerente-home.component.html',
  styleUrls: ['./gerente-home.component.scss']
})
export class GerenteHomeComponent implements OnInit {
  videos: string[] = [];
  sanitizedVideos!: SafeResourceUrl[];
  departamento_asignado = "";
  municipio_asignado: string[] = [];

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.sanitizedVideos = this.videos.map(video => this._sanitizer.bypassSecurityTrustResourceUrl(video));
  }

  ngOnInit() {
    this.getGerente();
  }

  getGerente(){
    this.apiService.getGerente(this.localData.getId()).subscribe((resp: any) => {
      if (resp.departamentos_asignados && resp.departamentos_asignados.length > 0) {
        this.departamento_asignado = resp.departamentos_asignados[0].nombre_departamento_votacion || '';
      } else {
        this.departamento_asignado = '';
      }

      if (resp.municipios_asignados && Array.isArray(resp.municipios_asignados)) {
        this.municipio_asignado = resp.municipios_asignados.map((municipio: any) => municipio.nombre || '').filter((municipio: string) => municipio !== '');
      } else {
        this.municipio_asignado = [];
      }
    }, (error) => {
      console.error('Error al obtener datos del gerente:', error);
      this.departamento_asignado = '';
      this.municipio_asignado = [];
    });
  }
}
