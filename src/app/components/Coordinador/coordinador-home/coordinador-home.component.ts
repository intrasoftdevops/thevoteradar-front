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
  videos: string[] = [];
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
      // Manejar puestos asignados (el backend devuelve un array)
      if (resp.puestos_asignados && Array.isArray(resp.puestos_asignados)) {
        this.puestos_asignados = resp.puestos_asignados.map((puesto: any) => puesto.nombre || puesto);
      } else {
        this.puestos_asignados = [];
      }

      // Manejar zonas asignadas (el backend devuelve un array)
      if (resp.zonas_asignadas && Array.isArray(resp.zonas_asignadas) && resp.zonas_asignadas.length > 0) {
        // Tomar la primera zona asignada
        const primeraZona = resp.zonas_asignadas[0];
        this.zona_asignada = primeraZona.nombre || primeraZona.nombre_zona_votacion || '';
        
        // Intentar obtener municipio y departamento desde la zona
        if (primeraZona.codigo_municipio_votacion) {
          // El municipio y departamento no vienen directamente en la respuesta
          // Se pueden obtener desde la zona si está disponible
          this.municipio_asignado = primeraZona.municipio?.nombre || primeraZona.nombre_municipio || '';
          this.departamento_asignado = primeraZona.departamento?.nombre_departamento_votacion || primeraZona.nombre_departamento || '';
        }
      } else {
        this.zona_asignada = '';
      }

      // Si no se obtuvieron municipio y departamento desde la zona, intentar desde la respuesta directa
      if (!this.municipio_asignado && resp.municipio) {
        this.municipio_asignado = resp.municipio.nombre || resp.municipio.nombre_municipio_votacion || '';
      }

      if (!this.departamento_asignado && resp.departamento) {
        this.departamento_asignado = resp.departamento.nombre_departamento_votacion || resp.departamento.nombre || '';
      }

      // Si aún no hay datos, dejar vacío (se mostrará como string vacío en el template)
      if (!this.municipio_asignado) {
        this.municipio_asignado = '';
      }
      if (!this.departamento_asignado) {
        this.departamento_asignado = '';
      }
    }, (error) => {
      console.error('Error al obtener datos del coordinador:', error);
      this.zona_asignada = '';
      this.municipio_asignado = '';
      this.departamento_asignado = '';
      this.puestos_asignados = [];
    })
  }

}
