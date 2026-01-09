import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { LocalDataService } from 'src/app/services/localData/local-data.service';

@Component({
  selector: 'app-supervisor-home',
  templateUrl: './supervisor-home.component.html',
  styleUrls: ['./supervisor-home.component.scss'],
})
export class SupervisorHomeComponent implements OnInit {
  videos: string[] = [];
  sanitizedVideos!: SafeResourceUrl[];
  municipio_asignado = "";
  zona_asignada: string[] = [];

  constructor(private _sanitizer: DomSanitizer, private apiService: ApiService, private localData: LocalDataService) {
    this.sanitizedVideos = this.videos.map(video => this._sanitizer.bypassSecurityTrustResourceUrl(video));
  }

  ngOnInit(){
    this.getSupervisor();
  }

  getSupervisor(){
    this.apiService.getSupervisor(this.localData.getId()).subscribe((resp: any) => {
      if (resp.municipios_asignados && resp.municipios_asignados.length > 0) {
        this.municipio_asignado = resp.municipios_asignados[0].nombre || '';
      } else {
        this.municipio_asignado = '';
      }

      if (resp.zonas_asignadas && Array.isArray(resp.zonas_asignadas)) {
        this.zona_asignada = resp.zonas_asignadas.map((zona: any) => zona.nombre || '').filter((zona: string) => zona !== '');
      } else {
        this.zona_asignada = [];
      }
    }, (error) => {
      this.municipio_asignado = '';
      this.zona_asignada = [];
    });
  }
}
